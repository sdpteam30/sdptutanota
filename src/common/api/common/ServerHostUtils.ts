/**
 * Utility functions for determining the server host.
 * Used to dynamically configure API endpoints based on how the application is accessed.
 */
/**
 * Auto-detect the server host based on current location.
 * Returns the hostname of the current page, or "localhost" if not available.
 *
 * This is useful for building API URLs that work both when accessing via localhost
 * and when accessing via a network IP address (e.g., 10.252.16.42).
 *
 * @returns The hostname (e.g., "localhost", "10.252.16.42", "app.tuta.com")
 */
export function getServerHost(): string {
	if (typeof window !== "undefined" && window.location) {
		const hostname = window.location.hostname
		// If accessing via IP or non-localhost hostname, use that
		if (hostname !== "localhost" && hostname !== "127.0.0.1") {
			return hostname
		}
	}
	return "localhost"
}
/**
 * Get the full server origin including protocol and port.
 * When accessing remotely, routes through CORS proxy on port 8080 to reach the backend.
 *
 * @param defaultPort - The default port to use if not in the URL (e.g., 3000 for backend API)
 * @returns The full origin (e.g., "http://localhost:3000", or CORS proxy URL for remote access)
 */
export function getServerOrigin(defaultPort: number = 3000): string {
	if (typeof window !== "undefined" && window.location) {
		const protocol = window.location.protocol
		const hostname = window.location.hostname
		// If accessing via IP (remote), route through CORS proxy on port 8080
		if (hostname !== "localhost" && hostname !== "127.0.0.1") {
			return `${protocol}//${hostname}:8080/http://localhost:${defaultPort}`
		}
		return `${protocol}//${hostname}:${defaultPort}`
	}
	return `http://localhost:${defaultPort}`
}
/**
 * Check if the application is being accessed from a remote network location.
 *
 * @returns true if accessed via an IP address or non-localhost hostname
 */
export function isRemoteAccess(): boolean {
	if (typeof window !== "undefined" && window.location) {
		const hostname = window.location.hostname
		return hostname !== "localhost" && hostname !== "127.0.0.1"
	}
	return false
}
/**
 * Check if the hostname is an IP address.
 *
 * @param hostname - The hostname to check
 * @returns true if the hostname is an IPv4 address
 */
export function isIPAddress(hostname: string): boolean {
	return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
}
