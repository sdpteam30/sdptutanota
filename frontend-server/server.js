const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 9000
const TUTA_API = "https://app.tuta.com"

// Proxy /rest/* requests to Tutanota API
app.use(
	"/rest",
	createProxyMiddleware({
		target: TUTA_API,
		changeOrigin: true,
		secure: false, // Allow self-signed certs
		onProxyRes: function (proxyRes, req, res) {
			// Add CORS headers to allow browser to read all response headers
			proxyRes.headers["access-control-allow-origin"] = "*"
			proxyRes.headers["access-control-expose-headers"] = "*"
		},
		onError: function (err, req, res) {
			console.error("Proxy error:", err.message)
			res.writeHead(502, {
				"Content-Type": "text/plain",
				"Access-Control-Allow-Origin": "*",
			})
			res.end("Proxy error: " + err.message)
		},
	}),
)

// Handle CORS preflight for /rest/*
app.options("/rest/*", (req, res) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	res.header("Access-Control-Allow-Headers", "Content-Type, Accept, Origin, X-Requested-With, accessToken, v, cv, cp, Authorization")
	res.header("Access-Control-Expose-Headers", "*")
	res.header("Access-Control-Max-Age", "86400")
	res.sendStatus(204)
})

// Serve static files from build directory
app.use(express.static(path.join(__dirname, "../build"), { index: "index.html" }))

// SPA fallback - serve index.html for any non-file requests
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../build", "index.html"))
})

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Frontend server running on port ${PORT}`)
	console.log(`Proxying /rest/* to ${TUTA_API}`)
})
