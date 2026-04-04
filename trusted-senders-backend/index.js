// index.js — entry point: wires real Supabase client to the Express app and starts the server.
require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")
const { createApp } = require("./app")

const PORT = process.env.PORT || 3000
const HOST = "0.0.0.0"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const app = createApp(supabase)

app.listen(PORT, HOST, () => {
	console.log(`Server running on http://${HOST}:${PORT}`)
})

process.on("SIGINT", () => {
	console.log("Shutting down gracefully...")
	process.exit(0)
})
