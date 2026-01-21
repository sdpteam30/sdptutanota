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

var cors_proxy = require("./lib/cors-anywhere")
cors_proxy
	.createServer({
		originBlacklist: originBlacklist,
		originWhitelist: ["http://localhost:9000", "http://10.252.16.42:9000", "https://10.252.16.42:9000"], // Allow local and network access
		requireHeader: null, // Disable required headers to allow all requests
		checkRateLimit: checkRateLimit,
		removeHeaders: ["cookie", "cookie2", "x-request-start", "x-request-id", "via", "connect-time", "total-route-time"],
		redirectSameOrigin: false, // Don't redirect - we always want to proxy
		httpProxyOptions: {
			xfwd: false,
			// Allow self-signed certificates (useful for development)
			secure: false,
		},
		// setHeaders is for request headers to target, CORS response headers are handled in cors-anywhere.js
		setHeaders: {},
		// Cache preflight requests for 1 hour
		corsMaxAge: 3600,
	})
	.listen(port, host, function () {
		console.log("Running CORS Anywhere on " + host + ":" + port)
	})
