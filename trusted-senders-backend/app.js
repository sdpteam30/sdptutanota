// app.js — Express app factory. Takes a Supabase client so tests can inject a mock.
const express = require("express")
const cors = require("cors")

const VALID_STATUSES = [
	"confirmed",
	"denied",
	"added_to_trusted",
	"removed_from_trusted",
	"reported_phishing",
	"reported_impersonation",
	"reported_spam",
	"trusted_once",
	"email_opened",
]

const VALID_INTERACTION_TYPES = ["interacted", "auto_detected"]

// Map incoming /update-email-status `status` values to assignment_events.event_type.
// Only statuses that are meaningful as study timeline events are listed; others
// (e.g. "denied") are not mirrored into assignment_events.
const STATUS_TO_EVENT_TYPE = {
	email_opened: "email_opened",
	confirmed: "sender_confirmed",
	trusted_once: "sender_trusted_once",
	added_to_trusted: "sender_added_to_trusted",
	removed_from_trusted: "sender_removed_from_trusted",
	reported_phishing: "reported_phishing",
	reported_impersonation: "reported_impersonation",
	reported_spam: "reported_spam",
}

// Statuses that should terminally complete the assignment.
const TERMINAL_STATUSES = new Set(["reported_phishing", "reported_impersonation"])

function secondsToHms(totalSeconds) {
	const s = Math.max(0, Math.floor(totalSeconds))
	const hh = String(Math.floor(s / 3600)).padStart(2, "0")
	const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0")
	const ss = String(s % 60).padStart(2, "0")
	return `${hh}:${mm}:${ss}`
}

// Allow localhost and any IP address on port 9000 for network access
const allowedOriginPatterns = [
	/^http:\/\/localhost:9000$/,
	/^https?:\/\/localhost:9000$/,
	/^http:\/\/127\.0\.0\.1:9000$/,
	/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:9000$/,
]

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin) return callback(null, true)
		const isAllowed = allowedOriginPatterns.some((pattern) => pattern.test(origin))
		if (isAllowed) {
			callback(null, true)
		} else {
			console.log(`CORS blocked origin: ${origin}`)
			callback(new Error(`Not allowed by CORS: ${origin}`))
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Accept", "Authorization", "X-Requested-With"],
	exposedHeaders: ["Content-Type", "Authorization"],
}

function createApp(supabase) {
	const app = express()
	app.use(cors(corsOptions))
	app.use(express.json())

	// --- Assignment helpers ----------------------------------------------------

	// Look up an assignment either by assignment_id (fast path from the frontend)
	// or by email_subject matched against tasks.task_name (fallback). Since the
	// study may use a single shared user_id, we don't filter by username — the
	// unique task_name is the disambiguator.
	async function findAssignment({ assignment_id, email_subject }) {
		if (assignment_id != null) {
			const { data, error } = await supabase
				.from("assignments")
				.select(
					"assignment_id, user_id, username, task_id, sent_at, completed_at, stage, completion_type, tasks(task_id, task_name, is_phishing, phishing_type)",
				)
				.eq("assignment_id", assignment_id)
				.limit(1)
			if (error) {
				console.error("Supabase error finding assignment by id:", error.message)
				return null
			}
			if (!data || data.length === 0) return null
			const row = data[0]
			return {
				assignment_id: row.assignment_id,
				user_id: row.user_id,
				username: row.username,
				task_id: row.task_id,
				task_name: row.tasks?.task_name,
				is_phishing: row.tasks?.is_phishing,
				phishing_type: row.tasks?.phishing_type,
				sent_at: row.sent_at,
				completed_at: row.completed_at,
				stage: row.stage,
				completion_type: row.completion_type,
			}
		}

		if (!email_subject) return null
		const trimmedSubject = email_subject.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim()

		const { data: tasks, error: taskError } = await supabase
			.from("tasks")
			.select("task_id, task_name, is_phishing, phishing_type")
			.eq("task_name", trimmedSubject)
			.limit(1)
		if (taskError) {
			console.error("Supabase error finding task by subject:", taskError.message)
			return null
		}
		if (!tasks || tasks.length === 0) return null
		const task = tasks[0]

		const { data: assignments, error: assignError } = await supabase
			.from("assignments")
			.select("assignment_id, user_id, username, sent_at, completed_at, stage, completion_type")
			.eq("task_id", task.task_id)
			.is("completed_at", null)
			.order("sent_at", { ascending: false })
			.limit(1)
		if (assignError) {
			console.error("Supabase error finding assignment by task:", assignError.message)
			return null
		}
		if (!assignments || assignments.length === 0) return null
		const assignment = assignments[0]

		return {
			assignment_id: assignment.assignment_id,
			user_id: assignment.user_id,
			username: assignment.username,
			task_id: task.task_id,
			task_name: task.task_name,
			is_phishing: task.is_phishing,
			phishing_type: task.phishing_type,
			sent_at: assignment.sent_at,
			completed_at: assignment.completed_at,
			stage: assignment.stage,
			completion_type: assignment.completion_type,
		}
	}

	async function insertAssignmentEvent({ assignment, event_type, sender_email, source, metadata }) {
		const { error } = await supabase.from("assignment_events").insert({
			assignment_id: assignment.assignment_id,
			user_id: assignment.user_id,
			username: assignment.username,
			event_type,
			sender_email: sender_email || null,
			source,
			metadata: metadata || null,
		})
		if (error) {
			console.error("Supabase error inserting assignment_event:", error.message)
		}
	}

	// Append a line to the users.log_text column for the given user_id.
	async function appendUserLog(user_id, message) {
		if (!user_id) return
		const { data, error: readError } = await supabase.from("users").select("log_text").eq("id", user_id).limit(1).single()
		if (readError) {
			console.error("Supabase error reading user log:", readError.message)
			return
		}
		const currentLog = (data?.log_text || "").trimEnd()
		const timestamp = new Date().toISOString()
		const newLog = currentLog ? `${currentLog}\n[${timestamp}] ${message}` : `[${timestamp}] ${message}`

		const { error: updateError } = await supabase.from("users").update({ log_text: newLog }).eq("id", user_id)
		if (updateError) {
			console.error("Supabase error appending user log:", updateError.message)
		}
	}

	// Complete an assignment: set completed_at/time_taken/completion_type and log
	// a mirror event. No-ops if the assignment is already completed (idempotent).
	async function completeAssignment(assignment) {
		if (!assignment || assignment.completed_at) return

		const sentAt = assignment.sent_at ? new Date(assignment.sent_at) : null
		const completedAt = new Date()
		const elapsedSec = sentAt ? Math.floor((completedAt.getTime() - sentAt.getTime()) / 1000) : 0

		const { error } = await supabase
			.from("assignments")
			.update({
				completed_at: completedAt.toISOString(),
				time_taken: secondsToHms(elapsedSec),
				completion_type: "report_mail",
			})
			.eq("assignment_id", assignment.assignment_id)
			.is("completed_at", null)
		if (error) {
			console.error("Supabase error completing assignment:", error.message)
			return
		}

		await insertAssignmentEvent({
			assignment,
			event_type: "assignment_completed",
			source: "tutanota",
			metadata: { completion_type: "report_mail" },
		})

		await appendUserLog(
			assignment.user_id,
			`assignment_completed assignment_id=${assignment.assignment_id} task="${assignment.task_name}" completion_type=report_mail`,
		)
	}

	// ---------------------------------------------------------------------------

	app.post("/add-trusted", async (req, res) => {
		const { user_email, trusted_email, trusted_name = "", assignment_id, email_subject } = req.body
		if (!user_email || !trusted_email) {
			return res.status(400).json({ error: "Missing user_email or trusted_email" })
		}

		const normalizedUserEmail = user_email.toLowerCase().trim()
		const normalizedTrustedEmail = trusted_email.toLowerCase().trim()

		try {
			const { data, error } = await supabase
				.from("trusted_senders")
				.upsert({ user_email: normalizedUserEmail, trusted_email: normalizedTrustedEmail, trusted_name }, { onConflict: "user_email,trusted_email" })
				.select()

			if (error) {
				console.error("Supabase Error adding/updating trusted sender:", error.message)
				return res.status(500).json({ error: "Failed to add trusted sender." })
			}

			const assignment = await findAssignment({ assignment_id, email_subject })
			if (assignment && !assignment.completed_at) {
				await insertAssignmentEvent({
					assignment,
					event_type: "sender_added_to_trusted",
					sender_email: normalizedTrustedEmail,
					source: "tutanota",
				})
				await appendUserLog(
					assignment.user_id,
					`sender_added_to_trusted assignment_id=${assignment.assignment_id} task="${assignment.task_name}" sender="${normalizedTrustedEmail}"`,
				)
			}

			res.status(201).json({ message: "Trusted sender added/updated.", data: data[0] })
		} catch (err) {
			console.error("Error adding trusted sender:", err.message)
			res.status(500).json({ error: "Failed to add trusted sender." })
		}
	})

	app.post("/remove-trusted", async (req, res) => {
		const { user_email, trusted_email, assignment_id, email_subject } = req.body
		if (!user_email || !trusted_email) {
			return res.status(400).json({ error: "Missing user_email or trusted_email" })
		}
		try {
			const { error: trustedError } = await supabase.from("trusted_senders").delete().eq("user_email", user_email).eq("trusted_email", trusted_email)
			if (trustedError) {
				console.error("Supabase Error removing trusted sender:", trustedError.message)
				return res.status(500).json({ error: "Failed to remove trusted sender." })
			}
			const { error: statusError } = await supabase.from("email_sender_status").delete().eq("user_email", user_email).eq("sender_email", trusted_email)
			if (statusError) {
				console.error("Supabase Error removing statuses:", statusError.message)
				return res.status(500).json({ error: "Failed to remove email statuses." })
			}

			const assignment = await findAssignment({ assignment_id, email_subject })
			if (assignment && !assignment.completed_at) {
				await insertAssignmentEvent({
					assignment,
					event_type: "sender_removed_from_trusted",
					sender_email: trusted_email.toLowerCase().trim(),
					source: "tutanota",
				})
				await appendUserLog(
					assignment.user_id,
					`sender_removed_from_trusted assignment_id=${assignment.assignment_id} task="${assignment.task_name}" sender="${trusted_email}"`,
				)
			}

			res.json({ message: "Trusted sender and statuses removed." })
		} catch (err) {
			console.error("Error removing trusted sender:", err.message)
			res.status(500).json({ error: "Failed to remove trusted sender." })
		}
	})

	app.post("/reset-email-statuses", async (req, res) => {
		const { user_email, sender_email } = req.body
		if (!user_email || !sender_email) {
			return res.status(400).json({ error: "Missing user_email or sender_email" })
		}
		try {
			const { error, count } = await supabase.from("email_sender_status").delete().eq("user_email", user_email).eq("sender_email", sender_email)
			if (error) {
				console.error("Supabase Error resetting statuses:", error.message)
				return res.status(500).json({ error: "Failed to reset email statuses." })
			}
			res.json({ message: "Statuses reset successfully.", count })
		} catch (err) {
			console.error("Error resetting statuses:", err.message)
			res.status(500).json({ error: "Failed to reset email statuses." })
		}
	})

	app.get("/trusted-senders/:user_email", async (req, res) => {
		const { user_email } = req.params
		const normalizedUserEmail = user_email.toLowerCase().trim()
		try {
			const { data, error } = await supabase
				.from("trusted_senders")
				.select("trusted_email, trusted_name")
				.eq("user_email", normalizedUserEmail)
				.order("trusted_name", { ascending: true })
				.order("trusted_email", { ascending: true })
			if (error) {
				console.error("Supabase Error fetching trusted senders:", error.message)
				return res.status(500).json({ error: "Failed to retrieve trusted senders." })
			}
			const trustedSendersList = data.map((row) => ({ name: row.trusted_name || "", address: row.trusted_email }))
			res.json({ trusted_senders: trustedSendersList })
		} catch (err) {
			console.error("Error fetching trusted senders:", err.message)
			res.status(500).json({ error: "Failed to retrieve trusted senders." })
		}
	})

	app.post("/validate-sender-email", async (req, res) => {
		const { user_email, sender_name, sender_email } = req.body
		if (!user_email || !sender_name || !sender_email) {
			return res.status(400).json({ error: "Missing required fields" })
		}
		const normalizedUserEmail = user_email.toLowerCase().trim()
		const normalizedSenderEmail = sender_email.toLowerCase().trim()
		try {
			const { data, error } = await supabase
				.from("trusted_senders")
				.select("trusted_email")
				.eq("user_email", normalizedUserEmail)
				.eq("trusted_name", sender_name)
			if (error) {
				console.error("Supabase Error validating sender:", error.message)
				return res.status(500).json({ error: "Failed to validate sender." })
			}
			const matchingEmails = data.map((row) => row.trusted_email)
			const isValid = matchingEmails.includes(normalizedSenderEmail)
			res.json({
				valid: isValid,
				sender_name,
				sender_email,
				known_emails: data.map((row) => row.trusted_email),
			})
		} catch (err) {
			console.error("Error validating sender email:", err.message)
			res.status(500).json({ error: "Failed to validate sender email." })
		}
	})

	app.get("/email-status/:user_email/:email_id", async (req, res) => {
		const { user_email, email_id } = req.params
		try {
			const { data, error } = await supabase
				.from("email_sender_status")
				.select("sender_email, status")
				.eq("user_email", user_email)
				.eq("email_id", email_id)
				.single()
			if (error && error.code !== "PGRST116") {
				console.error("Supabase Error fetching email status:", error.message)
				return res.status(500).json({ error: "Failed to retrieve email status." })
			}
			res.json(data || { status: null })
		} catch (err) {
			console.error("Error fetching email status:", err.message)
			res.status(500).json({ error: "Failed to retrieve email status." })
		}
	})

	app.post("/update-email-status", async (req, res) => {
		const { user_email, email_id, sender_email, status, interaction_type, auth_failure_reason, assignment_id, email_subject } = req.body
		if (!user_email || !email_id || !sender_email || !status) {
			return res.status(400).json({ error: "Missing fields." })
		}
		if (!VALID_STATUSES.includes(status)) {
			return res.status(400).json({ error: "Invalid status value." })
		}
		const finalInteractionType = interaction_type && VALID_INTERACTION_TYPES.includes(interaction_type) ? interaction_type : "interacted"
		try {
			const upsertData = { user_email, email_id, sender_email, status, interaction_type: finalInteractionType }
			if (auth_failure_reason) {
				upsertData.auth_failure_reason = auth_failure_reason
			}
			const { data, error } = await supabase.from("email_sender_status").upsert(upsertData, { onConflict: "user_email,email_id" }).select()
			if (error) {
				console.error("Supabase Error updating email status:", error.message)
				return res.status(500).json({ error: "Failed to update email status." })
			}
			if (status === "reported_phishing") {
				const phishingReportData = {
					user_email,
					mail_id: email_id,
					sender_email,
					report_type: "phishing",
					interaction_type: finalInteractionType,
				}
				const { error: phishingError } = await supabase.from("phishing_reports").insert(phishingReportData)
				if (phishingError) {
					console.error("Supabase Error inserting into phishing_reports table:", phishingError.message)
				}
			}

			const eventType = STATUS_TO_EVENT_TYPE[status]
			if (eventType) {
				const assignment = await findAssignment({ assignment_id, email_subject })
				if (assignment && !assignment.completed_at) {
					const metadata = {}
					if (auth_failure_reason) metadata.auth_failure_reason = auth_failure_reason
					if (finalInteractionType) metadata.interaction_type = finalInteractionType

					await insertAssignmentEvent({
						assignment,
						event_type: eventType,
						sender_email,
						source: "tutanota",
						metadata: Object.keys(metadata).length ? metadata : null,
					})

					await appendUserLog(
						assignment.user_id,
						`${eventType} assignment_id=${assignment.assignment_id} task="${assignment.task_name}" sender="${sender_email}"`,
					)

					if (TERMINAL_STATUSES.has(status)) {
						await completeAssignment(assignment)
					}
				}
			}

			res.json({ message: "Email status updated.", data: data[0] })
		} catch (err) {
			console.error("Error updating email status:", err.message)
			res.status(500).json({ error: "Failed to update email status." })
		}
	})

	app.delete("/reset-single-email-status", async (req, res) => {
		const { user_email, email_id } = req.body
		if (!user_email || !email_id) {
			return res.status(400).json({ error: "Missing user_email or email_id" })
		}
		try {
			const { error, count } = await supabase.from("email_sender_status").delete().eq("user_email", user_email).eq("email_id", email_id)
			if (error) {
				console.error("Supabase Error resetting status:", error.message)
				return res.status(500).json({ error: "Failed to reset email status." })
			}
			res.json({ message: "Email status reset.", count })
		} catch (err) {
			console.error("Error resetting email status:", err.message)
			res.status(500).json({ error: "Failed to reset email status." })
		}
	})

	app.get("/assignment-by-subject/:email_subject", async (req, res) => {
		const emailSubject = decodeURIComponent(req.params.email_subject).trim()
		try {
			const assignment = await findAssignment({ email_subject: emailSubject })
			if (!assignment) {
				return res.status(404).json({ assignment: null })
			}
			res.json({
				assignment_id: assignment.assignment_id,
				task_id: assignment.task_id,
				task_name: assignment.task_name,
				is_phishing: assignment.is_phishing,
				phishing_type: assignment.phishing_type,
				stage: assignment.stage,
				sent_at: assignment.sent_at,
				completed_at: assignment.completed_at,
				completion_type: assignment.completion_type,
			})
		} catch (err) {
			console.error("Error looking up assignment by subject:", err.message)
			res.status(500).json({ error: "Failed to look up assignment." })
		}
	})

	app.get("/", (req, res) => {
		res.send("Trusted Senders Backend is Running with Supabase...")
	})

	return app
}

module.exports = { createApp, VALID_STATUSES, VALID_INTERACTION_TYPES }
