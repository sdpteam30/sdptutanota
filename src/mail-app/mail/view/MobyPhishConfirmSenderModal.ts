import { Icon } from "../../../common/gui/base/Icon.js"
import { Icons } from "../../../common/gui/base/icons/Icons.js"
import m, { Children } from "mithril"
import { Keys, MailSetKind } from "../../../common/api/common/TutanotaConstants.js"
import { modal, ModalComponent } from "../../../common/gui/base/Modal.js"
import type { Shortcut } from "../../../common/misc/KeyManager.js"
import { MailViewerViewModel, TRUSTED_SENDERS_API_URL, TrustedSenderInfo } from "./MailViewerViewModel.js"
import { assertSystemFolderOfType } from "../model/MailUtils.js"
import { MoveMode } from "../model/MailModel.js"
import { getDisplayedSenderWithDomainReplacement } from "./MailAddressDisplayUtils.js"
import { MailTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js"
import { mailLocator } from "../../mailLocator.js"

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

export class MobyPhishConfirmSenderModal implements ModalComponent {
	private viewModel: MailViewerViewModel
	private modalHandle?: ModalComponent
	private selectedSenderName: string = ""
	private selectedSenderEmail: string = "" // Track email address for selected sender
	private trustedSenderObjects: TrustedSenderInfo[] = []
	private isLoading: boolean = false
	private errorMessage: string | null = null
	private isFetchingTrustedSenders: boolean = false
	private isCustomSelected: boolean = false
	public onConfirm?: () => void // Callback to execute after sender is confirmed

	constructor(viewModel: MailViewerViewModel, trustedSenders: TrustedSenderInfo[]) {
		this.viewModel = viewModel
		// Use passed trusted senders as initial data, but will fetch fresh data from backend
		this.trustedSenderObjects = Array.isArray(trustedSenders) ? trustedSenders.filter((s) => s && typeof s.address === "string") : []

		// Fetch full trusted senders list from backend
		this.fetchTrustedSendersFromBackend()

		// Always show the initial view (dropdown to confirm sender)
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
				m(".dialog.elevated-bg.border-radius", { style: this.getModalStyle() }, [this.renderInitialView()]),
			]),
		])
	}

	private renderInitialView(): Children {
		const isConfirmDisabled = !this.selectedSenderName.trim() || this.isLoading

		return [
			m("p", { style: { fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "5px", color: "black" } }, [
				m(Icon, {
					icon: Icons.Warning,
					style: { fill: "#FFA500", marginRight: "8px", verticalAlign: "middle" },
				}),
				"Unknown Sender Detected",
			]),
			this.errorMessage
				? m("p.error-message", { style: { color: "red", fontSize: "14px", textAlign: "center", marginBottom: "15px" } }, this.errorMessage)
				: m("p", { style: { fontSize: "14px", textAlign: "center", marginBottom: "15px", color: "#333" } }, [
						"This email may be phishing.",
						m("br"),
						"Please verify who you believe it's from:",
					]),
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
					value: this.isCustomSelected
						? "__custom__"
						: this.trustedSenderObjects.some((s) => (s.name || s.address || "").trim() === this.selectedSenderName.trim())
							? this.selectedSenderName
							: "",
					onchange: (e: Event) => {
						const selectedValue = (e.target as HTMLSelectElement).value

						this.isCustomSelected = selectedValue === "__custom__"

						// If "custom" is selected or empty, clear email and allow typing name
						if (selectedValue === "__custom__" || selectedValue === "") {
							this.selectedSenderEmail = ""
							this.selectedSenderName = ""
							this.errorMessage = null
							m.redraw()
							return
						}

						// Find sender by matching the fallback value (name or address)
						const selectedSender = this.trustedSenderObjects.find((s) => (s.name || s.address || "").trim() === selectedValue.trim())
						if (selectedSender && selectedSender.address) {
							this.selectedSenderEmail = selectedSender.address
							// Fall back to the address if the name is empty/missing
							this.selectedSenderName = (selectedSender.name || selectedSender.address || "").trim()
						} else {
							this.selectedSenderEmail = ""
							this.selectedSenderName = selectedValue
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
					m("option", { value: "" }, "Identify a known sender..."),
					m("option", { value: "__custom__" }, "Sender not listed? Type new name..."),
					...this.trustedSenderObjects.map((sender) =>
						m("option", { value: (sender.name || sender.address || "").trim() }, sender.name || sender.address),
					),
				],
			),
			// Text input showing name for custom entry (only show if "custom" is selected)
			this.isCustomSelected
				? m("input[type=text]", {
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
					})
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
									this.errorMessage = `This email is not from ${enteredName}. Please choose a different sender, add a new one, or report as phishing.`
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

						// Proceed directly with adding the sender - allow any name for any email address with confirmation
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
					style: {
						background: "#28a745",
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
						marginTop: "10px",
						opacity: isConfirmDisabled ? 0.5 : 1,
						transition: "opacity 0.2s ease",
					},
				},
				"Confirm",
			),

			// Report as Phishing button - only show when wrong sender warning is displayed
			this.errorMessage && this.errorMessage.includes("This email is not from")
				? m(
						"button.mobyphish-btn",
						{
							onclick: async () => {
								console.log(
									`🔒 MOBYPHISH_LOG: "Report as Phishing" button clicked from initial view for sender="${getDisplayedSenderWithDomainReplacement(this.viewModel.mail).address}"`,
								)

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
											status: "reported_phishing",
											interaction_type: "interacted",
										}),
									})

									if (response.ok) {
										console.log(`🔒 MOBYPHISH_LOG: Successfully updated MobyPhish API for sender="${senderEmail}"`)

										// Move all emails from this sender to spam folder (without reporting to Tutanota servers)
										try {
											const mailboxDetail = await this.viewModel.mailModel.getMailboxDetailsForMail(this.viewModel.mail)
											if (mailboxDetail && mailboxDetail.mailbox.mailSets) {
												const folders = await this.viewModel.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.mailSets._id)
												const spamFolder = assertSystemFolderOfType(folders, MailSetKind.SPAM)

												const searchResult = await mailLocator.searchFacade.search(
													senderEmail,
													{
														type: MailTypeRef,
														folderIds: [],
														eventSeries: null,
														field: null,
														start: null,
														end: null,
														attributeIds: null,
													},
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
														console.log(
															`🔒 MOBYPHISH_LOG: Successfully moved ${mailsToMove.length} emails to spam folder for sender="${senderEmail}"`,
														)
													} else {
														console.log(
															`🔒 MOBYPHISH_LOG: Fallback: Successfully moved current email to spam folder for sender="${senderEmail}"`,
														)
													}
												}
											}
										} catch (moveError) {
											console.error(`🔒 MOBYPHISH_LOG: Failed to move emails to spam folder for sender="${senderEmail}":`, moveError)
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
										this.isLoading = false
										m.redraw()
									}
								} catch (error) {
									console.error("🔒 MOBYPHISH_LOG: Error updating MobyPhish API:", error)
									this.isLoading = false
									m.redraw()
								}
							},
							disabled: this.isLoading,
						},
						"Report as Phishing",
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
