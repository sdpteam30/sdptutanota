// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || "0.0.0.0"
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
// again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
// immediate abuse (e.g. denial of service). If you want to block all origins except for some,
// use originWhitelist instead.
var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST)
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST)
function parseEnvList(env) {
	if (!env) {
		return []
	}
	return env.split(",")
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require("./lib/rate-limit")(process.env.CORSANYWHERE_RATELIMIT)

// Allowed origins for CORS - supports localhost and any IP on port 9000
var allowedOrigins = ["http://localhost:9000", "http://10.252.16.42:9000"]
// Helper to check if origin is allowed (supports regex pattern matching)
function isOriginAllowed(origin) {
	if (!origin) return false
	// Check exact matches
	if (allowedOrigins.includes(origin)) return true
	// Also allow any IP address on port 9000 for network access
	if (/^http:\/\/\d+\.\d+\.\d+\.\d+:9000$/.test(origin)) return true
	return false
}
var cors_proxy = require("./lib/cors-anywhere")
cors_proxy
	.createServer({
		originBlacklist: originBlacklist,
		originWhitelist: [], // Empty whitelist - we handle origin checking in handleInitialRequest
		requireHeader: null, // Don't require headers for preflight requests
		checkRateLimit: checkRateLimit,
		removeHeaders: ["cookie", "cookie2", "x-request-start", "x-request-id", "via", "connect-time", "total-route-time"],
		redirectSameOrigin: false, // Don't redirect - we're proxying
		httpProxyOptions: {
			xfwd: false,
			secure: false, // Allow self-signed certs
		},
		corsMaxAge: 86400, // Cache preflight for 24 hours
		// Custom handler to check origin
		handleInitialRequest: function (req, res, location) {
			var origin = req.headers.origin || ""
			if (!isOriginAllowed(origin) && origin !== "") {
				res.writeHead(403, "Forbidden", {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "text/plain",
				})
				res.end('The origin "' + origin + '" is not allowed.')
				return true // Request handled, don't proxy
			}
			return false // Continue with proxy
		},
	})
	.listen(port, host, function () {
		console.log("Running CORS Anywhere on " + host + ":" + port)
		console.log("Allowed origins: " + allowedOrigins.join(", ") + " (and any IP:9000)")
	})
