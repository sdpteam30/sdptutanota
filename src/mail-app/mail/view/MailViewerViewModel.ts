import {
	ConversationEntryTypeRef,
	createMailAddress,
	EncryptedMailAddress,
	File as TutanotaFile,
	Mail,
	MailAddress,
	MailDetails,
	MailSet,
	MailTypeRef,
} from "../../../common/api/entities/tutanota/TypeRefs.js"
import {
	ArchiveDataType,
	ConversationType,
	EncryptionAuthStatus,
	ExternalImageRule,
	FeatureType,
	isPermanentDeleteAllowedMailSetKind,
	MailAuthenticationStatus,
	MailMethod,
	MailPhishingStatus,
	MailReportType,
	MailSetKind,
	MailState,
	NewsletterBannerRule,
	OperationType,
} from "../../../common/api/common/TutanotaConstants"
import { EntityClient } from "../../../common/api/common/EntityClient"
import { MailboxDetail, MailboxModel } from "../../../common/mailFunctionality/MailboxModel.js"
import { ContactModel } from "../../../common/contactsFunctionality/ContactModel.js"
import { ConfigurationDatabase } from "../../../common/api/worker/facades/lazy/ConfigurationDatabase.js"
import stream from "mithril/stream"
import {
	addAll,
	assertNonNull,
	assertNotNull,
	contains,
	downcast,
	filterInt,
	first,
	isEmpty,
	lazyAsync,
	noOp,
	Nullable,
	ofClass,
	startsWith,
	utf8Uint8ArrayToString,
} from "@tutao/tutanota-utils"
import { lang } from "../../../common/misc/LanguageViewModel"
import { LoginController } from "../../../common/api/main/LoginController"
import m from "mithril"
import { LockedError, NotAuthorizedError, NotFoundError } from "../../../common/api/common/error/RestError"
import { haveSameId, isSameId } from "../../../common/api/common/utils/EntityUtils"
import { getReferencedAttachments, loadInlineImages, moveMails, moveMailsToSystemFolder, showDownloadProgressDialog } from "./MailGuiUtils"
import { SanitizedFragment } from "../../../common/misc/HtmlSanitizer"
import { CALENDAR_MIME_TYPE, FileController } from "../../../common/file/FileController"
import { exportMails } from "../export/Exporter.js"
import { IndexingNotSupportedError } from "../../../common/api/common/error/IndexingNotSupportedError"
import { FileOpenError } from "../../../common/api/common/error/FileOpenError"
import { Dialog } from "../../../common/gui/base/Dialog"
import { checkApprovalStatus } from "../../../common/misc/LoginUtils"
import { formatDateTime, urlEncodeHtmlTags } from "../../../common/misc/Formatter"
import { UserError } from "../../../common/api/main/UserError"
import { showUserError } from "../../../common/misc/ErrorHandlerImpl"
import { LoadingStateTracker } from "../../../common/offline/LoadingState"
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError"
import { InitAsResponseArgs } from "../../../common/mailFunctionality/SendMailModel.js"
import { EventController } from "../../../common/api/main/EventController.js"
import { WorkerFacade } from "../../../common/api/worker/facades/WorkerFacade.js"
import { SearchModel } from "../../search/model/SearchModel.js"
import { ParsedIcalFileContent } from "../../../calendar-app/calendar/view/CalendarInvites.js"
import { MailFacade } from "../../../common/api/worker/facades/lazy/MailFacade.js"
import {
	EntityEventsListener,
	EntityUpdateData,
	isUpdateForTypeRef,
	OnEntityUpdateReceivedPriority,
} from "../../../common/api/common/utils/EntityUpdateUtils.js"
import { isOfflineError } from "../../../common/api/common/utils/ErrorUtils.js"
import { CryptoFacade } from "../../../common/api/worker/crypto/CryptoFacade.js"
import { AttachmentType, getAttachmentType } from "../../../common/gui/AttachmentBubble.js"
import type { ContactImporter } from "../../contacts/ContactImporter.js"
import { InlineImages, revokeInlineImages } from "../../../common/mailFunctionality/inlineImagesUtils.js"
import { getDefaultSender, getEnabledMailAddressesWithUser, getMailboxName, isTutaTeamMail } from "../../../common/mailFunctionality/SharedMailUtils.js"
import { getDisplayedSender, getMailBodyText, MailAddressAndName } from "../../../common/api/common/CommonMailUtils.js"
import { MailModel, MoveMode } from "../model/MailModel.js"
import { isNoReplyTeamAddress, isSystemNotification, loadMailDetails } from "./MailViewerUtils.js"
import { assertSystemFolderOfType, getFolderName, getPathToFolderString, loadMailHeaders } from "../model/MailUtils.js"
import { isDraft, isEditableDraft, isMailDeletable, isMailMovable, isMailScheduled } from "../model/MailChecks"
import type { SearchToken } from "../../../common/api/common/utils/QueryTokenUtils"
import { CalendarEventsRepository } from "../../../common/calendar/date/CalendarEventsRepository.js"
import { mailLocator } from "../../mailLocator.js"
import { MailViewModel } from "./MailViewModel"
import { modal, ModalComponent } from "../../../common/gui/base/Modal.js"
import { MobyPhishConfirmSenderModal } from "./MobyPhishConfirmSenderModal.js"
import { getDisplayedSenderWithDomainReplacement } from "./MailAddressDisplayUtils.js"
import { UndoModel } from "../../UndoModel"
import { isBrowser } from "../../../common/api/common/Env"
import { CommonSystemFacade } from "../../../common/native/common/generatedipc/CommonSystemFacade"
import { TransferProgressDispatcher } from "../../../common/api/main/TransferProgressDispatcher"
import { locator } from "../../../common/api/main/CommonLocator"

export const enum ContentBlockingStatus {
	Block = "0",
	Show = "1",
	AlwaysShow = "2",
	NoExternalContent = "3",
	AlwaysBlock = "4",
}
export const TRUSTED_SENDERS_API_URL = "http://localhost:3000"

export interface TrustedSenderInfo {
	name: string
	address: string
}

export type UnsubscribeAction = {
	type: UnsubscribeType
	requestUrl: string
}

export const enum UnsubscribeType {
	HTTP_POST_UNSUBSCRIBE = "HTTP_POST_UNSUBSCRIBE",
	HTTP_GET_UNSUBSCRIBE = "HTTP_GET_UNSUBSCRIBE",
	MAILTO_UNSUBSCRIBE = "MAILTO_UNSUBSCRIBE",
}

export const enum FailureBannerType {
	None,
	Phishing,
	MailAuthenticationHardFail,
	MailAuthenticationSoftFail,
	DeprecatedPublicKey,
}

export const LIST_UNSUBSCRIBE_POST_PAYLOAD = "List-Unsubscribe=One-Click"

export class MailViewerViewModel {
	private forceLightMode: boolean = false
	// always sanitized in this.sanitizeMailBody

	private sanitizeResult: SanitizedFragment | null = null
	private loadingAttachments: boolean = false
	private attachments: TutanotaFile[] = []

	private contentBlockingStatus: ContentBlockingStatus | null = null

	private errorOccurredWhileLoadingMailDetails: boolean = false
	private loadedInlineImages: InlineImages | null = null
	/** only loaded when showFolder is set to true */
	private folderMailboxText: string | null

	/** @see getRelevantRecipient */
	private relevantRecipient: MailAddress | null = null
	private warningDismissed: boolean = false

	private calendarEventAttachment: {
		contents: ParsedIcalFileContent
		recipient: string
	} | null = null

	private readonly loadingState = new LoadingStateTracker()

	private renderIsDelayed: boolean = true

	readonly loadCompleteNotification = stream<null>()

	private renderedMail: Mail | null = null
	private loading: Promise<void> | null = null

	private collapsed: boolean = true
	private newsletterBannerRule: NewsletterBannerRule | null = null

	get mail(): Mail {
		return this._mail
	}

	private mailDetails: MailDetails | null = null

	public trustedSenders = stream<Array<TrustedSenderInfo>>([])
	private senderConfirmed: boolean = false
	public senderStatus: string = "" // confirmed, denied, added_to_trusted, removed_from_trusted, reported_phishing
	public interactionType: string = "" // interacted, no_interaction

	private readonly viewModelId = Math.random().toString(36).substring(2, 8)

	constructor(
		private _mail: Mail,
		showFolder: boolean,
		readonly entityClient: EntityClient,
		public readonly mailboxModel: MailboxModel,
		public readonly mailModel: MailModel,
		public readonly commonSystemFacade: Nullable<CommonSystemFacade>,
		readonly contactModel: ContactModel,
		private readonly configFacade: ConfigurationDatabase,
		private readonly fileController: FileController,
		readonly logins: LoginController,
		private readonly eventController: EventController,
		private readonly workerFacade: WorkerFacade,
		private readonly searchModel: SearchModel,
		private readonly mailFacade: MailFacade,
		private readonly cryptoFacade: CryptoFacade,
		private readonly contactImporter: lazyAsync<ContactImporter>,
		private readonly highlightedStrings: readonly SearchToken[],
		readonly eventsRepository: CalendarEventsRepository,
		private readonly undoModel: UndoModel,
		private readonly transferProgressDispatcher: TransferProgressDispatcher,
	) {
		this.folderMailboxText = null
		if (showFolder) {
			this.showFolder()
		}
		this.eventController.addEntityListener(this.entityListener)
		this.fetchSenderData()
	}

	async fetchSenderData(): Promise<void> {
		const userEmail = this.logins.getUserController().loginUsername
		const emailId = this.mail._id[1]
		const senderEmail = getDisplayedSenderWithDomainReplacement(this.mail).address

		try {
			const [trustedResponse, statusResponse] = await Promise.all([
				fetch(`${TRUSTED_SENDERS_API_URL}/trusted-senders/${userEmail}`, {
					headers: { Accept: "application/json" },
					credentials: "include",
					mode: "cors",
				}),
				fetch(`${TRUSTED_SENDERS_API_URL}/email-status/${userEmail}/${emailId}`, {
					headers: { Accept: "application/json" },
					credentials: "include",
					mode: "cors",
				}),
			])

			if (!trustedResponse.ok) throw new Error("Failed to fetch trusted senders.")
			if (!statusResponse.ok) throw new Error("Failed to fetch sender status.")

			const trustedData = await trustedResponse.json()
			const statusData = await statusResponse.json()

			const trustedSendersList: TrustedSenderInfo[] = Array.isArray(trustedData.trusted_senders) ? trustedData.trusted_senders : []

			this.trustedSenders(trustedSendersList)
			console.log("updated trustedSenders (objects):", this.trustedSenders())

			// Check if sender is still in trusted list (by email)
			const isTrustedByEmail = trustedSendersList.some((sender) => sender.address.toLowerCase() === senderEmail)

			// Check if sender name is still in trusted list
			const displayedSender = getDisplayedSenderWithDomainReplacement(this.mail)
			const senderName = displayedSender?.name?.trim()
			const isTrustedByName = senderName
				? trustedSendersList.some((sender) => {
						const trustedName = sender.name?.trim()
						return trustedName && trustedName.toLowerCase() === senderName.toLowerCase()
					})
				: false

			let currentStatus = statusData.status || ""

			// FIX: If previously marked as trusted/confirmed, but now not in the trusted list, override status
			if ((currentStatus === "added_to_trusted" || currentStatus === "confirmed") && !isTrustedByEmail && !isTrustedByName) {
				console.log("🔒 MOBYPHISH_LOG: Sender was removed from trusted list – overriding status from '" + currentStatus + "' to empty.")
				currentStatus = "" // Reset it so it behaves like a new/unconfirmed sender
			}

			// Don't overwrite trusted_once or confirmed status if it was just set (unless explicitly removed from trusted list)
			// This prevents fetchSenderData from resetting the status immediately after user action
			if (this.senderStatus === "trusted_once" || this.senderStatus === "confirmed") {
				if (currentStatus === "" && (isTrustedByEmail || isTrustedByName)) {
					// Keep the current status if it's trusted_once/confirmed and sender is still in trusted list
					currentStatus = this.senderStatus
					console.log(`🔒 MOBYPHISH_LOG: Preserving sender status "${this.senderStatus}" - sender still in trusted list`)
				}
			}

			this.senderStatus = currentStatus
			this.interactionType = statusData.interaction_type

			// Update confirmation flag
			const isConfirmed = currentStatus === "confirmed" || currentStatus === "trusted_once"
			this.setSenderConfirmed(isConfirmed)

			console.log("Sender Data Fetched:", {
				trustedSenders: this.trustedSenders(),
				senderStatus: this.senderStatus,
				senderConfirmed: this.isSenderConfirmed(),
			})

			m.redraw()
		} catch (error) {
			console.error("Error fetching sender data:", error)
		}
	}

	isSenderTrusted(): boolean {
		// First check: Must pass email authentication (SPF/DKIM/DMARC)
		if (!this.checkMailAuthenticationStatus(MailAuthenticationStatus.AUTHENTICATED)) {
			return false
		}

		// Second check: Must be in trust-list
		const senderEmail = getDisplayedSenderWithDomainReplacement(this.mail).address
		return this.trustedSenders().some((sender) => sender.address.toLowerCase() === senderEmail)
	}

	/**
	 * Check if the sender's name (not email) is in the trusted senders list
	 */
	isSenderNameTrusted(): boolean {
		const displayedSender = getDisplayedSenderWithDomainReplacement(this.mail)
		const senderName = displayedSender?.name?.trim()

		if (!senderName) {
			return false
		}

		// Check if any trusted sender has the same name
		return this.trustedSenders().some((sender) => {
			const trustedName = sender.name?.trim()
			return trustedName && trustedName.toLowerCase() === senderName.toLowerCase()
		})
	}

	setSenderConfirmed(confirmed: boolean): void {
		console.log(`✅ setSenderConfirmed(${confirmed}) called → sender="${getDisplayedSenderWithDomainReplacement(this.mail).address}"`)
		this.senderConfirmed = confirmed
	}

	isSenderConfirmed(): boolean {
		return this.senderConfirmed
	}

	async updateSenderStatus(status: string): Promise<void> {
		console.log(`🔒 MOBYPHISH_LOG: updateSenderStatus called with status="${status}" for sender="${this.mail.sender.address}"`)

		const userEmail = this.logins.getUserController().loginUsername
		const emailId = this.mail._id[1]

		try {
			const response = await fetch(`${TRUSTED_SENDERS_API_URL}/update-email-status`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					user_email: userEmail,
					email_id: emailId,
					sender_email: getDisplayedSenderWithDomainReplacement(this.mail).address,
					status: status,
				}),
				credentials: "include",
				mode: "cors",
			})

			if (!response.ok) throw new Error("Failed to update sender status.")

			console.log(`🔒 MOBYPHISH_LOG: Successfully updated sender status to "${status}" for sender="${this.mail.sender.address}"`)
			this.senderStatus = status

			await this.fetchSenderData()

			if (status === "confirmed" || status === "trusted_once") {
				console.log(`🔒 MOBYPHISH_LOG: Sender confirmed as trusted - re-sanitizing to show images`)
				this.setSenderConfirmed(true)
				// Update content blocking status and re-sanitize to unblock images
				await this.setContentBlockingStatus(ContentBlockingStatus.AlwaysShow)
				this.expandMail(Promise.resolve())
				m.redraw()
			} else {
				m.redraw()
			}
		} catch (error) {
			console.error(`🔒 MOBYPHISH_LOG: Error updating sender status to "${status}":`, error)
			await this.fetchSenderData()
			m.redraw()
		}
	}

	showPhishingModal(): void {
		console.log(`🔒 MOBYPHISH_LOG: showPhishingModal called for sender="${this.mail.sender.address}", isSenderConfirmed=${this.isSenderConfirmed()}`)

		if (this.isSenderConfirmed()) {
			console.log(`🔒 MOBYPHISH_LOG: Sender already confirmed, not showing modal`)
			return
		}

		console.log(`🔒 MOBYPHISH_LOG: Displaying MobyPhishConfirmSenderModal`)
		const modalInstance = new MobyPhishConfirmSenderModal(this, this.trustedSenders())
		modal.display(modalInstance)
		modalInstance.setModalHandle(modalInstance)
	}

	async resetSenderStatusForCurrentEmail(): Promise<void> {
		const userEmail = this.logins.getUserController().loginUsername
		const emailId = this.mail._id[1]
		//console.log(`🔒 MOBYPHISH_LOG: Removing sender from whitelist for emailId=${emailId}, sender="${this.mail.sender.address}"`)
		//remove sender functionality will be removed
		try {
			const response = await fetch(`${TRUSTED_SENDERS_API_URL}/reset-single-email-status`, {
				method: "DELETE", // Use DELETE method
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					// Send data in body
					user_email: userEmail,
					email_id: emailId,
				}),
				credentials: "include",
				mode: "cors",
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.message || `Failed to reset email status (${response.status})`)
			}

			console.log(`🔒 MOBYPHISH_LOG: Successfully removed sender from whitelist for emailId=${emailId}. Refetching data.`)

			// Reset internal state immediately for responsiveness
			this.senderStatus = "" // Or null, matching fetchSenderData's default
			this.senderConfirmed = false
			// Crucially, reset content blocking if needed
			this.contentBlockingStatus = ContentBlockingStatus.Block // Reset to default blocked state
			this.sanitizeResult = null // Force resanitize
			this.renderedMail = null // Force rerender

			// Refetch all data to get the definitive state from the backend and trigger UI update
			await this.fetchSenderData()
			// Force a re-render and re-sanitization etc. by calling loadAll again
			// This might be overkill if fetchSenderData handles redraws, but ensures everything updates
			await this.loadAll(Promise.resolve(), { notify: true })
			// Ensure mail is expanded if it was collapsed by state changes
			if (this.isCollapsed()) {
				this.expandMail(Promise.resolve())
			}
			m.redraw()
		} catch (error) {
			console.error(`🔒 MOBYPHISH_LOG: Error removing sender from whitelist for emailId=${emailId}:`, error)
			// Optionally show user error message here
			// showUserError(new UserError("Failed to untrust sender. Please try again."));
			// Refetch data even on error to ensure consistency
			await this.fetchSenderData()
			m.redraw()
		}
	}

	private readonly entityListener: EntityEventsListener = {
		onEntityUpdatesReceived: async (events: EntityUpdateData[]) => {
			for (const update of events) {
				if (isUpdateForTypeRef(MailTypeRef, update)) {
					const { instanceListId, instanceId, operation } = update
					if (operation === OperationType.UPDATE && isSameId(this.mail._id, [instanceListId, instanceId])) {
						try {
							const updatedMail = await this.entityClient.load(MailTypeRef, this.mail._id)
							this.updateMail({ mail: updatedMail })
						} catch (e) {
							if (e instanceof NotFoundError) {
								console.log(`could not find updated mail ${JSON.stringify([instanceListId, instanceId])}`)
							} else {
								throw e
							}
						}
					}
				}
			}
		},
		priority: OnEntityUpdateReceivedPriority.NORMAL,
	}

	private async determineRelevantRecipient() {
		// The idea is that if there are multiple recipients, then we should display the one which belongs to one of our mailboxes and then fall back to any
		// other one
		const mailboxDetails = await this.mailModel.getMailboxDetailsForMail(this.mail)
		if (mailboxDetails == null) {
			return
		}
		const enabledMailAddresses = new Set(getEnabledMailAddressesWithUser(mailboxDetails, this.logins.getUserController().userGroupInfo))
		if (this.mailDetails == null) {
			// we could not load the mailDetails for some reason
			return
		}
		this.relevantRecipient =
			this.mailDetails.recipients.toRecipients.find((r) => enabledMailAddresses.has(r.address)) ??
			this.mailDetails.recipients.ccRecipients.find((r) => enabledMailAddresses.has(r.address)) ??
			this.mailDetails.recipients.bccRecipients.find((r) => enabledMailAddresses.has(r.address)) ??
			first(this.mailDetails.recipients.toRecipients) ??
			first(this.mailDetails.recipients.ccRecipients) ??
			first(this.mailDetails.recipients.bccRecipients)
		m.redraw()
	}

	private showFolder() {
		this.folderMailboxText = null
		const folder = this.mailModel.getMailFolderForMail(this.mail)

		if (folder) {
			this.mailModel.getMailboxDetailsForMail(this.mail).then(async (mailboxDetails) => {
				if (mailboxDetails == null) {
					return
				}
				const folders = await this.mailModel.getMailboxFoldersForId(mailboxDetails.mailbox.mailSets._id)
				const name = getPathToFolderString(folders, folder)
				this.folderMailboxText = `${getMailboxName(this.logins, mailboxDetails)} / ${name}`
				m.redraw()
			})
		}
	}

	dispose() {
		// currently, the conversation view disposes us twice if our mail is deleted because it's getting disposed itself
		// (from the list selecting a different element) and because it disposes the mailViewerViewModel that got updated
		// this silences the warning about leaking entity event listeners when the listener is removed twice.
		this.dispose = () => console.log("disposed MailViewerViewModel a second time, ignoring")
		this.eventController.removeEntityListener(this.entityListener)
		const inlineImages = this.getLoadedInlineImages()
		revokeInlineImages(inlineImages)
	}

	async loadAll(
		delay: Promise<unknown>,
		{
			notify,
		}: {
			notify: boolean
		} = { notify: true },
	) {
		this.renderIsDelayed = true
		try {
			await this.loading
			try {
				this.loading = this.loadAndProcessAdditionalMailInfo(this.mail, delay)
					.then((inlineImageCids) => {
						this.determineRelevantRecipient()
						return inlineImageCids
					})
					.then((inlineImageCids) => this.loadAttachments(this.mail, inlineImageCids))
				await this.loadingState.trackPromise(this.loading)

				if (notify) this.loadCompleteNotification(null)
			} catch (e) {
				this.loading = null

				if (!isOfflineError(e)) {
					throw e
				}
			}

			m.redraw()

			// We need the conversation entry in order to reply to the message.
			// We don't want the user to have to wait for it to load when they click reply,
			// So we load it here pre-emptively to make sure it is in the cache.
			this.entityClient.load(ConversationEntryTypeRef, this.mail.conversationEntry).catch((e) => {
				if (e instanceof NotFoundError) {
					console.log("could load conversation entry as it has been moved/deleted already", e)
				} else if (isOfflineError(e)) {
					console.log("failed to load conversation entry, because of a lost connection", e)
				} else {
					throw e
				}
			})
		} finally {
			this.renderIsDelayed = false
		}
	}

	isLoading(): boolean {
		return this.loadingState.isLoading()
	}

	isConnectionLost(): boolean {
		return this.loadingState.isConnectionLost()
	}

	getAttachments(): Array<TutanotaFile> {
		return this.attachments
	}

	getInlineCids(): Array<string> {
		return this.sanitizeResult?.inlineImageCids ?? []
	}

	getLoadedInlineImages(): InlineImages {
		return this.loadedInlineImages ?? new Map()
	}

	setForceLightMode(forceLightMode: boolean) {
		this.forceLightMode = forceLightMode
	}

	getForceLightMode(): boolean {
		return this.forceLightMode
	}

	isDraftMail(): boolean {
		return isDraft(this.mail)
	}

	isScheduled(): boolean {
		return isMailScheduled(this.mail)
	}

	async unscheduleMail(): Promise<void> {
		await this.mailModel.unscheduleMail(this.mail)
	}

	isEditableDraft() {
		return isEditableDraft(this.mail)
	}

	isMovableMail() {
		return isMailMovable(this.mail, this.mailModel)
	}

	isDeletingMailAllowed() {
		const folderType = this.getFolderInfo()?.folderType
		return folderType != null && isPermanentDeleteAllowedMailSetKind(folderType) && isMailDeletable(this.mail)
	}

	isReceivedMail() {
		return this.mail.state === MailState.RECEIVED
	}

	isLoadingAttachments(): boolean {
		return this.loadingAttachments
	}

	getFolderMailboxText(): string | null {
		return this.folderMailboxText
	}

	getFolderInfo(): { folderType: MailSetKind; name: string } | null {
		const folder = this.mailModel.getMailFolderForMail(this.mail)
		if (!folder) return null
		return { folderType: folder.folderType as MailSetKind, name: getFolderName(folder) }
	}

	getSubject(): string {
		return this.mail.subject
	}

	isConfidential(): boolean {
		return this.mail.confidential
	}

	private isMailSuspicious(): boolean {
		return this.mail.phishingStatus === MailPhishingStatus.SUSPICIOUS
	}

	private isHardMailAuthenticationFailure(): boolean {
		return (
			this.mailDetails != null &&
			!this.checkMailAuthenticationStatus(MailAuthenticationStatus.AUTHENTICATED) &&
			!this.checkMailAuthenticationStatus(MailAuthenticationStatus.SOFT_FAIL)
		)
	}

	mustRenderFailureBanner(): FailureBannerType {
		if (this.isMailSuspicious()) {
			return FailureBannerType.Phishing
		} else if (!this.isWarningDismissed()) {
			if (this.isHardMailAuthenticationFailure()) {
				return FailureBannerType.MailAuthenticationHardFail
			} else {
				if (this.mail.encryptionAuthStatus === EncryptionAuthStatus.RSA_DESPITE_TUTACRYPT) {
					return FailureBannerType.DeprecatedPublicKey
				} else if (this.checkMailAuthenticationStatus(MailAuthenticationStatus.SOFT_FAIL)) {
					return FailureBannerType.MailAuthenticationSoftFail
				}
			}
		}
		return FailureBannerType.None
	}

	getMailId(): IdTuple {
		return this.mail._id
	}

	getSanitizedMailBody(): DocumentFragment | null {
		return this.sanitizeResult?.fragment ?? null
	}

	getMailBody(): string {
		if (this.mailDetails) {
			return getMailBodyText(this.mailDetails.body)
		} else {
			return ""
		}
	}

	getDate(): Date {
		return this.mail.receivedDate
	}

	getToRecipients(): Array<MailAddress> {
		if (this.mailDetails === null) {
			return []
		}
		return this.mailDetails.recipients.toRecipients
	}

	getCcRecipients(): Array<MailAddress> {
		if (this.mailDetails === null) {
			return []
		}
		return this.mailDetails.recipients.ccRecipients
	}

	getBccRecipients(): Array<MailAddress> {
		if (this.mailDetails === null) {
			return []
		}
		return this.mailDetails.recipients.bccRecipients
	}

	/** Get the recipient which is relevant the most for the current mailboxes. */
	getRelevantRecipient(): MailAddress | null {
		return this.relevantRecipient
	}

	getNumberOfRecipients(): number {
		return filterInt(this.mail.recipientCount)
	}

	getReplyTos(): Array<EncryptedMailAddress> {
		if (this.mailDetails === null) {
			return []
		}
		return this.mailDetails.replyTos
	}

	getSender(): MailAddress {
		return this.mail.sender
	}

	/**
	 * Can be {@code null} if sender should not be displayed e.g. for system notifications.
	 */
	getDisplayedSender(): MailAddressAndName | null {
		if (isSystemNotification(this.mail)) {
			return null
		} else {
			return getDisplayedSender(this.mail)
		}
	}

	getPhishingStatus(): MailPhishingStatus {
		return this.mail.phishingStatus as MailPhishingStatus
	}

	setPhishingStatus(status: MailPhishingStatus) {
		this.mail.phishingStatus = status
	}

	checkMailAuthenticationStatus(status: MailAuthenticationStatus): boolean {
		if (this.mailDetails != null) {
			return this.mailDetails.authStatus === status
		} else {
			// mailDetails not loaded yet
			return false
		}
	}

	private authFailureLogged: boolean = false

	getAuthenticationFailureReason(): string | null {
		const authStatus = this.mail.authStatus ?? this.mailDetails?.authStatus

		if (!authStatus || authStatus === MailAuthenticationStatus.AUTHENTICATED) {
			return null
		}

		// Auto-log authentication failures as potential impersonation
		this.logAuthenticationFailure(authStatus)

		switch (authStatus) {
			case MailAuthenticationStatus.HARD_FAIL:
				return "This email failed SPF/DKIM verification or violates the sender's domain policy. The sending server is not authorized to send emails for this domain."
			case MailAuthenticationStatus.SOFT_FAIL:
				return "This email lacks proper authentication records (SPF/DKIM/DMARC). The sender's domain has not configured email security properly."
			case MailAuthenticationStatus.INVALID_MAIL_FROM:
				return "This email has an invalid 'From' header, preventing proper authentication checks. This is often a sign of spoofing."
			case MailAuthenticationStatus.MISSING_MAIL_FROM:
				return "This email is missing the 'From' header entirely. This is typically seen in automated or malicious emails."
			default:
				return "This email failed security verification for an unknown reason."
		}
	}

	private async logAuthenticationFailure(authStatus: string): Promise<void> {
		// Only log once per email to avoid duplicates
		if (this.authFailureLogged) {
			return
		}
		this.authFailureLogged = true

		const senderEmail = getDisplayedSenderWithDomainReplacement(this.mail).address
		const userEmail = this.logins.getUserController().loginUsername

		try {
			console.log(`🔒 MOBYPHISH_LOG: Auto-logging authentication failure for sender="${senderEmail}", status="${authStatus}"`)

			const response = await fetch(`${TRUSTED_SENDERS_API_URL}/update-email-status`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					user_email: userEmail,
					email_id: this.mail._id[1],
					sender_email: senderEmail,
					status: "reported_impersonation",
					interaction_type: "auto_detected",
					auth_failure_reason: authStatus,
				}),
			})

			if (response.ok) {
				console.log(`🔒 MOBYPHISH_LOG: Successfully auto-logged authentication failure for sender="${senderEmail}"`)
			} else {
				console.error(`🔒 MOBYPHISH_LOG: Failed to auto-log authentication failure for sender="${senderEmail}"`)
			}
		} catch (error) {
			console.error(`🔒 MOBYPHISH_LOG: Error auto-logging authentication failure:`, error)
		}
	}

	canCreateSpamRule(): boolean {
		return this.logins.isGlobalAdminUserLoggedIn() && !this.logins.isEnabled(FeatureType.InternalCommunication)
	}

	didErrorsOccur(): boolean {
		return this.errorOccurredWhileLoadingMailDetails || typeof this.mail._errors !== "undefined"
	}

	isTutanotaTeamMail(): boolean {
		return isTutaTeamMail(this.mail)
	}

	isShowingExternalContent(): boolean {
		return this.contentBlockingStatus === ContentBlockingStatus.Show || this.contentBlockingStatus === ContentBlockingStatus.AlwaysShow
	}

	isBlockingExternalImages(): boolean {
		return this.contentBlockingStatus === ContentBlockingStatus.Block || this.contentBlockingStatus === ContentBlockingStatus.AlwaysBlock
	}

	getDifferentEnvelopeSender(): string | null {
		return this.mail.differentEnvelopeSender
	}

	getCalendarEventAttachment(): MailViewerViewModel["calendarEventAttachment"] {
		return this.calendarEventAttachment
	}

	getContentBlockingStatus(): ContentBlockingStatus | null {
		return this.contentBlockingStatus
	}

	getNewsletterBannerRule(): NewsletterBannerRule | null {
		return this.newsletterBannerRule
	}

	private isWarningDismissed() {
		return this.warningDismissed
	}

	setWarningDismissed(dismissed: boolean) {
		this.warningDismissed = dismissed
	}

	async setContentBlockingStatus(status: ContentBlockingStatus): Promise<void> {
		// We can only be set to NoExternalContent when initially loading the mailbody (_loadMailBody)
		// so we ignore it here, and don't do anything if we were already set to NoExternalContent
		if (
			status === ContentBlockingStatus.NoExternalContent ||
			this.contentBlockingStatus === ContentBlockingStatus.NoExternalContent ||
			this.contentBlockingStatus === status
		) {
			return
		}

		if (status === ContentBlockingStatus.AlwaysShow) {
			this.configFacade.addExternalImageRule(this.getSender().address, ExternalImageRule.Allow).catch(ofClass(IndexingNotSupportedError, noOp))
		} else if (status === ContentBlockingStatus.AlwaysBlock) {
			this.configFacade.addExternalImageRule(this.getSender().address, ExternalImageRule.Block).catch(ofClass(IndexingNotSupportedError, noOp))
		} else {
			// we are going from allow or block to something else it means we're resetting to the default rule for the given sender
			this.configFacade.addExternalImageRule(this.getSender().address, ExternalImageRule.None).catch(ofClass(IndexingNotSupportedError, noOp))
		}

		// When status is Show or AlwaysShow, we should not block external content
		// When status is Block or AlwaysBlock, we should block external content
		const shouldBlockExternalContent = status === ContentBlockingStatus.Block || status === ContentBlockingStatus.AlwaysBlock
		this.sanitizeResult = await this.sanitizeMailBody(this.mail, shouldBlockExternalContent)
		//follow-up actions resulting from a changed blocking status must start after sanitization finished
		this.contentBlockingStatus = status
		m.redraw() // Redraw to update the mail body with new sanitization

		// If user allowed content (Show or AlwaysShow), load inline images if they haven't been loaded yet
		if ((status === ContentBlockingStatus.Show || status === ContentBlockingStatus.AlwaysShow) && this.sanitizeResult.inlineImageCids.length > 0) {
			// Ensure attachments are loaded first
			if (this.attachments.length === 0 && this.mail.attachments.length > 0) {
				// Attachments haven't been loaded yet, load them first
				try {
					const files = await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, await this.mailFacade.loadAttachments(this.mail))
					this.attachments = files
				} catch (e) {
					console.error("Failed to load attachments for inline images:", e)
				}
			}

			// Load inline images if we have attachments
			// Note: We always reload inline images when allowing content, even if they were loaded before,
			// because the sanitization might have changed the CIDs or structure
			if (this.attachments.length > 0) {
				try {
					// Clear any previously loaded inline images to force reload
					if (this.loadedInlineImages) {
						revokeInlineImages(this.loadedInlineImages)
						this.loadedInlineImages = null
					}

					// Load the inline images
					this.loadedInlineImages = await loadInlineImages(this.fileController, this.attachments, this.sanitizeResult.inlineImageCids)

					// Trigger multiple redraws and notifications to ensure MailViewer replaces inline images
					// First redraw to update the mail body with new sanitization
					m.redraw()

					// Wait for DOM to update, then trigger load complete notification
					// This will cause MailViewer to call replaceInlineImages() after the mail body is rendered
					await Promise.resolve()
					setTimeout(() => {
						this.loadCompleteNotification(null)
						// Trigger another redraw after notification to ensure replacement happens
						setTimeout(() => {
							m.redraw()
						}, 50)
					}, 150)
				} catch (e) {
					console.error("Failed to load inline images after allowing content:", e)
				}
			}
		}

		// Force re-render by clearing renderedMail so the mail body is re-rendered with unblocked content
		if (status === ContentBlockingStatus.Show || status === ContentBlockingStatus.AlwaysShow) {
			console.log(`🔒 MOBYPHISH_LOG: Content unblocked - forcing mail body re-render to show images`)
			this.renderedMail = null
		}
	}

	async setNewsletterBannerRuleConfig(rule: NewsletterBannerRule): Promise<void> {
		await this.configFacade.addNewsletterBannerRule(this.getSender().address, rule).catch(ofClass(IndexingNotSupportedError, noOp))
	}

	async updateNewsletterBannerRule(): Promise<void> {
		this.newsletterBannerRule = await this.configFacade.getNewsletterBannerRule(this.mail.sender.address)
	}

	async updateMailPhishingStatus(newStatus: MailPhishingStatus): Promise<void> {
		const oldStatus = this.getPhishingStatus()

		if (oldStatus === newStatus) {
			return
		}

		this.setPhishingStatus(newStatus)

		await this.entityClient.update(this.mail).catch(() => this.setPhishingStatus(oldStatus))
	}

	async markAsPhishing(): Promise<void> {
		await this.updateMailPhishingStatus(MailPhishingStatus.SUSPICIOUS)
	}

	async markAsNotPhishing(): Promise<void> {
		await this.updateMailPhishingStatus(MailPhishingStatus.WHITELISTED)
	}

	async reportMail(reportType: MailReportType): Promise<void> {
		if (reportType === MailReportType.PHISHING) {
			console.log(`🔒 MOBYPHISH_LOG: Report phishing button clicked...`)
		}

		try {
			// YOUR custom backend API call for phishing
			if (reportType === MailReportType.PHISHING) {
				const senderEmail = this.getSender().address
				const userEmail = this.logins.getUserController().loginUsername
				try {
					const response = await fetch(`${TRUSTED_SENDERS_API_URL}/update-email-status`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							user_email: userEmail,
							email_id: this.mail._id[1],
							sender_email: senderEmail,
							status: "reported_phishing",
							interaction_type: "interacted",
						}),
					})
					if (response.ok) {
						console.log(`🔒 MOBYPHISH_LOG: Successfully reported phishing to backend`)
					}
				} catch (fetchError) {
					console.error(`🔒 MOBYPHISH_LOG: Error calling backend API:`, fetchError)
				}
			}

			// UPSTREAM's folder moving logic
			const mailboxDetail = await this.mailModel.getMailboxDetailsForMail(this.mail)
			if (mailboxDetail == null) return

			const folders = await this.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.mailSets._id)
			const spamFolder = assertSystemFolderOfType(folders, MailSetKind.SPAM)

			if (reportType === MailReportType.PHISHING) {
				await this.markAsPhishing()
				await this.mailModel.moveMails([this.mail._id], spamFolder, MoveMode.Mails)
				await this.mailModel.reportMails(MailReportType.PHISHING, [this.mail])
			} else {
				await moveMails({
					mailboxModel: this.mailboxModel,
					mailModel: this.mailModel,
					mailIds: [this.mail._id],
					targetFolder: spamFolder,
					moveMode: MoveMode.Mails,
					undoModel: this.undoModel,
					contactModel: mailLocator.contactModel,
				})
			}
		} catch (e) {
			if (e instanceof NotFoundError) {
				console.log("mail already moved")
			} else {
				throw e
			}
		}
	}

	async reportNotSpamForMail() {
		const hasMailMoved = await this.reapplyInboxRuleForMail()
		if (!hasMailMoved) {
			const mailFolderForMail = this.mailModel.getMailFolderForMail(this.mail)
			if (!mailFolderForMail) {
				return
			}

			await moveMailsToSystemFolder({
				mailboxModel: this.mailboxModel,
				mailModel: this.mailModel,
				currentFolder: mailFolderForMail,
				mailIds: [this.mail._id],
				targetFolderType: MailSetKind.INBOX,
				moveMode: MoveMode.Mails,
				undoModel: this.undoModel,
				contactModel: mailLocator.contactModel,
			})
		}
	}

	async reapplyInboxRuleForMail() {
		const inboxRuleHandler = mailLocator.processInboxHandler()

		const mail = this.mail
		if (!mail._ownerGroup) {
			return false
		}
		const mailboxDetail = await this.mailboxModel.getMailboxDetailsForMailGroup(mail._ownerGroup)

		const currentFolder = this.mailModel.getMailFolderForMail(mail)
		if (!currentFolder) {
			return false
		}

		const targetFolder = await inboxRuleHandler.processInboxRulesOnly(mail, currentFolder, mailboxDetail)

		if (isSameId(currentFolder._id, targetFolder._id)) {
			return false
		}

		await moveMails({
			targetFolder,
			mailboxModel: locator.mailboxModel,
			mailModel: mailLocator.mailModel,
			mailIds: [mail._id],
			moveMode: MoveMode.Mails,
			undoModel: this.undoModel,
			contactModel: mailLocator.contactModel,
		})

		return true
	}

	canExport(): boolean {
		return !this.isAnnouncement() && !this.logins.isEnabled(FeatureType.DisableMailExport)
	}

	canPrint(): boolean {
		return !this.logins.isEnabled(FeatureType.DisableMailExport)
	}

	canReportSpam(): boolean {
		return this.logins.isInternalUserLoggedIn() && !this.isDraftMail() && this.getFolderInfo()?.folderType !== MailSetKind.SPAM
	}

	canReportPhishing(): boolean {
		return (
			this.logins.isInternalUserLoggedIn() && !this.isDraftMail() && this.getPhishingStatus() === MailPhishingStatus.UNKNOWN && !this.isTutanotaTeamMail()
		)
	}

	canReportNotSpam(): boolean {
		return this.logins.isInternalUserLoggedIn() && this.getFolderInfo()?.folderType === MailSetKind.SPAM
	}

	canReapplyInboxRules(): boolean {
		return this.logins.isInternalUserLoggedIn() && this.getFolderInfo()?.folderType === MailSetKind.INBOX
	}

	canShowHeaders(): boolean {
		return this.logins.isInternalUserLoggedIn()
	}

	canPersistBlockingStatus(): boolean {
		return this.searchModel.indexingSupported
	}

	async exportMail(): Promise<void> {
		await exportMails([this.mail], this.mailFacade, this.entityClient, this.fileController, this.cryptoFacade)
	}

	async getHeaders(): Promise<string | null> {
		// make sure that the mailDetails are loaded
		const mailDetails = await loadMailDetails(this.mailFacade, this.mail)
		return loadMailHeaders(mailDetails)
	}

	isUnread(): boolean {
		return this.mail.unread
	}

	async setUnread(unread: boolean) {
		if (this.mail.unread !== unread) {
			this.mail.unread = unread

			await this.entityClient
				.update(this.mail)
				.catch(ofClass(LockedError, () => console.log("could not update mail read state: ", lang.get("operationStillActive_msg"))))
				.catch(ofClass(NotFoundError, noOp))
		}
	}

	isAnnouncement(): boolean {
		const replyTos = this.mailDetails?.replyTos
		return (
			isSystemNotification(this.mail) &&
			// hide the actions until mailDetails are loaded rather than showing them quickly and then hiding them
			(replyTos == null || replyTos?.length === 0 || (replyTos?.length === 1 && isNoReplyTeamAddress(replyTos[0].address)))
		)
	}

	isListUnsubscribe(): boolean {
		return this.mail.listUnsubscribe
	}

	hasListUnsubscribeHeader(): boolean {
		if (this.mailDetails == null) {
			return false
		}
		const mailHeaders = loadMailHeaders(this.mailDetails)
		if (mailHeaders == null) {
			return false
		}
		const listUnsubscribeHeaders = mailHeaders
			.replaceAll(/\r\n/g, "\n") // replace all CR LF with LF
			.replaceAll(/\n[ \t]/g, "") // join multiline headers to a single line
			.split("\n") // split headers
			.filter((headerLine) => headerLine.toLowerCase().startsWith("list-unsubscribe:"))
		return !isEmpty(listUnsubscribeHeaders)
	}

	isImportedMail(): boolean {
		return this.mailModel.getImportedMailSets().some((mailSet) => this._mail.sets.find((mailSetId) => isSameId(mailSetId, mailSet._id)))
	}

	private decodeMimeHeader(value: string): string {
		return value.replace(/=\?([^?]+)\?([QB])\?([^?]+)\?=/gi, (_, _charset, encoding, encodedText) => {
			if (encoding.toUpperCase() === "Q") {
				return encodedText.replace(/_/g, " ").replace(/=([A-Fa-f0-9]{2})/g, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)))
			} else if (encoding.toUpperCase() === "B") {
				try {
					return Buffer.from(encodedText, "base64").toString("utf-8")
				} catch {
					return encodedText
				}
			}
			return encodedText
		})
	}

	async determineUnsubscribeOrder(): Promise<Array<UnsubscribeAction>> {
		const mailHeaders = await this.getHeaders()
		const unsubscribeActions: Array<UnsubscribeAction> = []
		if (!mailHeaders) {
			return unsubscribeActions
		}

		const normalizedHeaders = mailHeaders
			.replaceAll(/\r\n/g, "\n")
			.replaceAll(/\n[ \t]/g, "")
			.split("\n")
			.map((h) => this.decodeMimeHeader(h.trim()))

		const listUnsubscribeHeaders = normalizedHeaders.filter((headerLine) => headerLine.toLowerCase().startsWith("list-unsubscribe:"))

		if (isEmpty(listUnsubscribeHeaders)) {
			return unsubscribeActions
		}

		const unsubPostHeader = normalizedHeaders.find((h) => h.toLowerCase().startsWith("list-unsubscribe-post"))

		const [_, ...value] = listUnsubscribeHeaders[0].split(":")
		const headerValue = value.join(":")
		const links = headerValue.split(/,(?![^<>]*>)/)

		for (const link of links) {
			const trimmedLink = link.trim()
			if (trimmedLink.startsWith("<http") && trimmedLink.endsWith(">")) {
				unsubscribeActions.push({
					type: unsubPostHeader != null ? UnsubscribeType.HTTP_POST_UNSUBSCRIBE : UnsubscribeType.HTTP_GET_UNSUBSCRIBE,
					requestUrl: trimmedLink.slice(1, -1),
				})
			} else if (trimmedLink.startsWith("<mailto:") && trimmedLink.endsWith(">")) {
				unsubscribeActions.push({
					type: UnsubscribeType.MAILTO_UNSUBSCRIBE,
					requestUrl: trimmedLink.slice(1, -1),
				})
			}
		}

		// http links have priority over mailto links
		const sortedActions: UnsubscribeAction[] = []

		const httpAction = unsubscribeActions.find(
			(action) => action.type === UnsubscribeType.HTTP_POST_UNSUBSCRIBE || action.type === UnsubscribeType.HTTP_GET_UNSUBSCRIBE,
		)
		if (httpAction) {
			sortedActions.push(httpAction)
		}

		const mailToAction = unsubscribeActions.find((action) => action.type === UnsubscribeType.MAILTO_UNSUBSCRIBE)
		if (mailToAction) {
			sortedActions.push(mailToAction)
		}

		return sortedActions
	}

	async unsubscribePost(unsubscribeAction: UnsubscribeAction): Promise<boolean> {
		if (!this.isListUnsubscribe()) {
			return false
		}

		if (unsubscribeAction.type !== UnsubscribeType.HTTP_POST_UNSUBSCRIBE) {
			return false
		}

		const unsubscribePostUrl = assertNotNull(unsubscribeAction.requestUrl)
		if (isBrowser()) {
			// In case we are on the webApp we can not execute the POST request directly
			// from the client. However, the user is informed that the list unsubscribe url will
			// be sent to our server in this case.
			await this.mailModel.serverUnsubscribe(this.mail, unsubscribePostUrl)
			return true
		} else {
			const isPostRequestSuccessful = await assertNotNull(this.commonSystemFacade).executePostRequest(unsubscribePostUrl, LIST_UNSUBSCRIBE_POST_PAYLOAD)
			if (isPostRequestSuccessful) {
				this.mail.listUnsubscribe = false
				await this.entityClient.update(this.mail)
			}
			return isPostRequestSuccessful
		}
	}

	getHighlightedStrings(): readonly SearchToken[] {
		return this.highlightedStrings
	}

	getMailboxDetails(): Promise<MailboxDetail | null> {
		return this.mailModel.getMailboxDetailsForMail(this.mail)
	}

	/** @return list of inline referenced cid */
	private async loadAndProcessAdditionalMailInfo(mail: Mail, delayBodyRenderingUntil: Promise<unknown>): Promise<string[]> {
		console.log(
			`🔒 MOBYPHISH_LOG: loadAndProcessAdditionalMailInfo called - mailId="${mail._id[1]}", confidential=${mail.confidential}, isTutanotaTeamMail=${isTutanotaTeamMail(mail)}, senderStatus="${this.senderStatus}"`,
		)
		// If the mail is a non-draft and we have loaded it before, we don't need to reload it because it cannot have been edited, so we return early
		// drafts however can be edited, and we want to receive the changes, so for drafts we will always reload
		// BUT: if sender status changed to confirmed/trusted_once, we need to re-sanitize to show images
		let isDraftMail = isDraft(mail)
		const shouldShowImages = this.senderStatus === "trusted_once" || this.senderStatus === "confirmed"
		const currentlyBlocking = this.contentBlockingStatus === ContentBlockingStatus.Block || this.contentBlockingStatus === ContentBlockingStatus.AlwaysBlock
		const needsReSanitization = shouldShowImages && currentlyBlocking

		// in case we got errors earlier we also want to retry, e.g. to fix temporary decryption failures (when the sender key cannot be fetched)
		if (
			!this.didErrorsOccur() &&
			this.renderedMail != null &&
			haveSameId(mail, this.renderedMail) &&
			!isDraftMail &&
			this.sanitizeResult != null &&
			!needsReSanitization
		) {
			console.log(`🔒 MOBYPHISH_LOG: Early return in loadAndProcessAdditionalMailInfo - mail already rendered, returning cached inlineImageCids`)
			return this.sanitizeResult.inlineImageCids
		}

		if (needsReSanitization) {
			console.log(`🔒 MOBYPHISH_LOG: Sender status changed to "${this.senderStatus}" - re-sanitizing to show images`)
		}

		try {
			console.log(`🔒 MOBYPHISH_LOG: Loading mail details...`)
			this.mailDetails = await loadMailDetails(this.mailFacade, this.mail)
			this.errorOccurredWhileLoadingMailDetails = typeof downcast(this.mailDetails)._errors !== "undefined"
			console.log(`🔒 MOBYPHISH_LOG: Mail details loaded successfully`)
		} catch (e) {
			if (e instanceof NotFoundError) {
				console.log("could load mail body as it has been moved/deleted already", e)
				this.errorOccurredWhileLoadingMailDetails = true
				return []
			}

			if (e instanceof NotAuthorizedError) {
				console.log("could load mail body as the permission is missing", e)
				this.errorOccurredWhileLoadingMailDetails = true
				return []
			}

			throw e
		}

		const externalImageRule = await this.configFacade.getExternalImageRule(mail.sender.address).catch((e) => {
			console.log("Error getting external image rule:", e)
			return ExternalImageRule.None
		})
		const isAllowedAndAuthenticatedExternalSender =
			externalImageRule === ExternalImageRule.Allow && this.checkMailAuthenticationStatus(MailAuthenticationStatus.AUTHENTICATED)

		// Default to blocking content for non-confirmed senders, regardless of authentication status or tutamail address
		// Users can still manually unblock content via the "Show Blocked Content" button
		// If sender status is already trusted_once or confirmed, show images
		if (this.senderStatus === "trusted_once" || this.senderStatus === "confirmed") {
			console.log(`🔒 MOBYPHISH_LOG: Sender is trusted (${this.senderStatus}) — pre-setting to AlwaysShow BEFORE sanitizing`)
			this.contentBlockingStatus = ContentBlockingStatus.AlwaysShow
		} else if (!this.isSenderTrusted() && !this.isSenderConfirmed()) {
			// Non-trusted, non-confirmed senders: block by default (user can unblock manually)
			console.log("Sender not trusted or confirmed — pre-setting to Block BEFORE sanitizing (blocking ALL content including images by default)")
			this.contentBlockingStatus = ContentBlockingStatus.Block
		} else {
			// For senders that are trusted but not yet confirmed, block by default
			// This ensures ALL content (including images) is blocked by default until explicitly confirmed
			// User can still manually unblock via "Show Blocked Content" button
			console.log("Sender is trusted but not confirmed — pre-setting to Block BEFORE sanitizing (blocking ALL content including images by default)")
			this.contentBlockingStatus = ContentBlockingStatus.Block
		}

		// Wait to render heavy mail content
		await delayBodyRenderingUntil
		this.renderIsDelayed = false

		const shouldBlockImages = this.isBlockingExternalImages()
		const senderEmail = getDisplayedSenderWithDomainReplacement(mail).address
		const isTutanotaMail = isTutanotaTeamMail(mail)
		console.log(
			`🔒 MOBYPHISH_LOG: About to sanitize mail body - sender="${senderEmail}", isTutanotaMail=${isTutanotaMail}, senderStatus="${this.senderStatus}", contentBlockingStatus="${this.contentBlockingStatus}", shouldBlockImages=${shouldBlockImages}`,
		)

		this.sanitizeResult = await this.sanitizeMailBody(mail, shouldBlockImages)

		if (!isDraftMail) {
			this.checkMailForPhishing(mail, this.sanitizeResult.links)
		}

		await this.updateNewsletterBannerRule()

		m.redraw()
		this.renderedMail = this.mail
		return this.sanitizeResult.inlineImageCids
	}

	private async loadAttachments(mail: Mail, inlineCids: string[]): Promise<void> {
		if (mail.attachments.length === 0) {
			this.loadingAttachments = false
			//Setting attachments to empty when we remove the last attachment from the list
			this.attachments = []
			m.redraw()
		} else {
			this.loadingAttachments = true

			try {
				const files = await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, await this.mailFacade.loadAttachments(mail))

				this.handleCalendarFile(files, mail)

				this.attachments = files
				this.loadingAttachments = false
				m.redraw()

				// Only load inline images if content blocking status allows it (Show or AlwaysShow)
				// This ensures inline images are not loaded until user explicitly allows content
				const canLoadInlineImages =
					this.contentBlockingStatus === ContentBlockingStatus.Show || this.contentBlockingStatus === ContentBlockingStatus.AlwaysShow

				// We can load any other part again because they are cached but inline images are fileData e.g. binary blobs so we don't cache them like
				// entities. So instead we check here whether we need to load them.
				if (canLoadInlineImages && this.loadedInlineImages == null && inlineCids.length > 0) {
					this.loadedInlineImages = await loadInlineImages(this.fileController, files, inlineCids)
					m.redraw()
				}
			} catch (e) {
				if (e instanceof NotFoundError) {
					console.log("could load attachments as they have been moved/deleted already", e)
				} else {
					throw e
				}
			}
		}
	}

	private checkMailForPhishing(mail: Mail, links: Array<HTMLElement>) {
		if (mail.phishingStatus === MailPhishingStatus.UNKNOWN) {
			const linkObjects = links.map((link) => {
				return {
					href: link.getAttribute("href") || "",
					innerHTML: link.innerHTML,
				}
			})

			this.mailModel.checkMailForPhishing(mail, linkObjects).then((isSuspicious) => {
				if (isSuspicious) {
					mail.phishingStatus = MailPhishingStatus.SUSPICIOUS

					this.entityClient
						.update(mail)
						.catch(ofClass(LockedError, (_: any) => console.log("could not update mail phishing status as mail is locked")))
						.catch(ofClass(NotFoundError, (_: any) => console.log("mail already moved")))

					m.redraw()
				}
			})
		}
	}

	/**
	 * Check if the list of files contain an iCal file which we can then load and display details for. A calendar notification
	 * should contain only one iCal attachment, so we only process the first matching one.
	 *
	 * (this is not true for ie google calendar, they send the invite twice in each mail, but it's always the same file twice)
	 */
	private handleCalendarFile(files: Array<TutanotaFile>, mail: Mail): void {
		const calendarFile = files.find((a) => a.mimeType && a.mimeType.startsWith(CALENDAR_MIME_TYPE))

		if (calendarFile && (mail.method === MailMethod.ICAL_REQUEST || mail.method === MailMethod.ICAL_REPLY) && mail.state === MailState.RECEIVED) {
			Promise.all([
				import("../../../calendar-app/calendar/view/CalendarInvites.js").then(({ getEventsFromFile }) => getEventsFromFile(calendarFile)),
				this.getSenderOfResponseMail(),
			]).then(([contents, recipient]) => {
				this.calendarEventAttachment =
					contents != null
						? {
								contents,
								recipient,
							}
						: null
				m.redraw()
			})
		}
	}

	private getSenderOfResponseMail(): Promise<string> {
		return this.mailModel.getMailboxDetailsForMail(this.mail).then(async (mailboxDetails) => {
			assertNonNull(mailboxDetails, "Mail list does not exist anymore")
			const myMailAddresses = getEnabledMailAddressesWithUser(mailboxDetails as MailboxDetail, this.logins.getUserController().userGroupInfo)
			const addressesInMail: MailAddress[] = []
			const mailDetails = await loadMailDetails(this.mailFacade, this.mail)
			addressesInMail.push(...mailDetails.recipients.toRecipients)
			addressesInMail.push(...mailDetails.recipients.ccRecipients)
			addressesInMail.push(...mailDetails.recipients.bccRecipients)

			const mailAddressAndName = this.getDisplayedSender()
			if (mailAddressAndName) {
				addressesInMail.push(
					createMailAddress({
						name: mailAddressAndName.name,
						address: mailAddressAndName.address,
						contact: null,
					}),
				)
			}
			const foundAddress = addressesInMail.find((address) => contains(myMailAddresses, address.address.toLowerCase()))
			if (foundAddress) {
				return foundAddress.address.toLowerCase()
			} else {
				return getDefaultSender(this.logins, mailboxDetails as MailboxDetail)
			}
		})
	}

	/** @throws UserError */
	async forward(): Promise<void> {
		const sendAllowed = await checkApprovalStatus(this.logins, false)
		if (sendAllowed) {
			const args = await this.createResponseMailArgsForForwarding([], [], true)
			const [mailboxDetails, { newMailEditorAsResponse }] = await Promise.all([this.getMailboxDetails(), import("../editor/MailEditor")])
			if (mailboxDetails == null) {
				return
			}

			const isReloadNeeded = !this.sanitizeResult || this.mail.attachments.length !== this.attachments.length
			if (isReloadNeeded) {
				// Call this again to make sure everything is loaded, including inline images because this can be called earlier than all the parts are loaded.
				await this.loadAll(Promise.resolve(), { notify: true })
			}
			const editor = await newMailEditorAsResponse(args, this.isBlockingExternalImages(), this.getLoadedInlineImages(), mailboxDetails)
			editor?.show()
		}
	}

	private async createResponseMailArgsForForwarding(
		recipients: MailAddress[],
		replyTos: EncryptedMailAddress[],
		addSignature: boolean,
	): Promise<InitAsResponseArgs> {
		let infoLine = lang.get("date_label") + ": " + formatDateTime(this.mail.receivedDate) + "<br>"
		const senderAddress = this.getDisplayedSender()?.address
		if (senderAddress) {
			infoLine += lang.get("from_label") + ": " + senderAddress + "<br>"
		}

		if (this.getToRecipients().length > 0) {
			infoLine +=
				lang.get("to_label") +
				": " +
				this.getToRecipients()
					.map((recipient) => recipient.address)
					.join(", ")
			infoLine += "<br>"
		}

		if (this.getCcRecipients().length > 0) {
			infoLine +=
				lang.get("cc_label") +
				": " +
				this.getCcRecipients()
					.map((recipient) => recipient.address)
					.join(", ")
			infoLine += "<br>"
		}

		const mailSubject = this.getSubject() || ""
		infoLine += lang.get("subject_label") + ": " + urlEncodeHtmlTags(mailSubject)
		const body = infoLine + '<br><br><blockquote class="tutanota_quote">' + this.getMailBody() + "</blockquote>"
		const { prependEmailSignature } = await import("../signature/Signature")
		const senderMailAddress = await this.getSenderOfResponseMail()
		return {
			previousMail: this.mail,
			conversationType: ConversationType.FORWARD,
			senderMailAddress,
			recipients,
			attachments: this.attachments.slice(),
			subject: "FWD: " + mailSubject,
			bodyText: addSignature ? prependEmailSignature(body, this.logins) : body,
			replyTos,
		}
	}

	async reply(replyAll: boolean): Promise<void> {
		if (this.isAnnouncement()) {
			return
		}

		const sendAllowed = await checkApprovalStatus(this.logins, false)

		if (sendAllowed) {
			const mailboxDetails = await this.mailModel.getMailboxDetailsForMail(this.mail)
			if (mailboxDetails == null) {
				return
			}

			// We already know it is not an announcement email and we want to get the sender even if it
			// is hidden. It will be replaced with replyTo() anyway
			const mailAddressAndName = getDisplayedSender(this.mail)
			const sender = createMailAddress({
				name: mailAddressAndName.name,
				address: mailAddressAndName.address,
				contact: null,
			})
			const prefix = "Re: "
			const mailSubject = this.getSubject()
			const subject = mailSubject ? (startsWith(mailSubject.toUpperCase(), prefix.toUpperCase()) ? mailSubject : prefix + mailSubject) : ""
			const infoLine = formatDateTime(this.getDate()) + " " + lang.get("by_label") + " " + sender.address + ":"
			const body = infoLine + '<br><blockquote class="tutanota_quote">' + this.getMailBody() + "</blockquote>"
			const toRecipients: MailAddress[] = []
			const ccRecipients: MailAddress[] = []
			const bccRecipients: MailAddress[] = []

			if (!this.logins.getUserController().isInternalUser() && this.isReceivedMail()) {
				toRecipients.push(sender)
			} else if (this.isReceivedMail()) {
				if (this.getReplyTos().some((address) => !downcast(address)._errors)) {
					addAll(toRecipients, this.getReplyTos())
				} else {
					toRecipients.push(sender)
				}

				if (replyAll) {
					let myMailAddresses = getEnabledMailAddressesWithUser(mailboxDetails, this.logins.getUserController().userGroupInfo)
					addAll(
						ccRecipients,
						this.getToRecipients().filter((recipient) => !contains(myMailAddresses, recipient.address.toLowerCase())),
					)
					addAll(
						ccRecipients,
						this.getCcRecipients().filter((recipient) => !contains(myMailAddresses, recipient.address.toLowerCase())),
					)
				}
			} else {
				// this is a sent email, so use the to recipients as new recipients
				addAll(toRecipients, this.getToRecipients())

				if (replyAll) {
					addAll(ccRecipients, this.getCcRecipients())
					addAll(bccRecipients, this.getBccRecipients())
				}
			}

			const { prependEmailSignature } = await import("../signature/Signature.js")
			const { newMailEditorAsResponse } = await import("../editor/MailEditor")

			const isReloadNeeded = !this.sanitizeResult || this.mail.attachments.length !== this.attachments.length
			if (isReloadNeeded) {
				await this.loadAll(Promise.resolve(), { notify: true })
			}
			// It should be there after loadAll() but if not we just give up
			const inlineImageCids = this.sanitizeResult?.inlineImageCids ?? []

			const [senderMailAddress, referencedCids] = await Promise.all([this.getSenderOfResponseMail(), inlineImageCids])

			const attachmentsForReply = getReferencedAttachments(this.attachments, referencedCids)
			try {
				const editor = await newMailEditorAsResponse(
					{
						previousMail: this.mail,
						conversationType: ConversationType.REPLY,
						senderMailAddress,
						recipients: {
							to: toRecipients,
							cc: ccRecipients,
							bcc: bccRecipients,
						},
						attachments: attachmentsForReply,
						subject,
						bodyText: prependEmailSignature(body, this.logins),
						replyTos: [],
					},
					this.isBlockingExternalImages() || !this.isShowingExternalContent(),
					this.getLoadedInlineImages(),
					mailboxDetails,
				)
				editor?.show()
			} catch (e) {
				if (e instanceof UserError) {
					showUserError(e)
				} else {
					throw e
				}
			}
		}
	}

	private async sanitizeMailBody(mail: Mail, blockExternalContent: boolean): Promise<SanitizedFragment> {
		const { getHtmlSanitizer } = await import("../../../common/misc/HtmlSanitizer")
		const rawBody = this.getMailBody()

		// UPSTREAM's urlify (keep this)
		const urlified = await this.workerFacade.urlify(rawBody).catch((e) => {
			console.warn("Failed to urlify mail body!", e)
			return rawBody
		})

		const isTutanotaMail = isTutanotaTeamMail(mail)

		// YOUR logging (keep this)
		console.log(
			`🔒 MOBYPHISH_LOG: sanitizeMailBody called - blockExternalContent=${blockExternalContent}, isTutanotaMail=${isTutanotaMail}, sender="${getDisplayedSenderWithDomainReplacement(mail).address}"`,
		)

		const sanitizeResult = getHtmlSanitizer().sanitizeFragment(urlified, {
			blockExternalContent,
			allowRelativeLinks: isTutanotaMail,
			usePlaceholderForInlineImages: true,
			highlightedStrings: this.highlightedStrings,
		})
		const { fragment, inlineImageCids, links, blockedExternalContent } = sanitizeResult
		console.log(
			`🔒 MOBYPHISH_LOG: Sanitization complete - blockedExternalContent=${blockedExternalContent}, inlineImageCids=${inlineImageCids.length}, links=${links.length}`,
		)

		m.redraw()
		return {
			// We want to stringify and return the fragment here, because once a fragment is appended to a DOM Node, it's children are moved
			// and the fragment is left empty. If we cache the fragment and then append that directly to the DOM tree when rendering, there are cases where
			// we would try to do so twice, and on the second pass the mail body will be left blank
			fragment,
			inlineImageCids,
			links,
			blockedExternalContent,
		}
	}

	getNonInlineAttachments(): TutanotaFile[] {
		// If we have attachments it is safe to assume that we already have body and referenced cids from it
		const inlineFileIds = this.sanitizeResult?.inlineImageCids ?? []
		return this.attachments.filter((a) => a.cid == null || !inlineFileIds.includes(a.cid))
	}

	async downloadAll(): Promise<void> {
		const nonInlineAttachments = await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, this.getNonInlineAttachments())
		try {
			await showDownloadProgressDialog(
				this.transferProgressDispatcher,
				nonInlineAttachments,
				this.fileController.downloadAll(nonInlineAttachments, ArchiveDataType.Attachments),
			)
		} catch (e) {
			if (e instanceof FileOpenError) {
				console.warn("FileOpenError", e)
				await Dialog.message("canNotOpenFileOnDevice_msg")
			} else {
				console.error("could not open file:", e.message ?? "unknown error")
				await Dialog.message("errorDuringFileOpen_msg")
			}
		}
	}

	async downloadAndOpenAttachment(file: TutanotaFile, open: boolean) {
		file = (await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, [file]))[0]
		try {
			if (open) {
				await showDownloadProgressDialog(this.transferProgressDispatcher, [file], this.fileController.open(file))
			} else {
				await showDownloadProgressDialog(this.transferProgressDispatcher, [file], this.fileController.download(file))
			}
		} catch (e) {
			if (e instanceof FileOpenError) {
				console.warn("FileOpenError", e)
				await Dialog.message("canNotOpenFileOnDevice_msg")
			} else {
				console.error("could not open file:", e.message ?? "unknown error")
				await Dialog.message("errorDuringFileOpen_msg")
			}
		}
	}

	async importAttachment(file: TutanotaFile) {
		const attachmentType = getAttachmentType(file.mimeType ?? "")
		if (attachmentType === AttachmentType.CONTACT) {
			await this.importContacts(file)
		} else if (attachmentType === AttachmentType.CALENDAR) {
			await this.importCalendar(file)
		}
	}

	private async importContacts(file: TutanotaFile) {
		file = (await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, [file]))[0]
		try {
			const dataFile = await this.fileController.getAsDataFile(file)
			const contactListId = await this.contactModel.getContactListId()
			// this shouldn't happen but if it did we can just bail
			if (contactListId == null) return
			const contactImporter = await this.contactImporter()
			await contactImporter.importContactsFromFile(utf8Uint8ArrayToString(dataFile.data), contactListId)
		} catch (e) {
			console.log(e)
			throw new UserError("errorDuringFileOpen_msg")
		}
	}

	private async importCalendar(file: TutanotaFile) {
		file = (await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, [file]))[0]
		try {
			const { importCalendarFile, parseCalendarFile } = await import("../../../common/calendar/gui/CalendarImporter.js")
			const dataFile = await this.fileController.getAsDataFile(file)
			const data = parseCalendarFile(dataFile)
			await importCalendarFile(await mailLocator.calendarModel(), this.logins.getUserController(), data.contents)
		} catch (e) {
			console.log(e)
			throw new UserError("errorDuringFileOpen_msg")
		}
	}

	canImportFile(file: TutanotaFile): boolean {
		if (!this.logins.isInternalUserLoggedIn() || file.mimeType == null) {
			return false
		}
		const attachmentType = getAttachmentType(file.mimeType)
		return attachmentType === AttachmentType.CONTACT || attachmentType === AttachmentType.CALENDAR
	}

	canReply(): boolean {
		return !this.isDraftMail() && !this.isAnnouncement()
	}

	canReplyAll(): boolean {
		return (
			this.canReply() &&
			this.logins.getUserController().isInternalUser() &&
			this.getToRecipients().length + this.getCcRecipients().length + this.getBccRecipients().length > 1
		)
	}

	canForward(): boolean {
		return !this.isDraftMail() && !this.isAnnouncement() && this.logins.getUserController().isInternalUser()
	}

	shouldDelayRendering(): boolean {
		return this.renderIsDelayed
	}

	isCollapsed(): boolean {
		return this.collapsed
	}

	expandMail(delayBodyRendering: Promise<unknown>): void {
		// Wait for sender data before loading mail
		this.fetchSenderData().then(() => {
			this.loadAll(delayBodyRendering, { notify: true })
			m.redraw()
		})

		if (this.isUnread()) {
			// When we automatically mark email as read (e.g. opening it from notification) we don't want to run into offline errors, but we still want to mark
			// the email as read once we log in.
			// It is appropriate to show the error when the user marks the email as unread explicitly but less so when they open it and just didn't reach the
			// full login yet.
			this.logins.waitForFullLogin().then(() => this.setUnread(false))
		}
		this.collapsed = false
	}

	collapseMail(): void {
		this.collapsed = true
	}

	getLabels(): readonly MailSet[] {
		return this.mailModel.getLabelsForMail(this.mail).sort((labelA, labelB) => labelA.name.localeCompare(labelB.name))
	}

	private updateMail({ mail, showFolder }: { mail: Mail; showFolder?: boolean }) {
		if (!isSameId(mail._id, this.mail._id)) {
			throw new ProgrammingError(
				`Trying to update MailViewerViewModel with unrelated email ${JSON.stringify(this.mail._id)} ${JSON.stringify(mail._id)} ${m.route.get()}`,
			)
		}
		this._mail = mail

		this.folderMailboxText = null
		if (showFolder) {
			this.showFolder()
		}

		this.relevantRecipient = null
		this.determineRelevantRecipient()

		this.loadAll(Promise.resolve(), { notify: true })
	}

	isExternalUser() {
		return !this.logins.isInternalUserLoggedIn()
	}
}
