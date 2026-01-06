/**
 * Service for interacting with the trusted-senders-backend API
 */

export interface TrustedSenderRecord {
	user_email: string
	trusted_email: string
	trusted_name?: string
}

export interface EmailStatusRecord {
	user_email: string
	email_id: string
	sender_email: string
	status: EmailStatus
	interaction_type?: "interacted" | "auto_detected"
	auth_failure_reason?: string
}

export type EmailStatus = "confirmed" | "denied" | "added_to_trusted" | "removed_from_trusted" | "reported_phishing" | "reported_impersonation" | "trusted_once"

export interface PhishingReportRecord {
	user_email: string
	sender_email: string
	sender_name?: string
	report_type: "phishing" | "impersonation"
	email_id?: string
}

// Auto-detect the server host based on current location
function getServerHost(): string {
	if (typeof window !== "undefined" && window.location) {
		const hostname = window.location.hostname
		// If accessing via IP or non-localhost hostname, use that
		if (hostname !== "localhost" && hostname !== "127.0.0.1") {
			return hostname
		}
	}
	return "localhost"
}

export class TrustedSendersService {
	private readonly backendUrl: string
	private readonly corsProxyUrl: string

	constructor(backendUrl?: string, corsProxyUrl?: string) {
		const host = getServerHost()
		this.backendUrl = backendUrl || `http://${host}:3000`
		this.corsProxyUrl = corsProxyUrl || `http://${host}:8080`
	}

	// Helper to build CORS-anywhere proxied URL
	private getProxiedUrl(endpoint: string): string {
		const url = `${this.corsProxyUrl}/${this.backendUrl}${endpoint}`
		console.log("🌐 Proxied URL:", url)
		return url
	}

	/**
	 * Add a sender to the trusted senders list (for AlwaysShow button)
	 */
	async addTrustedSender(userEmail: string, trustedEmail: string, trustedName?: string): Promise<void> {
		try {
			console.log("📤 Sending addTrustedSender request:", { userEmail, trustedEmail, trustedName })
			const response = await fetch(this.getProxiedUrl("/add-trusted"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
				body: JSON.stringify({
					user_email: userEmail,
					trusted_email: trustedEmail,
					trusted_name: trustedName || "",
				}),
			})

			console.log("📥 Response status:", response.status, response.statusText)

			if (!response.ok) {
				const errorText = await response.text()
				console.error("❌ Error response:", errorText)
				throw new Error(`Failed to add trusted sender: ${response.status} - ${errorText}`)
			}

			const result = await response.json()
			console.log(`✅ Added ${trustedEmail} to trusted senders for ${userEmail}`, result)
		} catch (error) {
			console.error("❌ Error adding trusted sender:", error)
			throw error
		}
	}

	/**
	 * Remove a sender from the trusted senders list
	 */
	async removeTrustedSender(userEmail: string, trustedEmail: string): Promise<void> {
		try {
			const response = await fetch(this.getProxiedUrl("/remove-trusted"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
				body: JSON.stringify({
					user_email: userEmail,
					trusted_email: trustedEmail,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(`Failed to remove trusted sender: ${error.error}`)
			}

			console.log(`✅ Removed ${trustedEmail} from trusted senders for ${userEmail}`)
		} catch (error) {
			console.error("Error removing trusted sender:", error)
			throw error
		}
	}

	/**
	 * Update email status (for Show button - trusted_once, or other status updates)
	 */
	async updateEmailStatus(
		userEmail: string,
		emailId: string,
		senderEmail: string,
		status: EmailStatus,
		interactionType: "interacted" | "auto_detected" = "interacted",
		authFailureReason?: string,
	): Promise<void> {
		try {
			console.log("📤 Sending updateEmailStatus request:", { userEmail, emailId, senderEmail, status })
			const response = await fetch(this.getProxiedUrl("/update-email-status"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
				body: JSON.stringify({
					user_email: userEmail,
					email_id: emailId,
					sender_email: senderEmail,
					status,
					interaction_type: interactionType,
					auth_failure_reason: authFailureReason,
				}),
			})

			console.log("📥 Response status:", response.status, response.statusText)

			if (!response.ok) {
				const errorText = await response.text()
				console.error("❌ Error response:", errorText)
				throw new Error(`Failed to update email status: ${response.status} - ${errorText}`)
			}

			const result = await response.json()
			console.log(`✅ Updated email status: ${senderEmail} -> ${status} for user ${userEmail}`, result)
		} catch (error) {
			console.error("❌ Error updating email status:", error)
			throw error
		}
	}

	/**
	 * Get trusted senders list for a user
	 */
	async getTrustedSenders(userEmail: string): Promise<Array<{ name: string; address: string }>> {
		try {
			const response = await fetch(this.getProxiedUrl(`/trusted-senders/${encodeURIComponent(userEmail)}`), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(`Failed to get trusted senders: ${error.error}`)
			}

			const data = await response.json()
			return data.trusted_senders || []
		} catch (error) {
			console.error("Error getting trusted senders:", error)
			throw error
		}
	}

	/**
	 * Report an email for phishing, spam, or impersonation
	 * This adds an entry to the phishing_reports table via the backend
	 */
	async reportSpam(
		userEmail: string,
		senderEmail: string,
		reportType: "phishing" | "spam" | "impersonation",
		emailId?: string,
		senderName?: string,
	): Promise<void> {
		try {
			const response = await fetch(this.getProxiedUrl("/report-spam"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
				},
				body: JSON.stringify({
					user_email: userEmail,
					sender_email: senderEmail,
					sender_name: senderName || "",
					report_type: reportType,
					email_id: emailId,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(`Failed to report: ${error.error}`)
			}

			console.log(`✅ Reported ${senderEmail} as ${reportType} for user ${userEmail}`)
		} catch (error) {
			console.error("Error reporting:", error)
			throw error
		}
	}
}

// Create a singleton instance
export const trustedSendersService = new TrustedSendersService()
