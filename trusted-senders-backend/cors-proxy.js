const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")
const cors = require("cors")
const morgan = require("morgan")
const http = require("http")
const https = require("https")
const events = require("events")

// Increase max listeners to handle many concurrent requests
events.EventEmitter.defaultMaxListeners = 500

const app = express()
const PORT = process.env.PORT || 9001
const TARGETS = {
	tutanota: "http://localhost:9000",
	db: "http://localhost:3000",
}
const HOST = process.env.HOST || "0.0.0.0"

// Enhanced CORS configuration
const corsOptions = {
	origin: "*", // Allow all origins
	credentials: true,
	methods: ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS", "PATCH", "PROPFIND", "PROPPATCH", "MKCOL", "COPY", "MOVE", "LOCK"],
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"Accept",
		"Origin",
		"Access-Control-Allow-Origin",
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Methods",
		"Access-Control-Allow-Credentials",
		"Access-Control-Request-Headers",
		"Access-Control-Expose-Headers",
		"Cache-Control",
		"If-None-Match",
		"If-Modified-Since",
		"v",
		"cv",
		"*",
	],
	exposedHeaders: ["*"],
	maxAge: 86400,
	preflightContinue: false,
	optionsSuccessStatus: 204,
}

// Apply CORS middleware with options
app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

// Log all requests
app.use(morgan(":remote-addr - :method :url :status :response-time ms - :res[content-length]"))

// Create separate agents with increased timeouts and keep-alive
const httpAgent = new http.Agent({
	keepAlive: true,
	keepAliveMsecs: 1000,
	maxSockets: 500, // Increased from 200
	timeout: 60000, // Reduced to 1 minute
})

const httpsAgent = new https.Agent({
	keepAlive: true,
	keepAliveMsecs: 1000,
	maxSockets: 500, // Increased from 200
	timeout: 60000, // Reduced to 1 minute
	rejectUnauthorized: false,
})

// Helper to determine if a request is for a static file
const isStaticFile = (path) => {
	const staticExtensions = [".js", ".css", ".png", ".jpg", ".ico", ".woff2", ".woff", ".ttf", ".wasm", ".map", ".json", ".xml"]
	return staticExtensions.some((ext) => path.endsWith(ext)) || path.includes("-chunk.js")
}

// Helper to determine if a request is for the trusted_senders database
const isTrustedSendersRequest = (path) => {
	return (
		path.includes("trusted_senders.db") ||
		path.startsWith("/trusted-senders/") ||
		path.includes("trusted-senders.db") ||
		path.includes("/add-trusted") ||
		path.includes("/remove-trusted") ||
		path.includes("/get-trusted")
	)
}

// Create proxy middleware factory with different settings for static and dynamic content
const createProxyMiddlewareWithTarget = (target, isDbRequest = false) => {
	const retryableStatusCodes = [408, 500, 502, 503, 504]
	const maxRetries = 3

	return createProxyMiddleware({
		target,
		changeOrigin: true,
		secure: false,
		followRedirects: true,
		xfwd: true,
		ws: true,
		agent: target.startsWith("https") ? httpsAgent : httpAgent,
		timeout: 60000, // 1 minute
		proxyTimeout: 60000, // 1 minute
		pathRewrite: isDbRequest
			? {
					"^/trusted-senders/": "/",
					"^/add-trusted": "/add-trusted",
					"^/remove-trusted": "/remove-trusted",
					"^/get-trusted": "/get-trusted",
			  }
			: undefined,
		onProxyReq: (proxyReq, req, res) => {
			// Add necessary headers
			proxyReq.setHeader(
				"User-Agent",
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
			)
			proxyReq.setHeader("Accept", "*/*")
			proxyReq.setHeader("Accept-Language", "en-US,en;q=0.9")
			proxyReq.setHeader("Connection", "keep-alive")

			// Handle XML requests specially
			if (req.headers.accept && req.headers.accept.includes("xml")) {
				proxyReq.setHeader("Accept", "application/xml")
			}

			// Copy origin if it exists
			if (req.headers.origin) {
				proxyReq.setHeader("Origin", req.headers.origin)
			}

			// Handle preflight requests
			if (req.method === "OPTIONS") {
				res.status(204).end()
				return
			}

			// Add caching headers for static files
			if (isStaticFile(req.url)) {
				proxyReq.setHeader("Cache-Control", "public, max-age=31536000") // 1 year
			}

			// Special handling for database requests
			if (isDbRequest) {
				proxyReq.setHeader("Content-Type", "application/json")
			}

			console.log(`[${new Date().toISOString()}] Proxying ${req.method} request to: ${target}${req.url}`)
		},
		onProxyRes: (proxyRes, req, res) => {
			// Add CORS headers to every response
			proxyRes.headers["Access-Control-Allow-Origin"] = "*"
			proxyRes.headers["Access-Control-Allow-Methods"] = corsOptions.methods.join(", ")
			proxyRes.headers["Access-Control-Allow-Headers"] = corsOptions.allowedHeaders.join(", ")
			proxyRes.headers["Access-Control-Allow-Credentials"] = "true"
			proxyRes.headers["Access-Control-Max-Age"] = "86400"
			proxyRes.headers["Access-Control-Expose-Headers"] = "*"

			// Remove restrictive headers
			delete proxyRes.headers["x-frame-options"]
			delete proxyRes.headers["content-security-policy"]

			// Add caching headers for static files
			if (isStaticFile(req.url)) {
				proxyRes.headers["Cache-Control"] = "public, max-age=31536000" // 1 year
				proxyRes.headers["Expires"] = new Date(Date.now() + 31536000000).toUTCString()
			}

			// Handle redirects (301, 302)
			if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
				const location = proxyRes.headers.location
				if (location && location.startsWith("https://app.tuta.com")) {
					proxyRes.headers.location = location.replace("https://app.tuta.com", target)
				}
			}

			console.log(`[${new Date().toISOString()}] Response from ${target}${req.url}: ${proxyRes.statusCode}`)
		},
		onError: (err, req, res) => {
			console.error(`[${new Date().toISOString()}] Proxy error for ${req.url}:`, err)

			if (!res.headersSent) {
				const retryCount = parseInt(req.headers["x-retry-count"] || "0")

				// For static files or chunks, retry on error
				if (isStaticFile(req.url) && retryCount < maxRetries) {
					console.log(`[${new Date().toISOString()}] Retrying static file request (${retryCount + 1}/${maxRetries}): ${req.url}`)
					req.headers["x-retry-count"] = (retryCount + 1).toString()
					return
				}

				// For database requests, send a more specific error
				if (isDbRequest) {
					res.status(500).json({
						error: "Database Error",
						message: "Could not connect to the trusted senders database",
						originalError: err.message,
						code: err.code,
						path: req.url,
					})
					return
				}

				res.status(500).json({
					error: "Proxy Error",
					message: err.message,
					code: err.code,
					path: req.url,
				})
			}
		},
	})
}

// Route traffic based on the request type
app.use((req, res, next) => {
	if (isTrustedSendersRequest(req.url)) {
		// Route trusted_senders database requests to port 3000
		createProxyMiddlewareWithTarget(TARGETS.db, true)(req, res, next)
	} else {
		// Route all other requests to Tutanota
		createProxyMiddlewareWithTarget(TARGETS.tutanota)(req, res, next)
	}
})

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(`[${new Date().toISOString()}] Global error:`, err)

	if (!res.headersSent) {
		res.status(500).json({
			error: "Server Error",
			message: err.message,
			path: req.url,
		})
	}
})

// Start the server with increased timeouts
const server = app.listen(PORT, HOST, () => {
	console.log(`[${new Date().toISOString()}] CORS proxy server running at http://${HOST}:${PORT}`)
	console.log(`[${new Date().toISOString()}] Proxying Tutanota requests to: ${TARGETS.tutanota}`)
	console.log(`[${new Date().toISOString()}] Proxying trusted_senders.db requests to: ${TARGETS.db}`)
})

// Increase server timeouts but keep them reasonable
server.timeout = 60000 // 1 minute
server.keepAliveTimeout = 60000
server.headersTimeout = 61000 // Slightly higher than keepAliveTimeout
server.maxConnections = 2000

// Handle server shutdown gracefully
process.on("SIGTERM", () => {
	console.log(`[${new Date().toISOString()}] Received SIGTERM. Performing graceful shutdown...`)
	server.close(() => {
		console.log(`[${new Date().toISOString()}] Server closed. Exiting process.`)
		process.exit(0)
	})
})
