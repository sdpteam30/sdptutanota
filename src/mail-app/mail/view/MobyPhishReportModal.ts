import m, { Children } from "mithril"
import { Keys, MailSetKind } from "../../../common/api/common/TutanotaConstants.js"
import { modal, ModalComponent } from "../../../common/gui/base/Modal.js"
import type { Shortcut } from "../../../common/misc/KeyManager.js"
import { MailViewerViewModel, TRUSTED_SENDERS_API_URL } from "./MailViewerViewModel.js"
import { Icon } from "../../../common/gui/base/Icon.js"
import { Icons } from "../../../common/gui/base/icons/Icons.js"
import { assertSystemFolderOfType } from "../model/MailUtils.js"
import { MoveMode } from "../model/MailModel.js"
import { getDisplayedSenderWithDomainReplacement } from "./MailAddressDisplayUtils.js"
import { MailTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js"
import { mailLocator } from "../../mailLocator.js"

// Inject CSS only once
const styleId = "moby-phish-report-style"
if (!document.getElementById(styleId)) {
	const style = document.createElement("style")
	style.id = styleId
	style.textContent = `
        .mobyphish-report-btn {
            background: #dc3545;
            color: white;
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

        .mobyphish-report-btn:hover {
            opacity: 0.8;
        }



        .mobyphish-cancel-btn {
            background: transparent;
            color: #6c757d;
            border: 1px solid #6c757d;
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
            transition: all 0.2s ease;
            margin-top: 10px;
        }

        .mobyphish-cancel-btn:hover {
            background: #6c757d;
            color: white;
        }
    `
	document.head.appendChild(style)
}

export class MobyPhishReportModal implements ModalComponent {
	private viewModel: MailViewerViewModel
	private modalHandle?: ModalComponent
	private step: number = 1
	private selectedType: "impersonation" | "phishing" | null = null
	private isLoading: boolean = false

	constructor(viewModel: MailViewerViewModel) {
		this.viewModel = viewModel
	}

	view(): Children {
		return m(
			".modal-overlay",
			{
				onclick: (e: MouseEvent) => this.backgroundClick(e),
			},
			[
				m(
					".modal-content",
					{
						onclick: (e: MouseEvent) => e.stopPropagation(),
					},
					[
						m(
							".dialog.elevated-bg.border-radius",
							{
								style: this.getModalStyle(),
							},
							this.step === 1 ? this.renderFirstStep() : this.renderSecondStep(),
						),
					],
				),
			],
		)
	}

	/** Step 1: Report options */
	private renderFirstStep(): Children {
		const senderEmail = this.viewModel.getSender().address
		const senderName = this.viewModel.getSender().name

		return [
			m(
				"div",
				{
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: "15px",
					},
				},
				[
					m(Icon, {
						icon: Icons.Warning,
						style: { fill: "#dc3545", marginRight: "8px", width: "20px", height: "20px" },
					}),
					m(
						"h3",
						{
							style: {
								margin: "0",
								fontSize: "18px",
								fontWeight: "bold",
								color: "#333",
							},
						},
						"Report Email",
					),
				],
			),

			m(
				"p",
				{
					style: {
						fontSize: "14px",
						textAlign: "center",
						marginBottom: "20px",
						color: "#333",
						lineHeight: "1.4",
					},
				},
				["Do you want to report this email as phishing? ", m("br")],
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
								marginBottom: "20px",
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

			// m(
			// 	"button.mobyphish-report-btn",
			// 	{
			// 		onclick: async () => {
			// 			await this.reportAsImpersonation()
			// 		},
			// 		disabled: this.isLoading,
			// 	},
			// 	[
			// 		m(Icon, {
			// 			icon: Icons.Warning,
			// 			style: { fill: "white", marginRight: "8px", width: "16px", height: "16px" },
			// 		}),
			// 		"Report Impersonation",
			// 	],
			// ), commented out 7/31 to remove scope-creep from the report button

			m(
				"button",
				{
					onclick: async () => {
						await this.reportAsPhishing()
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

			m(
				"button.mobyphish-cancel-btn",
				{
					onclick: () => {
						this.closeModal()
					},
					disabled: this.isLoading,
				},
				"Cancel",
			),
		]
	}

	/** Step 2: Confirmation for phishing report */
	private renderSecondStep(): Children {
		const senderEmail = getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address
		const senderName = getDisplayedSenderWithDomainReplacement(this.viewModel.mail).name
		return [
			m(
				"div",
				{
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: "15px",
					},
				},
				[
					m(Icon, {
						icon: Icons.Warning,
						style: { fill: "#dc3545", marginRight: "8px", width: "20px", height: "20px" },
					}),
					m(
						"h3",
						{
							style: {
								margin: "0",
								fontSize: "18px",
								fontWeight: "bold",
								color: "#333",
							},
						},
						"Confirm Report",
					),
				],
			),

			m(
				"p",
				{
					style: {
						fontSize: "14px",
						textAlign: "center",
						marginBottom: "20px",
						color: "#333",
						lineHeight: "1.4",
					},
				},
				[
					"Report this email fraud using the name ",
					m("strong", senderName),
					"? ",
					m("br"),
					m("br"),
					"Note: The email address itself may be legitimate, but an attacker is using it for email fraud.",
				],
			),

			m(
				"button.mobyphish-report-btn",
				{
					onclick: async () => {
						await this.reportAsPhishing()
					},
					disabled: this.isLoading,
				},
				this.isLoading ? "Reporting..." : "Confirm Report",
			),

			m(
				"button.mobyphish-cancel-btn",
				{
					onclick: () => {
						this.step = 1
						m.redraw()
					},
					disabled: this.isLoading,
				},
				"Back",
			),
		]
	}

	private async reportAsImpersonation(): Promise<void> {
		this.isLoading = true
		m.redraw()

		const senderEmail = getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address
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
					status: "reported_impersonation",
					interaction_type: "interacted",
					assignment_id: this.viewModel.currentAssignmentId,
					email_subject: this.viewModel.mail.subject,
				}),
			})

			if (response.ok) {
				console.log(`🔒 MOBYPHISH_LOG: Successfully reported impersonation for sender="${senderEmail}"`)

				// Move all emails from this sender to spam folder (without reporting to Tutanota servers)
				try {
					const mailboxDetail = await this.viewModel.mailModel.getMailboxDetailsForMail(this.viewModel.mail)
					if (mailboxDetail && mailboxDetail.mailbox.mailSets) {
						const folders = await this.viewModel.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.mailSets._id)
						const spamFolder = assertSystemFolderOfType(folders, MailSetKind.SPAM)

						const searchResult = await mailLocator.searchFacade.search(
							senderEmail,
							{ type: MailTypeRef, folderIds: [], eventSeries: null, field: null, start: null, end: null, attributeIds: null },
							0,
							1000,
						)

						const uniqueMails = new Map<string, any>()
						if (searchResult && searchResult.results) {
							searchResult.results.forEach((idTuple: any) => uniqueMails.set(idTuple[1], idTuple))
						}

						const mailViewModel = await mailLocator.mailViewModel()
						const loadedMails = mailViewModel?.listModel?.mails || []
						for (const loadedMail of loadedMails) {
							const loadedSender = getDisplayedSenderWithDomainReplacement(loadedMail).address
							if (loadedSender === senderEmail) {
								uniqueMails.set(loadedMail._id[1], loadedMail._id)
							}
						}

						uniqueMails.set(this.viewModel.mail._id[1], this.viewModel.mail._id)

						const mailsToMove = Array.from(uniqueMails.values())
						if (mailsToMove.length > 0) {
							await this.viewModel.mailModel.moveMails(mailsToMove, spamFolder, MoveMode.Mails)
							if (mailsToMove.length > 1) {
								console.log(`🔒 MOBYPHISH_LOG: Successfully moved ${mailsToMove.length} emails to spam folder for sender="${senderEmail}"`)
							} else {
								console.log(`🔒 MOBYPHISH_LOG: Fallback: Successfully moved current email to spam folder for sender="${senderEmail}"`)
							}
						}
					}
				} catch (moveError) {
					console.error(`🔒 MOBYPHISH_LOG: Failed to move emails to spam folder for sender="${senderEmail}":`, moveError)
				}

				await this.viewModel.updateSenderStatus("reported_impersonation")
				await this.viewModel.fetchSenderData()
				this.closeModal()
			} else {
				console.error("🔒 MOBYPHISH_LOG: Failed to report impersonation")
			}
		} catch (error) {
			console.error("🔒 MOBYPHISH_LOG: Error reporting impersonation:", error)
		} finally {
			this.isLoading = false
			m.redraw()
		}
	}

	private async reportAsPhishing(): Promise<void> {
		this.isLoading = true
		m.redraw()

		const senderEmail = getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address
		const senderName = getDisplayedSenderWithDomainReplacement(this.viewModel.mail).name
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
					assignment_id: this.viewModel.currentAssignmentId,
					email_subject: this.viewModel.mail.subject,
				}),
			})

			if (response.ok) {
				console.log(`🔒 MOBYPHISH_LOG: Successfully reported phishing for sender="${senderEmail}"`)

				// Move all emails from this sender to spam folder (without reporting to Tutanota servers)
				try {
					const mailboxDetail = await this.viewModel.mailModel.getMailboxDetailsForMail(this.viewModel.mail)
					if (mailboxDetail && mailboxDetail.mailbox.mailSets) {
						const folders = await this.viewModel.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.mailSets._id)
						const spamFolder = assertSystemFolderOfType(folders, MailSetKind.SPAM)

						const searchResult = await mailLocator.searchFacade.search(
							senderEmail,
							{ type: MailTypeRef, folderIds: [], eventSeries: null, field: null, start: null, end: null, attributeIds: null },
							0,
							1000,
						)

						const uniqueMails = new Map<string, any>()
						if (searchResult && searchResult.results) {
							searchResult.results.forEach((idTuple: any) => uniqueMails.set(idTuple[1], idTuple))
						}

						const mailViewModel = await mailLocator.mailViewModel()
						const loadedMails = mailViewModel?.listModel?.mails || []
						for (const loadedMail of loadedMails) {
							const loadedSender = getDisplayedSenderWithDomainReplacement(loadedMail).address
							if (loadedSender === senderEmail) {
								uniqueMails.set(loadedMail._id[1], loadedMail._id)
							}
						}

						uniqueMails.set(this.viewModel.mail._id[1], this.viewModel.mail._id)

						const mailsToMove = Array.from(uniqueMails.values())
						if (mailsToMove.length > 0) {
							await this.viewModel.mailModel.moveMails(mailsToMove, spamFolder, MoveMode.Mails)
							if (mailsToMove.length > 1) {
								console.log(`🔒 MOBYPHISH_LOG: Successfully moved ${mailsToMove.length} emails to spam folder for sender="${senderEmail}"`)
							} else {
								console.log(`🔒 MOBYPHISH_LOG: Fallback: Successfully moved current email to spam folder for sender="${senderEmail}"`)
							}
						}
					}
				} catch (moveError) {
					console.error(`🔒 MOBYPHISH_LOG: Failed to move emails to spam folder for sender="${senderEmail}":`, moveError)
				}

				await this.viewModel.fetchSenderData()
				this.closeModal()
			} else {
				console.error("🔒 MOBYPHISH_LOG: Failed to report phishing")
			}
		} catch (error) {
			console.error("🔒 MOBYPHISH_LOG: Error reporting phishing:", error)
		} finally {
			this.isLoading = false
			m.redraw()
		}
	}

	private closeModal(): void {
		if (this.modalHandle) {
			modal.remove(this.modalHandle)
		} else {
			console.warn("No modal handle set")
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
			maxWidth: "400px",
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
		console.log("Background clicked, closing modal...")
		this.closeModal()
	}

	popState(e: Event): boolean {
		this.closeModal()
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
					this.closeModal()
					return true
				},
				help: "close_alt",
			},
		]
	}

	setModalHandle(handle: ModalComponent) {
		this.modalHandle = handle
	}
}
