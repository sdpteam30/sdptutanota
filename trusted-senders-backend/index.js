// index.js (Supabase version)

require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()
const PORT = process.env.PORT || 3000
const HOST = "0.0.0.0"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// --- CORS Setup ---
const allowedOrigins = ["http://localhost:9000", "http://10.252.16.42:9000", "https://10.252.16.42:9000"]

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin) return callback(null, true)
		if (allowedOrigins.includes(origin)) {
			callback(null, true)
		} else {
			callback(new Error("Not allowed by CORS"))
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Accept", "Authorization"],
	exposedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
app.use(express.json())

// --- API Endpoints ---

app.post("/add-trusted", async (req, res) => {
	const { user_email, trusted_email, trusted_name = "" } = req.body

	if (!user_email || !trusted_email) {
		return res.status(400).json({ error: "Missing user_email or trusted_email" })
	}

	// Normalize emails for consistent storage and comparison
	const normalizedUserEmail = user_email.toLowerCase().trim()
	const normalizedTrustedEmail = trusted_email.toLowerCase().trim()

	console.log(`🔒 BACKEND_LOG: Adding trusted sender - user="${normalizedUserEmail}", trusted="${normalizedTrustedEmail}", name="${trusted_name}"`)

	try {
		const { data, error } = await supabase
			.from("trusted_senders")
			.upsert(
				{
					user_email: normalizedUserEmail,
					trusted_email: normalizedTrustedEmail,
					trusted_name,
				},
				{
					onConflict: "user_email,trusted_email",
				},
			)
			.select()

		if (error) {
			console.error("Supabase Error adding/updating trusted sender:", error.message)
			return res.status(500).json({ error: "Failed to add trusted sender." })
		}

		res.status(201).json({
			message: "Trusted sender added/updated.",
			data: data[0],
		})
	} catch (err) {
		console.error("Error adding trusted sender:", err.message)
		res.status(500).json({ error: "Failed to add trusted sender." })
	}
})

app.post("/remove-trusted", async (req, res) => {
	const { user_email, trusted_email } = req.body

	if (!user_email || !trusted_email) {
		return res.status(400).json({ error: "Missing user_email or trusted_email" })
	}

	try {
		// Remove from trusted_senders
		const { error: trustedError } = await supabase.from("trusted_senders").delete().eq("user_email", user_email).eq("trusted_email", trusted_email)

		if (trustedError) {
			console.error("Supabase Error removing trusted sender:", trustedError.message)
			return res.status(500).json({ error: "Failed to remove trusted sender." })
		}

		// Remove related email statuses
		const { error: statusError } = await supabase.from("email_sender_status").delete().eq("user_email", user_email).eq("sender_email", trusted_email)

		if (statusError) {
			console.error("Supabase Error removing statuses:", statusError.message)
			return res.status(500).json({ error: "Failed to remove email statuses." })
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

		const trustedSendersList = data.map((row) => ({
			name: row.trusted_name || "",
			address: row.trusted_email,
		}))

		console.log(`🔒 BACKEND_LOG: Fetched ${trustedSendersList.length} trusted senders for user="${normalizedUserEmail}"`)

		res.json({ trusted_senders: trustedSendersList })
	} catch (err) {
		console.error("Error fetching trusted senders:", err.message)
		res.status(500).json({ error: "Failed to retrieve trusted senders." })
	}
})

// Validate if an email matches one of the emails for a given sender name
app.post("/validate-sender-email", async (req, res) => {
	const { user_email, sender_name, sender_email } = req.body

	if (!user_email || !sender_name || !sender_email) {
		return res.status(400).json({ error: "Missing required fields" })
	}

	const normalizedUserEmail = user_email.toLowerCase().trim()
	const normalizedSenderEmail = sender_email.toLowerCase().trim()

	console.log(`🔒 BACKEND_LOG: Validating sender - user="${normalizedUserEmail}", name="${sender_name}", email="${normalizedSenderEmail}"`)

	try {
		// Get all emails associated with this sender name for this user
		const { data, error } = await supabase
			.from("trusted_senders")
			.select("trusted_email")
			.eq("user_email", normalizedUserEmail)
			.eq("trusted_name", sender_name)

		if (error) {
			console.error("Supabase Error validating sender:", error.message)
			return res.status(500).json({ error: "Failed to validate sender." })
		}

		// Since emails are now stored normalized, we can compare directly
		const matchingEmails = data.map((row) => row.trusted_email)
		const isValid = matchingEmails.includes(normalizedSenderEmail)

		console.log(`🔒 BACKEND_LOG: Validation result - valid=${isValid}, known_emails=${matchingEmails.join(", ")}`)

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
			// PGRST116 is "no rows returned"
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
	const { user_email, email_id, sender_email, status, interaction_type, auth_failure_reason } = req.body
	if (!user_email || !email_id || !sender_email || !status) {
		return res.status(400).json({ error: "Missing fields." })
	}

	const validStatuses = [
		"confirmed",
		"denied",
		"added_to_trusted",
		"removed_from_trusted",
		"reported_phishing",
		"reported_spam",
		"reported_impersonation",
		"trusted_once",
	]
	if (!validStatuses.includes(status)) {
		return res.status(400).json({ error: "Invalid status value." })
	}

	const validInteractionTypes = ["interacted", "auto_detected"]
	const finalInteractionType = interaction_type && validInteractionTypes.includes(interaction_type) ? interaction_type : "interacted"

	try {
		// Prepare the data object with optional fields
		const upsertData = {
			user_email,
			email_id,
			sender_email,
			status,
			interaction_type: finalInteractionType,
		}

		// Add auth_failure_reason if provided (for auto-detected authentication failures)
		if (auth_failure_reason) {
			upsertData.auth_failure_reason = auth_failure_reason
		}

		// Log auto-detected authentication failures
		if (finalInteractionType === "auto_detected") {
			console.log(`🔒 BACKEND_LOG: Auto-detected authentication failure - sender="${sender_email}", auth_status="${auth_failure_reason}"`)
		}

		const { data, error } = await supabase
			.from("email_sender_status")
			.upsert(upsertData, {
				onConflict: "user_email,email_id",
			})
			.select()

		if (error) {
			console.error("Supabase Error updating email status:", error.message)
			return res.status(500).json({ error: "Failed to update email status." })
		}

		// If status is reported_phishing, also insert into phishing_reports table
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
				// Log the error but don't fail the request since the main status update succeeded
				console.log(`⚠️ BACKEND_LOG: Failed to insert into phishing_reports table, but email_sender_status was updated successfully`)
			} else {
				console.log(`🔒 BACKEND_LOG: Successfully added phishing report to phishing_reports table - sender="${sender_email}", user="${user_email}"`)
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
app.post("/report-spam", async (req, res) => {
	const { user_email, sender_email, sender_name = "", report_type = "phishing", email_id } = req.body

	if (!user_email || !sender_email || !email_id) {
		return res.status(400).json({ error: "Missing required fields: user_email, sender_email, or email_id" })
	}

	// Validate report_type
	const validReportTypes = ["phishing", "spam"]
	if (!validReportTypes.includes(report_type)) {
		return res.status(400).json({ error: "Invalid report_type. Must be 'phishing' or 'spam'" })
	}

	try {
		// Determine the status for email_sender_status table
		// "reported_phishing" for phishing reports, "reported_spam" for spam reports
		const status = report_type === "phishing" ? "reported_phishing" : "reported_spam"

		// Always log to phishing_reports table with report_type "phishing" (generic)
		// This ensures all reports are tracked generically as phishing
		// If the table doesn't exist or has issues, we'll log but not fail
		// Note: phishing_reports table uses "mail_id" (not "email_id") and requires it
		const phishingReportData = {
			user_email,
			sender_email,
			mail_id: email_id, // phishing_reports table uses "mail_id" column name
			report_type: "phishing", // Always use "phishing" as generic report type
			interaction_type: "interacted",
		}
		const { error: reportError } = await supabase.from("phishing_reports").insert(phishingReportData)

		if (reportError) {
			console.error("Supabase Error inserting phishing report:", reportError)
			console.error("Full error details:", JSON.stringify(reportError, null, 2))
			// Don't fail the request if phishing_reports table doesn't exist or has issues
			// The email_sender_status update is more critical
		} else {
			console.log(`✅ Added ${report_type} report to phishing_reports for ${user_email}`)
		}

		// Log to email_sender_status table with specific status (reported_phishing or reported_spam)
		const { error: statusError } = await supabase.from("email_sender_status").upsert(
			{
				user_email,
				email_id,
				sender_email,
				status,
				interaction_type: "interacted",
			},
			{
				onConflict: "user_email,email_id",
			},
		)

		if (statusError) {
			console.error("Supabase Error updating email status:", statusError)
			console.error("Full error details:", JSON.stringify(statusError, null, 2))
			return res.status(500).json({
				error: "Failed to update email status.",
				details: statusError.message,
				code: statusError.code,
			})
		} else {
			console.log(`✅ Updated email_sender_status with status "${status}" for ${user_email}`)
		}

		res.status(201).json({
			message: `Report logged successfully. Status: ${status}`,
			status,
			report_type: "phishing", // Generic report type in phishing_reports
		})
	} catch (err) {
		console.error("Error reporting spam/phishing:", err)
		console.error("Full error stack:", err.stack)
		res.status(500).json({
			error: "Failed to report spam/phishing.",
			details: err.message,
		})
	}
})

app.get("/", (req, res) => {
	res.send("Trusted Senders Backend is Running with Supabase...")
})
app.listen(PORT, HOST, () => {
	console.log(`Server running on http://${HOST}:${PORT}`)
})
process.on("SIGINT", () => {
	console.log("Shutting down gracefully...")
	process.exit(0)
})
