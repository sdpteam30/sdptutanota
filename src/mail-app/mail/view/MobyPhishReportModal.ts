import m, { Children } from "mithril"
import { Keys, MailSetKind } from "../../../common/api/common/TutanotaConstants.js"
import { modal, ModalComponent } from "../../../common/gui/base/Modal.js"
import type { Shortcut } from "../../../common/misc/KeyManager.js"
import { MailViewerViewModel, TRUSTED_SENDERS_API_URL } from "./MailViewerViewModel.js"
import { Icon } from "../../../common/gui/base/Icon.js"
import { Icons } from "../../../common/gui/base/icons/Icons.js"
import { moveMails } from "./MailGuiUtils.js"
import { assertSystemFolderOfType } from "../model/MailUtils.js"

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
				["This email from ", m("strong", senderEmail), " appears to be suspicious. You can report it as phishing to help protect yourself and others."],
			),

			m(
				"button.mobyphish-report-btn",
				{
					onclick: () => {
						this.step = 2
						m.redraw()
					},
					disabled: this.isLoading,
				},
				[
					m(Icon, {
						icon: Icons.Warning,
						style: { fill: "white", marginRight: "8px", width: "16px", height: "16px" },
					}),
					"Report as Phishing",
				],
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
		const senderEmail = this.viewModel.getSender().address

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
				["Are you sure you want to report ", m("strong", senderEmail), " as phishing? This will mark the sender as suspicious."],
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

	private async reportAsPhishing(): Promise<void> {
		this.isLoading = true
		m.redraw()

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
				console.log(`🔒 MOBYPHISH_LOG: Successfully reported phishing for sender="${senderEmail}"`)

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
