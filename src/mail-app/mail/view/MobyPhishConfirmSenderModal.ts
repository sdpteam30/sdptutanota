import { Icon } from "../../../common/gui/base/Icon.js"
import { Icons } from "../../../common/gui/base/icons/Icons.js"
import m, { Children } from "mithril"
import { Keys, MailSetKind } from "../../../common/api/common/TutanotaConstants.js"
import { modal, ModalComponent } from "../../../common/gui/base/Modal.js"
import type { Shortcut } from "../../../common/misc/KeyManager.js"
import { MailViewerViewModel, TRUSTED_SENDERS_API_URL, TrustedSenderInfo } from "./MailViewerViewModel.js"
import { moveMails } from "./MailGuiUtils.js"
import { assertSystemFolderOfType } from "../model/MailUtils.js"
import { MailViewModel } from "./MailViewModel"
import { MailModel, MoveMode } from "../model/MailModel.js"

// Inject primary button style only once
const styleId = "moby-phish-hover-style"
if (!document.getElementById(styleId)) {
	const style = document.createElement("style")
	style.id = styleId
	style.textContent = `
        .mobyphish-btn {
            background: #850122;
            color: #ffffff;
            border: none;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s ease;
            margin-top: 10px;
            opacity: 1;
        }

        .mobyphish-btn:hover {
            opacity: 0.7;
        }

        .mobyphish-trusted-btn {
            background: #28a745;
            color: #ffffff;
            border: none;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s ease;
            margin-top: 10px;
            opacity: 1;
        }

        .mobyphish-trusted-btn:hover {
            opacity: 0.7;
        }
    `
	document.head.appendChild(style)
}

export class MobyPhishConfirmSenderModal implements ModalComponent {
	private viewModel: MailViewerViewModel
	private modalHandle?: ModalComponent

	private trustedSenderObjects: TrustedSenderInfo[]
	private modalState: "initial" | "warning" | "technical" = "initial"
	private isLoading: boolean = false
	private errorMessage: string | null = null
	private skippedInitialView: boolean = false

	constructor(viewModel: MailViewerViewModel, trustedSenders: TrustedSenderInfo[]) {
		this.viewModel = viewModel
		this.trustedSenderObjects = Array.isArray(trustedSenders) ? trustedSenders.filter((s) => s && typeof s.address === "string") : []

		// Check if sender passes both authentication AND is in trust-list
		const isSenderTrusted = this.viewModel.isSenderTrusted()

		if (!isSenderTrusted) {
			this.modalState = "warning"
			this.skippedInitialView = true
			console.log(`🔒 MOBYPHISH_LOG: Sender failed authentication or not in trust-list, going directly to warning view`)
		}
	}

	private formatSenderDisplay(name: string | null | undefined, address: string | null | undefined): string {
		const trimmedName = name?.trim()
		const validAddress = address?.trim() || ""
		if (!validAddress) return trimmedName || "Sender Info Unavailable"
		if (trimmedName && trimmedName !== validAddress) return `${trimmedName} (${validAddress})`
		return validAddress
	}

	view(): Children {
		return m(".modal-overlay", { onclick: (e: MouseEvent) => this.backgroundClick(e) }, [
			m(".modal-content", { onclick: (e: MouseEvent) => e.stopPropagation() }, [
				m(".dialog.elevated-bg.border-radius", { style: this.getModalStyle() }, [
					this.modalState === "initial"
						? this.renderInitialView()
						: this.modalState === "technical"
							? this.renderTechnicalView()
							: this.renderWarningView(),
				]),
			]),
		])
	}

	private renderInitialView(): Children {
		// If we reach this view, sender is confirmed to be in trust-list
		// Auto-enable links immediately
		console.log(`🔒 MOBYPHISH_LOG: Sender confirmed in trust-list, enabling links automatically`)

		// Auto-enable links and close modal
		setTimeout(async () => {
			try {
				await this.viewModel.updateSenderStatus("confirmed")
				modal.remove(this.modalHandle!)
			} catch (err) {
				console.error(`🔒 MOBYPHISH_LOG: Error auto-enabling links:`, err)
			}
		}, 100)

		return [
			m(
				"p",
				{ style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "15px", color: "black" } },
				"✓ Sender confirmed in trust-list",
			),
			m("p", { style: { fontSize: "14px", textAlign: "center", marginBottom: "15px", color: "#28a745" } }, "Links are being enabled automatically..."),
		]
	}

	private renderTechnicalView(): Children {
		return [
			m(
				"p",
				{ style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "15px", color: "black" } },
				"How MobyPhish Detects Email Fraud",
			),

			m(
				"div",
				{
					style: {
						fontSize: "13px",
						textAlign: "left",
						marginBottom: "20px",
						color: "#333",
						lineHeight: "1.5",
						maxHeight: "350px",
						overflowY: "auto",
						padding: "15px",
						backgroundColor: "#f8f9fa",
						borderRadius: "8px",
						border: "1px solid #e9ecef",
					},
				},
				[
					m("p", { style: { marginBottom: "12px", fontWeight: "bold" } }, "MobyPhish detects phishing by verifying email server authentication:"),

					m("p", { style: { marginBottom: "12px", fontWeight: "bold", color: "#dc3545" } }, "1. Email Server Authentication (Primary Protection)"),
					m(
						"p",
						{ style: { marginBottom: "8px" } },
						"• SPF (Sender Policy Framework): Verifies the sending server is authorized by the domain owner",
					),
					m(
						"p",
						{ style: { marginBottom: "8px" } },
						"• DKIM (DomainKeys Identified Mail): Validates cryptographic signatures to prevent email tampering",
					),
					m("p", { style: { marginBottom: "8px" } }, "• DMARC: Ensures proper alignment between domain and authentication mechanisms"),
					m("p", { style: { marginBottom: "12px" } }, "• Allows legitimate emails from the same domain (e.g., different corporate departments)"),

					m(
						"p",
						{ style: { marginBottom: "8px", fontSize: "12px", color: "#666" } },
						"Learn more: ",
						m("a", { href: "https://tools.ietf.org/html/rfc7208", target: "_blank", style: { color: "#007acc" } }, "SPF RFC"),
						" | ",
						m("a", { href: "https://tools.ietf.org/html/rfc6376", target: "_blank", style: { color: "#007acc" } }, "DKIM RFC"),
						" | ",
						m("a", { href: "https://tools.ietf.org/html/rfc7489", target: "_blank", style: { color: "#007acc" } }, "DMARC RFC"),
					),

					m("p", { style: { marginBottom: "12px", fontWeight: "bold", color: "#dc3545" } }, "2. Trust-List Verification"),
					m("p", { style: { marginBottom: "8px" } }, "• Your personal trust-list contains domains you've previously verified"),
					m("p", { style: { marginBottom: "12px" } }, "• Combines with server authentication for additional security"),

					m("p", { style: { marginBottom: "12px", fontWeight: "bold", color: "#dc3545" } }, "3. Additional Analysis"),
					m("p", { style: { marginBottom: "8px" } }, "• Domain reputation and registration analysis"),
					m("p", { style: { marginBottom: "8px" } }, "• Content analysis for common phishing patterns"),
					m("p", { style: { marginBottom: "12px" } }, "• Link destination verification"),

					m(
						"p",
						{
							style: {
								marginTop: "12px",
								fontStyle: "italic",
								backgroundColor: "#fff3cd",
								padding: "8px",
								borderRadius: "4px",
								border: "1px solid #ffeaa7",
							},
						},
						"⚠️ Important: Email addresses are easily spoofed. MobyPhish focuses on server authentication rather than just the displayed sender address.",
					),

					m(
						"p",
						{ style: { marginTop: "8px", fontStyle: "italic", backgroundColor: "#e7f3ff", padding: "8px", borderRadius: "4px" } },
						"🛡️ Protection: Links remain disabled until proper server authentication is verified, regardless of the displayed sender address.",
					),
				],
			),

			m(
				"button",
				{
					onclick: () => {
						this.modalState = "warning"
						m.redraw()
					},
					style: { ...this.getCancelButtonStyle(), color: "black" },
				},
				"Back",
			),
		]
	}

	private renderWarningView(): Children {
		const actual = this.viewModel.getDisplayedSender()
		const address = this.viewModel.getSender().address
		const actualDisplay = this.formatSenderDisplay(actual?.name, address)

		//const displaySender = actualDisplay (used previously to display the sender name & email)

		return [
			m(
				"p",
				{
					style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "5px", color: "black" },
				},
				m(Icon, {
					icon: Icons.Warning,
					style: { fill: "#FFA500", marginRight: "8px", verticalAlign: "middle" },
				}),
				"MobyPhish Warning: This appears to be phishing!",
			),

			m(
				"p",
				{
					style: { fontSize: "14px", textAlign: "center", marginBottom: "10px", color: "black" },
				},
				["This sender of this email is not in your trust-list"],
			),

			// Display specific authentication failure reason if available
			(() => {
				const failureReason = this.viewModel.getAuthenticationFailureReason()
				if (failureReason) {
					return m(
						"div",
						{
							style: {
								fontSize: "13px",
								textAlign: "left",
								marginBottom: "15px",
								padding: "12px",
								backgroundColor: "#fff3cd",
								border: "1px solid #ffeaa7",
								borderRadius: "6px",
								color: "#856404",
							},
						},
						[
							m("p", { style: { fontWeight: "bold", marginBottom: "6px", color: "#dc3545" } }, "🚫 Security Verification Failed:"),
							m("p", { style: { margin: "0", lineHeight: "1.4" } }, failureReason),
						],
					)
				}
				return null
			})(),

			m(
				"p",
				{
					style: { fontSize: "12px", textAlign: "center", marginBottom: "15px", color: "#666" },
				},
				[
					m(
						"a",
						{
							style: {
								color: "#007acc",
								textDecoration: "underline",
								cursor: "pointer",
								fontSize: "12px",
							},
							onclick: (e: MouseEvent) => {
								e.preventDefault()
								this.modalState = "technical"
								m.redraw()
							},
						},
						"How does MobyPhish detect email fraud?",
					),
				],
			),

			this.errorMessage
				? m(
						".error-message",
						{
							style: { color: "red", fontSize: "12px", marginBottom: "10px" },
						},
						this.errorMessage,
					)
				: null,

			// Report Impersonation (Primary - Red)
			// m(
			// 	"button.mobyphish-btn",
			// 	{
			// 		onclick: async () => {
			// 			console.log(`🔒 MOBYPHISH_LOG: "Report Impersonation" button clicked for sender="${this.viewModel.getSender().address}"`)

			// 			const senderEmail = this.viewModel.getSender().address
			// 			const userEmail = this.viewModel.logins.getUserController().loginUsername

			// 			try {
			// 				// Update MobyPhish API
			// 				const response = await fetch(`${TRUSTED_SENDERS_API_URL}/update-email-status`, {
			// 					method: "POST",
			// 					headers: { "Content-Type": "application/json" },
			// 					body: JSON.stringify({
			// 						user_email: userEmail,
			// 						email_id: this.viewModel.mail._id[1],
			// 						sender_email: senderEmail,
			// 						status: "reported_impersonation",
			// 						interaction_type: "interacted",
			// 					}),
			// 				})

			// 				if (response.ok) {
			// 					console.log(`🔒 MOBYPHISH_LOG: Successfully updated MobyPhish API for sender="${senderEmail}"`)

			// 					// Move email to spam folder (without reporting to Tutanota servers)
			// 					try {
			// 						const mailboxDetail = await this.viewModel.mailModel.getMailboxDetailsForMail(this.viewModel.mail)
			// 						if (mailboxDetail && mailboxDetail.mailbox.folders) {
			// 							const folders = await this.viewModel.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.folders._id)
			// 							const spamFolder = assertSystemFolderOfType(folders, MailSetKind.SPAM)

			// 							await moveMails({
			// 								mailboxModel: this.viewModel.mailboxModel,
			// 								mailModel: this.viewModel.mailModel,
			// 								mails: [this.viewModel.mail],
			// 								targetMailFolder: spamFolder,
			// 								isReportable: false,
			// 							})
			// 							console.log(`🔒 MOBYPHISH_LOG: Successfully moved email to spam folder for sender="${senderEmail}"`)
			// 						}
			// 					} catch (moveError) {
			// 						console.error(`🔒 MOBYPHISH_LOG: Failed to move email to spam folder for sender="${senderEmail}":`, moveError)
			// 					}

			// 					await this.viewModel.fetchSenderData()
			// 					if (this.modalHandle) {
			// 						modal.remove(this.modalHandle)
			// 					} else {
			// 						console.warn("No modal handle set")
			// 					}
			// 					m.redraw()
			// 				} else {
			// 					console.error("🔒 MOBYPHISH_LOG: Failed to update MobyPhish API")
			// 				}
			// 			} catch (error) {
			// 				console.error("🔒 MOBYPHISH_LOG: Error updating MobyPhish API:", error)
			// 			}
			// 		},
			// 		disabled: this.isLoading,
			// 	},
			// 	"Report Impersonation",
			// ), removed 7/31 to reduce scope-creep in the view links button

			// Report Phishing (Secondary - Orange)
			m(
				"button",
				{
					onclick: async () => {
						console.log(`🔒 MOBYPHISH_LOG: "Report Phishing" button clicked for sender="${this.viewModel.getSender().address}"`)

						const senderEmail = this.viewModel.getSender().address
						const userEmail = this.viewModel.logins.getUserController().loginUsername

						try {
							// Update MobyPhish API
							const response = await fetch(`${TRUSTED_SENDERS_API_URL}/update-email-status`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									user_email: userEmail,
									email_id: this.viewModel.mail._id[1],
									sender_email: senderEmail,
									status: "reported_phishing",
									interaction_type: "interacted",
								}),
							})

							if (response.ok) {
								console.log(`🔒 MOBYPHISH_LOG: Successfully updated MobyPhish API for sender="${senderEmail}"`)

								// Move email to spam folder (without reporting to Tutanota servers)
								try {
									const mailboxDetail = await this.viewModel.mailModel.getMailboxDetailsForMail(this.viewModel.mail)
									if (mailboxDetail && mailboxDetail.mailbox.folders) {
										const folders = await this.viewModel.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.folders._id)
										const spamFolder = assertSystemFolderOfType(folders, MailSetKind.SPAM)

										await moveMails({
											mailboxModel: this.viewModel.mailboxModel,
											mailModel: this.viewModel.mailModel,
											mailIds: [this.viewModel.mail._id],
											targetFolder: spamFolder,
											moveMode: MoveMode.Mails,
											isReportable: false,
											mailViewModel: await this.viewModel.mailViewModel(),
										})
										console.log(`🔒 MOBYPHISH_LOG: Successfully moved email to spam folder for sender="${senderEmail}"`)
									}
								} catch (moveError) {
									console.error(`🔒 MOBYPHISH_LOG: Failed to move email to spam folder for sender="${senderEmail}":`, moveError)
								}

								await this.viewModel.fetchSenderData()
								if (this.modalHandle) {
									modal.remove(this.modalHandle)
								} else {
									console.warn("No modal handle set")
								}
								m.redraw()
							} else {
								console.error("🔒 MOBYPHISH_LOG: Failed to update MobyPhish API")
							}
						} catch (error) {
							console.error("🔒 MOBYPHISH_LOG: Error updating MobyPhish API:", error)
						}
					},
					disabled: this.isLoading,
					style: {
						background: "#DC3545",
						color: "#ffffff",
						border: "none",
						padding: "12px",
						borderRadius: "8px",
						cursor: "pointer",
						width: "100%",
						fontSize: "14px",
						fontWeight: "bold",
						textAlign: "center",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						transition: "opacity 0.2s ease",
						marginTop: "10px",
						opacity: this.isLoading ? 0.5 : 1,
					},
				},
				"Report Phishing",
			),

			// Cancel
			m(
				"button",
				{
					onclick: () => {
						if (!this.isLoading) modal.remove(this.modalHandle!)
					},
					disabled: this.isLoading,
					style: this.getCancelButtonStyle(),
				},
				"Cancel",
			),
		]
	}

	private getCancelButtonStyle() {
		return {
			background: "transparent",
			color: "#555",
			border: "1px solid #ccc",
			padding: "12px",
			borderRadius: "8px",
			cursor: "pointer",
			width: "100%",
			fontSize: "14px",
			fontWeight: "normal",
			textAlign: "center",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			marginTop: "10px",
			transition: "background-color 0.2s ease",
			onmouseover: (e: MouseEvent) => ((e.target as HTMLElement).style.backgroundColor = "#f0f0f0"),
			onmouseout: (e: MouseEvent) => ((e.target as HTMLElement).style.backgroundColor = "transparent"),
		}
	}

	private getModalStyle() {
		return {
			position: "fixed",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			padding: "25px",
			textAlign: "center",
			background: "#fff",
			boxShadow: "0px 5px 15px rgba(0,0,0,0.25)",
			borderRadius: "10px",
			width: "90%",
			maxWidth: "420px",
			display: "flex",
			flexDirection: "column",
			gap: "0px",
		}
	}

	hideAnimation(): Promise<void> {
		return Promise.resolve()
	}
	onClose(): void {}
	backgroundClick(e: MouseEvent): void {
		if (!this.isLoading) modal.remove(this.modalHandle!)
	}
	popState(): boolean {
		if (!this.isLoading) modal.remove(this.modalHandle!)
		return false
	}
	callingElement(): HTMLElement | null {
		return null
	}
	shortcuts(): Shortcut[] {
		return [
			{
				key: Keys.ESC,
				exec: () => {
					if (!this.isLoading) {
						modal.remove(this.modalHandle!)
						return true
					}
					return false
				},
				help: "close_alt",
			},
		]
	}
	setModalHandle(handle: ModalComponent) {
		this.modalHandle = handle
	}
}
