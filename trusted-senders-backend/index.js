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

// Table names - using production tables (no prefix)
const TABLES = {
	TRUSTED_SENDERS: "trusted_senders",
	EMAIL_SENDER_STATUS: "email_sender_status",
	PHISHING_REPORTS: "phishing_reports",
}

// --- CORS Setup ---
// Allow both direct access and CORS proxy access
const allowedOrigins = ["http://localhost:9000", "http://localhost:8080"]

const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true)
		if (allowedOrigins.includes(origin)) {
			callback(null, true)
		} else {
			console.log("❌ CORS rejected origin:", origin)
			callback(new Error("Not allowed by CORS"))
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Accept", "Authorization", "X-Requested-With"],
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

	try {
		// Add to trusted_senders table
		const { data, error } = await supabase
			.from(TABLES.TRUSTED_SENDERS)
			.upsert(
				{
					user_email,
					trusted_email,
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
		const { error: trustedError } = await supabase.from(TABLES.TRUSTED_SENDERS).delete().eq("user_email", user_email).eq("trusted_email", trusted_email)

		if (trustedError) {
			console.error("Supabase Error removing trusted sender:", trustedError.message)
			return res.status(500).json({ error: "Failed to remove trusted sender." })
		}

		// Remove related email statuses
		const { error: statusError } = await supabase.from(TABLES.EMAIL_SENDER_STATUS).delete().eq("user_email", user_email).eq("sender_email", trusted_email)

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
		const { error, count } = await supabase.from(TABLES.EMAIL_SENDER_STATUS).delete().eq("user_email", user_email).eq("sender_email", sender_email)

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

	try {
		const { data, error } = await supabase
			.from(TABLES.TRUSTED_SENDERS)
			.select("trusted_email, trusted_name")
			.eq("user_email", user_email)
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

		res.json({ trusted_senders: trustedSendersList })
	} catch (err) {
		console.error("Error fetching trusted senders:", err.message)
		res.status(500).json({ error: "Failed to retrieve trusted senders." })
	}
})

app.get("/email-status/:user_email/:email_id", async (req, res) => {
	const { user_email, email_id } = req.params
	try {
		const { data, error } = await supabase
			.from(TABLES.EMAIL_SENDER_STATUS)
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

	const validStatuses = ["confirmed", "denied", "added_to_trusted", "removed_from_trusted", "reported_phishing", "reported_impersonation", "trusted_once"]
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
			.from(TABLES.EMAIL_SENDER_STATUS)
			.upsert(upsertData, {
				onConflict: "user_email,email_id",
			})
			.select()

		if (error) {
			console.error("Supabase Error updating email status:", error.message)
			return res.status(500).json({ error: "Failed to update email status." })
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
		const { error, count } = await supabase.from(TABLES.EMAIL_SENDER_STATUS).delete().eq("user_email", user_email).eq("email_id", email_id)
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
	const { user_email, sender_email, report_type, email_id } = req.body

	if (!user_email || !sender_email || !report_type) {
		return res.status(400).json({ error: "Missing required fields: user_email, sender_email, or report_type" })
	}

	const validReportTypes = ["phishing", "spam", "impersonation"]
	if (!validReportTypes.includes(report_type)) {
		return res.status(400).json({ error: "Invalid report_type. Must be: phishing, spam, or impersonation" })
	}

	try {
		// Add to phishing_reports table
		// Table schema: id, user_email, sender_email, mail_id, report_type, interaction_type, reported_at
		const { data: reportData, error: reportError } = await supabase
			.from(TABLES.PHISHING_REPORTS)
			.insert({
				user_email,
				sender_email,
				mail_id: email_id,
				report_type,
				interaction_type: "interacted",
			})
			.select()

		if (reportError) {
			console.error("Supabase Error adding phishing report:", reportError.message)
			return res.status(500).json({ error: "Failed to add phishing report." })
		}

		// Also update email_sender_status with appropriate status
		if (email_id) {
			const status = report_type === "phishing" ? "reported_phishing" : report_type === "impersonation" ? "reported_impersonation" : "reported_phishing"

			// Update the prefixed email_sender_status table
			const { error: statusError } = await supabase
				.from(TABLES.EMAIL_SENDER_STATUS)
				.upsert(
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
				.select()

			if (statusError) {
				console.error("Supabase Error updating email status:", statusError.message)
				// Don't fail the request, report was still recorded
			}
		}

		console.log(`✅ Reported ${sender_email} as ${report_type} by user ${user_email}`)
		res.status(201).json({
			message: `${report_type} report added successfully.`,
			data: reportData[0],
		})
	} catch (err) {
		console.error("Error reporting spam/phishing:", err.message)
		res.status(500).json({ error: "Failed to report spam/phishing." })
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
