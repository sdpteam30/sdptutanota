import { Icon } from "../../../common/gui/base/Icon.js"
import { Icons } from "../../../common/gui/base/icons/Icons.js"
import m, { Children } from "mithril"
import { Keys, MailSetKind } from "../../../common/api/common/TutanotaConstants.js"
import { modal, ModalComponent } from "../../../common/gui/base/Modal.js"
import type { Shortcut } from "../../../common/misc/KeyManager.js"
import { MailViewerViewModel, TRUSTED_SENDERS_API_URL, TrustedSenderInfo } from "./MailViewerViewModel.js"
import { moveMails } from "./MailGuiUtils.js"
import { assertSystemFolderOfType } from "../model/MailUtils.js"

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

		if (this.trustedSenderObjects.length === 0) {
			this.modalState = "warning"
			this.skippedInitialView = true
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
		return [
			m(
				"p",
				{ style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "15px", color: "black" } },
				"Are you sure this sender is trusted?",
			),
			m(
				"button.mobyphish-trusted-btn",
				{
					onclick: async () => {
						if (this.isLoading) return

						console.log(`🔒 MOBYPHISH_LOG: Trusted Sender button clicked, checking if sender is already trusted`)

						this.isLoading = true
						this.errorMessage = null
						m.redraw()

						try {
							const currentSenderEmail = this.viewModel.getSender().address?.trim().toLowerCase()
							const isSenderTrusted = this.trustedSenderObjects.some((sender) => sender.address.trim().toLowerCase() === currentSenderEmail)

							if (isSenderTrusted) {
								console.log(`🔒 MOBYPHISH_LOG: Sender is already trusted, confirming directly`)
								await this.viewModel.updateSenderStatus("confirmed")
								modal.remove(this.modalHandle!)
							} else {
								console.log(`🔒 MOBYPHISH_LOG: Sender not in trusted list, showing warning view`)
								this.modalState = "warning"
								this.isLoading = false
								m.redraw()
							}
						} catch (err) {
							console.error(err)
							this.errorMessage = "Failed to check trusted sender status. Please try again."
							this.isLoading = false
							m.redraw()
						}
					},
					disabled: this.isLoading,
				},
				"✓ Yes, this sender is trusted",
			),
			this.errorMessage
				? m(
						".error-message",
						{
							style: { color: "red", fontSize: "12px", marginTop: "5px" },
						},
						this.errorMessage,
				  )
				: null,

			m(
				"button",
				{
					onclick: () => modal.remove(this.modalHandle!),
					disabled: this.isLoading,
					style: { ...this.getCancelButtonStyle(), color: "black" },
				},
				"Cancel",
			),
		]
	}

	private renderTechnicalView(): Children {
		return [
			m(
				"p",
				{ style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "15px", color: "black" } },
				"How Trusted Sender Detection Works",
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
						maxHeight: "300px",
						overflowY: "auto",
						padding: "15px",
						backgroundColor: "#f8f9fa",
						borderRadius: "8px",
						border: "1px solid #e9ecef",
					},
				},
				[
					m("p", { style: { marginBottom: "12px", fontWeight: "bold" } }, "Technical Process:"),

					m(
						"p",
						{ style: { marginBottom: "8px" } },
						"1. When an email is received, the system extracts the sender's email address from the message headers.",
					),

					m(
						"p",
						{ style: { marginBottom: "8px" } },
						"2. A database query is performed against your personal trusted senders list using the exact email address match:",
					),

					m(
						"code",
						{
							style: {
								display: "block",
								backgroundColor: "#e9ecef",
								padding: "8px",
								borderRadius: "4px",
								fontFamily: "monospace",
								fontSize: "12px",
								margin: "8px 0",
							},
						},
						"trustedSenderObjects.some(sender => sender.address.trim().toLowerCase() === currentSenderEmail)",
					),

					m("p", { style: { marginBottom: "8px" } }, "3. The comparison is case-insensitive and whitespace-trimmed to handle formatting variations."),

					m(
						"p",
						{ style: { marginBottom: "8px" } },
						"4. If no exact match is found in your trusted senders database, the email is flagged as potentially suspicious.",
					),

					m("p", { style: { marginBottom: "8px" } }, "5. The system then presents this security warning to prevent potential phishing attacks."),

					m(
						"p",
						{ style: { marginTop: "12px", fontStyle: "italic" } },
						"Note: This is a strict allowlist approach - only pre-approved email addresses can have links automatically enabled.",
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
				"Back to Warning",
			),
		]
	}

	private renderWarningView(): Children {
		const actual = this.viewModel.getDisplayedSender()
		const address = this.viewModel.getSender().address
		const actualDisplay = this.formatSenderDisplay(actual?.name, address)

		const displaySender = actualDisplay

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
				"Potential Phishing Attempt",
			),

			m(
				"p",
				{
					style: { fontSize: "14px", textAlign: "center", marginBottom: "10px", color: "black" },
				},
				["This sender is not in your Trusted Senders List", m("br"), "and may be attempting phishing:", m("br"), m("strong", displaySender)],
			),

			m(
				"p",
				{
					style: { fontSize: "12px", textAlign: "center", marginBottom: "15px", color: "#666" },
				},
				[
					"Links in this email have been disabled for your protection.",
					m("br"),
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
						"How does this work?",
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

			// Report as Phishing (Primary)
			m(
				"button.mobyphish-btn",
				{
					onclick: async () => {
						console.log(`🔒 MOBYPHISH_LOG: "Report as Phishing" button clicked for sender="${this.viewModel.getSender().address}"`)

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
											mails: [this.viewModel.mail],
											targetMailFolder: spamFolder,
											isReportable: false,
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
				},
				"Report as Phishing",
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
