import { Icon } from "../../../common/gui/base/Icon.js"
import { Icons } from "../../../common/gui/base/icons/Icons.js"
import m, { Children } from "mithril"
import { Keys, MailSetKind } from "../../../common/api/common/TutanotaConstants.js"
import { modal, ModalComponent } from "../../../common/gui/base/Modal.js"
import type { Shortcut } from "../../../common/misc/KeyManager.js"
import { MailViewerViewModel, TRUSTED_SENDERS_API_URL, TrustedSenderInfo } from "./MailViewerViewModel.js"
import { moveMails } from "./MailGuiUtils.js"
import { assertSystemFolderOfType } from "../model/MailUtils.js"
import { MoveMode } from "../model/MailModel.js"
import { getDisplayedSenderWithDomainReplacement } from "./MailAddressDisplayUtils.js"

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
    `
	document.head.appendChild(style)
}

// Inject outline button style only once
const outlineStyleId = "moby-phish-outline-style"
if (!document.getElementById(outlineStyleId)) {
	const style = document.createElement("style")
	style.id = outlineStyleId
	style.textContent = `
        .mobyphish-outline-btn {
            background: transparent;
            color: #850122;
            border: 1px solid #850122;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-size: 14px;
            font-weight: normal;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s ease;
            margin-top: 10px;
            opacity: 1;
        }

        .mobyphish-outline-btn:hover {
            opacity: 0.7;
        }
    `
	document.head.appendChild(style)
}

export class MobyPhishConfirmSenderModal implements ModalComponent {
	private viewModel: MailViewerViewModel
	private modalHandle?: ModalComponent
	private selectedSenderName: string = ""
	private selectedSenderEmail: string = "" // Track email address for selected sender
	private trustedSenderObjects: TrustedSenderInfo[] = []
	private modalState: "initial" | "warning" = "initial"
	private isLoading: boolean = false
	private errorMessage: string | null = null
	private skippedInitialView: boolean = false
	private isFetchingTrustedSenders: boolean = false
	public onConfirm?: () => void // Callback to execute after sender is confirmed

	constructor(viewModel: MailViewerViewModel, trustedSenders: TrustedSenderInfo[]) {
		this.viewModel = viewModel
		// Use passed trusted senders as initial data, but will fetch fresh data from backend
		this.trustedSenderObjects = Array.isArray(trustedSenders) ? trustedSenders.filter((s) => s && typeof s.address === "string") : []

		// Fetch full trusted senders list from backend
		this.fetchTrustedSendersFromBackend()

		if (this.trustedSenderObjects.length === 0) {
			this.modalState = "warning"
			this.selectedSenderName = (this.viewModel.getSender().name || "").trim()
			this.skippedInitialView = true
		}
	}

	private async fetchTrustedSendersFromBackend(): Promise<void> {
		if (this.isFetchingTrustedSenders) return

		this.isFetchingTrustedSenders = true
		const userEmail = this.viewModel.logins.getUserController().loginUsername

		try {
			const response = await fetch(`${TRUSTED_SENDERS_API_URL}/trusted-senders/${userEmail}`, {
				headers: { Accept: "application/json" },
				credentials: "include",
				mode: "cors",
			})

			if (response.ok) {
				const data = await response.json()
				const trustedSendersList: TrustedSenderInfo[] = Array.isArray(data.trusted_senders)
					? data.trusted_senders.filter((s: TrustedSenderInfo) => s && typeof s.address === "string")
					: []

				this.trustedSenderObjects = trustedSendersList
				console.log(`🔒 MOBYPHISH_LOG: Fetched ${trustedSendersList.length} trusted senders from backend for user="${userEmail}"`)

				// If we had no trusted senders initially but now we do, switch back to initial view
				if (this.skippedInitialView && trustedSendersList.length > 0) {
					this.modalState = "initial"
					this.skippedInitialView = false
				}

				m.redraw()
			} else {
				console.error("🔒 MOBYPHISH_LOG: Failed to fetch trusted senders from backend")
			}
		} catch (error) {
			console.error("🔒 MOBYPHISH_LOG: Error fetching trusted senders from backend:", error)
		} finally {
			this.isFetchingTrustedSenders = false
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
					this.modalState === "initial" ? this.renderInitialView() : this.renderWarningView(),
				]),
			]),
		])
	}

	private renderInitialView(): Children {
		const isConfirmDisabled = !this.selectedSenderName.trim() || this.isLoading

		return [
			m(
				"p",
				{ style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "15px", color: "black" } },
				"Who do you believe this email is from?",
			),
			this.isFetchingTrustedSenders
				? m(
						"p",
						{ style: { fontSize: "14px", textAlign: "center", marginBottom: "15px", color: "#666", fontStyle: "italic" } },
						"Loading known senders...",
					)
				: null,
			m(
				"select",
				{
					value: this.trustedSenderObjects.some((s) => (s.name || "").trim() === this.selectedSenderName.trim()) ? this.selectedSenderName : "",
					onchange: (e: Event) => {
						const selectedValue = (e.target as HTMLSelectElement).value
						// If "custom" is selected or empty, clear email and allow typing name
						if (selectedValue === "__custom__" || selectedValue === "") {
							this.selectedSenderEmail = ""
							this.selectedSenderName = ""
							this.errorMessage = null
							m.redraw()
							return
						}

						// A known sender was selected - set name and email
						this.selectedSenderName = selectedValue
						// Find the selected sender and set their email address in the input
						// Note: If multiple senders have the same name, we'll show the first one's email
						const selectedSender = this.trustedSenderObjects.find((s) => (s.name || "").trim() === selectedValue.trim())
						if (selectedSender && selectedSender.address) {
							this.selectedSenderEmail = selectedSender.address
						} else {
							this.selectedSenderEmail = ""
						}
						this.errorMessage = null
						m.redraw()
					},
					style: {
						padding: "10px",
						width: "100%",
						boxSizing: "border-box",
						borderRadius: "8px",
						border: "1px solid #ccc",
						color: "black",
						backgroundColor: "white",
						fontSize: "14px",
						cursor: "pointer",
						marginBottom: "10px",
					},
					required: false,
					disabled: this.isFetchingTrustedSenders,
				},
				[
					m("option", { value: "" }, "Select a known sender..."),
					...this.trustedSenderObjects.map((sender) => m("option", { value: (sender.name || "").trim() }, sender.name || sender.address)),
					m("option", { value: "__custom__" }, "--- Or type a new sender name ---"),
				],
			),
			// Text input showing name for custom entry (only show if no known sender is selected)
			// Never show email address when a known sender is selected
			this.selectedSenderEmail
				? null // Hide input when a known sender is selected
				: m("input[type=text]", {
						placeholder: "Type the sender's name...",
						value: this.selectedSenderName,
						oninput: (e: Event) => {
							this.selectedSenderName = (e.target as HTMLInputElement).value
							this.errorMessage = null
							m.redraw()
						},
						style: {
							padding: "10px",
							width: "100%",
							boxSizing: "border-box",
							borderRadius: "8px",
							border: "1px solid #ccc",
							color: "black",
							fontSize: "14px",
							display: "block",
						},
					}),
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
					onclick: async () => {
						if (isConfirmDisabled) return
						console.log(
							`🔒 MOBYPHISH_LOG: Confirm button clicked in initial modal, selectedSenderName="${this.selectedSenderName}", selectedSenderEmail="${this.selectedSenderEmail}", actualSender="${
								getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address
							}"`,
						)

						this.isLoading = true
						this.errorMessage = null
						m.redraw()

						const actualEmail = getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address
						const actual = this.viewModel.getDisplayedSender()
						const actualSenderName = (actual?.name || "").trim()
						const enteredName = this.selectedSenderName.trim()

						// Validation: Block if name field is missing
						if (enteredName.length === 0) {
							this.errorMessage = "Please enter a sender name."
							this.isLoading = false
							m.redraw()
							return
						}

						// If a known sender was selected from dropdown, validate that the actual email
						// matches one of the emails already associated with that sender name
						if (this.selectedSenderEmail) {
							try {
								// Validate that the actual email matches one of the known emails for this sender name
								const validateResponse = await fetch(`${TRUSTED_SENDERS_API_URL}/validate-sender-email`, {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										user_email: this.viewModel.logins.getUserController().loginUsername,
										sender_name: enteredName,
										sender_email: actualEmail,
									}),
								})

								if (!validateResponse.ok) {
									throw new Error("Failed to validate sender email.")
								}

								const validationResult = await validateResponse.json()

								if (!validationResult.valid) {
									// Email doesn't match any known emails for this sender name - show warning
									console.log(
										`🔒 MOBYPHISH_LOG: Email validation failed - actualEmail="${actualEmail}" not in known emails for sender="${enteredName}". Known emails: ${validationResult.known_emails.join(", ")}`,
									)
									this.errorMessage = `You may have selected the wrong sender. Please select a different sender from the list or add a new one.`
									// Clear the selection so user can easily reselect
									this.selectedSenderName = ""
									this.selectedSenderEmail = ""
									this.isLoading = false
									m.redraw()
									return
								}

								// Validation passed - the email is already associated with this sender name
								console.log(`🔒 MOBYPHISH_LOG: Email validation passed - actualEmail="${actualEmail}" matches known sender "${enteredName}"`)

								// Now update the email status to confirmed (no need to add to trusted senders - it's already there)
								await this.viewModel.updateSenderStatus("confirmed")
								// Execute callback if provided (e.g., to open link after confirmation)
								if (this.onConfirm) {
									this.onConfirm()
								}
								modal.remove(this.modalHandle!)
								return
							} catch (err) {
								console.error(err)
								this.errorMessage = "Failed to validate sender. Please try again."
								this.isLoading = false
								m.redraw()
								return
							}
						}

						// For custom/new sender entries, validate name matching
						// Validation: Check if names match (case-insensitive)
						// Show phishing warning if:
						// 1. Actual sender has no name (empty or missing)
						// 2. Entered name doesn't match actual sender name (case-insensitive)
						const namesMatch = actualSenderName.length > 0 && enteredName.toLowerCase() === actualSenderName.toLowerCase()

						if (!namesMatch) {
							// Names don't match or sender has no name - show phishing warning
							console.log(
								`🔒 MOBYPHISH_LOG: Name mismatch detected - enteredName="${enteredName}", actualSenderName="${actualSenderName}", showing warning view`,
							)
							this.modalState = "warning"
							this.isLoading = false
							m.redraw()
							return
						}

						// Names match - proceed with confirmation
						try {
							// Upsert into trusted senders with entered name (which matches actual sender name)
							const addResponse = await fetch(`${TRUSTED_SENDERS_API_URL}/add-trusted`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									user_email: this.viewModel.logins.getUserController().loginUsername,
									trusted_email: actualEmail,
									trusted_name: enteredName,
								}),
							})
							if (!addResponse.ok) {
								throw new Error("Failed to add sender to known senders list.")
							}
							console.log(`🔒 MOBYPHISH_LOG: Upserted known sender name="${enteredName}" for email="${actualEmail}"`)
							// Refresh trusted senders list
							await this.viewModel.fetchSenderData()

							// Now update the email status to confirmed
							await this.viewModel.updateSenderStatus("confirmed")
							// Execute callback if provided (e.g., to open link after confirmation)
							if (this.onConfirm) {
								this.onConfirm()
							}
							modal.remove(this.modalHandle!)
						} catch (err) {
							console.error(err)
							this.errorMessage = "Failed to update status. Please try again."
							this.isLoading = false
							m.redraw()
						}
					},
					disabled: isConfirmDisabled,
					style: { ...this.getCancelButtonStyle(), color: "black" },
				},
				"Confirm",
			),

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

	private renderWarningView(): Children {
		const actual = this.viewModel.getDisplayedSender()
		const address = getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address
		const actualSenderName = (actual?.name || "").trim()
		const actualNameOnly = actualSenderName.length > 0 ? actualSenderName : "Unknown sender"
		const canAddSender = !!address

		let warningText = this.skippedInitialView ? "This sender is not on your known senders list:" : "You indicated this email might be from:"
		const indicatedName = this.selectedSenderName.trim() || "Unknown sender"
		const displaySender = this.skippedInitialView ? actualNameOnly : indicatedName

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
					style: { fontSize: "14px", textAlign: "center", marginBottom: "15px", color: "black" },
				},
				[
					warningText,
					m("br"),
					m("strong", displaySender),
					!this.skippedInitialView ? m("br") : null,
					!this.skippedInitialView ? `However, the actual sender is different or not already in your known senders list.` : null,
				],
			),

			!this.skippedInitialView
				? m(
						"p",
						{
							style: {
								fontSize: "12px",
								textAlign: "center",
								marginBottom: "20px",
								fontStyle: "italic",
								color: "black",
							},
						},
						`(Actual sender: ${actualNameOnly})`,
					)
				: null,

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
						console.log(
							`🔒 MOBYPHISH_LOG: "Report as Phishing" button clicked for sender="${getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address}"`,
						)

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
				},
				"Report as Phishing",
			),

			// Add to Known Senders List (Outlined, NOT bold)
			m(
				"button.mobyphish-outline-btn",
				{
					onclick: async () => {
						console.log(
							`🔒 MOBYPHISH_LOG: "Add to Known Senders List" button clicked for sender="${getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address}"`,
						)

						if (this.isLoading || !canAddSender) return
						this.isLoading = true
						this.errorMessage = null
						m.redraw()

						try {
							const response = await fetch(`${TRUSTED_SENDERS_API_URL}/add-trusted`, {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									user_email: this.viewModel.logins.getUserController().loginUsername,
									trusted_email: address,
									trusted_name: actual?.name || "",
								}),
							})
							if (!response.ok) throw new Error("Failed to add sender.")

							console.log(`🔒 MOBYPHISH_LOG: Successfully added sender="${address}" to trusted list`)
							await this.viewModel.updateSenderStatus("confirmed")
							// Execute callback if provided (e.g., to open link after confirmation)
							if (this.onConfirm) {
								this.onConfirm()
							}
							modal.remove(this.modalHandle!)
						} catch (err: any) {
							console.error(`🔒 MOBYPHISH_LOG: Error adding sender to trusted list:`, err)
							this.errorMessage = err.message || "Error occurred while adding."
							this.isLoading = false
							m.redraw()
						}
					},
					disabled: this.isLoading || !canAddSender,
				},
				`Add ${actualNameOnly} to Known Senders List`,
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
