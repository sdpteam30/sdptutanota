import { ConversationEntryTypeRef, createMailAddress, MailTypeRef, } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { FeatureType, MailAuthenticationStatus, MailSetKind, } from "../../../common/api/common/TutanotaConstants";
import stream from "mithril/stream";
import { addAll, assertNonNull, contains, downcast, filterInt, first, noOp, ofClass, startsWith, utf8Uint8ArrayToString, } from "@tutao/tutanota-utils";
import { lang } from "../../../common/misc/LanguageViewModel";
import m from "mithril";
import { LockedError, NotAuthorizedError, NotFoundError } from "../../../common/api/common/error/RestError";
import { haveSameId, isSameId } from "../../../common/api/common/utils/EntityUtils";
import { getReferencedAttachments, isMailContrastFixNeeded, isTutanotaTeamMail, loadInlineImages, moveMails } from "./MailGuiUtils";
import { CALENDAR_MIME_TYPE } from "../../../common/file/FileController";
import { exportMails } from "../export/Exporter.js";
import { IndexingNotSupportedError } from "../../../common/api/common/error/IndexingNotSupportedError";
import { FileOpenError } from "../../../common/api/common/error/FileOpenError";
import { Dialog } from "../../../common/gui/base/Dialog";
import { checkApprovalStatus } from "../../../common/misc/LoginUtils";
import { formatDateTime, urlEncodeHtmlTags } from "../../../common/misc/Formatter";
import { UserError } from "../../../common/api/main/UserError";
import { showUserError } from "../../../common/misc/ErrorHandlerImpl";
import { LoadingStateTracker } from "../../../common/offline/LoadingState";
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { isOfflineError } from "../../../common/api/common/utils/ErrorUtils.js";
import { AttachmentType, getAttachmentType } from "../../../common/gui/AttachmentBubble.js";
import { revokeInlineImages } from "../../../common/mailFunctionality/inlineImagesUtils.js";
import { getDefaultSender, getEnabledMailAddressesWithUser, getMailboxName } from "../../../common/mailFunctionality/SharedMailUtils.js";
import { getDisplayedSender, getMailBodyText } from "../../../common/api/common/CommonMailUtils.js";
import { isNoReplyTeamAddress, isSystemNotification, loadMailDetails } from "./MailViewerUtils.js";
import { assertSystemFolderOfType, getFolderName, getPathToFolderString, loadMailHeaders } from "../model/MailUtils.js";
import { mailLocator } from "../../mailLocator.js";
export class MailViewerViewModel {
    _mail;
    entityClient;
    mailboxModel;
    mailModel;
    contactModel;
    configFacade;
    fileController;
    logins;
    sendMailModelFactory;
    eventController;
    workerFacade;
    searchModel;
    mailFacade;
    cryptoFacade;
    contactImporter;
    contrastFixNeeded = false;
    // always sanitized in this.sanitizeMailBody
    sanitizeResult = null;
    loadingAttachments = false;
    attachments = [];
    contentBlockingStatus = null;
    errorOccurred = false;
    loadedInlineImages = null;
    /** only loaded when showFolder is set to true */
    folderMailboxText;
    /** @see getRelevantRecipient */
    relevantRecipient = null;
    warningDismissed = false;
    calendarEventAttachment = null;
    loadingState = new LoadingStateTracker();
    renderIsDelayed = true;
    loadCompleteNotification = stream();
    renderedMail = null;
    loading = null;
    collapsed = true;
    get mail() {
        return this._mail;
    }
    mailDetails = null;
    constructor(_mail, showFolder, entityClient, mailboxModel, mailModel, contactModel, configFacade, fileController, logins, sendMailModelFactory, eventController, workerFacade, searchModel, mailFacade, cryptoFacade, contactImporter) {
        this._mail = _mail;
        this.entityClient = entityClient;
        this.mailboxModel = mailboxModel;
        this.mailModel = mailModel;
        this.contactModel = contactModel;
        this.configFacade = configFacade;
        this.fileController = fileController;
        this.logins = logins;
        this.sendMailModelFactory = sendMailModelFactory;
        this.eventController = eventController;
        this.workerFacade = workerFacade;
        this.searchModel = searchModel;
        this.mailFacade = mailFacade;
        this.cryptoFacade = cryptoFacade;
        this.contactImporter = contactImporter;
        this.folderMailboxText = null;
        if (showFolder) {
            this.showFolder();
        }
        this.eventController.addEntityListener(this.entityListener);
    }
    entityListener = async (events) => {
        for (const update of events) {
            if (isUpdateForTypeRef(MailTypeRef, update)) {
                const { instanceListId, instanceId, operation } = update;
                // we need to process create events here because update and create events are optimized into a single create event during processing
                // when opening a mail from a notification while offline the view otherwise would not be updated when going online again,
                // and we would keep displaying an outdated view of the mail instance. timeline:
                // CREATE > Loaded and cached > Opened offline > Online > UPDATE (e.g. ownerEncSessionKey) > entity event processing starts
                // CREATE and UPDATE are merged into single CREATE event > CREATE event is processed here
                // and would be ignored even though the update is from after we loaded the mail.
                // This is critical as it also concerns encryptionAuthStatus
                if ((operation === "1" /* OperationType.UPDATE */ || operation === "0" /* OperationType.CREATE */) && isSameId(this.mail._id, [instanceListId, instanceId])) {
                    try {
                        const updatedMail = await this.entityClient.load(MailTypeRef, this.mail._id);
                        this.updateMail({ mail: updatedMail });
                    }
                    catch (e) {
                        if (e instanceof NotFoundError) {
                            console.log(`Could not find updated mail ${JSON.stringify([instanceListId, instanceId])}`);
                        }
                        else {
                            throw e;
                        }
                    }
                }
            }
        }
    };
    async determineRelevantRecipient() {
        // The idea is that if there are multiple recipients then we should display the one which belongs to one of our mailboxes and then fall back to any
        // other one
        const mailboxDetails = await this.mailModel.getMailboxDetailsForMail(this.mail);
        if (mailboxDetails == null) {
            return;
        }
        const enabledMailAddresses = new Set(getEnabledMailAddressesWithUser(mailboxDetails, this.logins.getUserController().userGroupInfo));
        if (this.mailDetails == null) {
            // we could not load the mailDetails for some reason
            return;
        }
        this.relevantRecipient =
            this.mailDetails.recipients.toRecipients.find((r) => enabledMailAddresses.has(r.address)) ??
                this.mailDetails.recipients.ccRecipients.find((r) => enabledMailAddresses.has(r.address)) ??
                this.mailDetails.recipients.bccRecipients.find((r) => enabledMailAddresses.has(r.address)) ??
                first(this.mailDetails.recipients.toRecipients) ??
                first(this.mailDetails.recipients.ccRecipients) ??
                first(this.mailDetails.recipients.bccRecipients);
        m.redraw();
    }
    showFolder() {
        this.folderMailboxText = null;
        const folder = this.mailModel.getMailFolderForMail(this.mail);
        if (folder) {
            this.mailModel.getMailboxDetailsForMail(this.mail).then(async (mailboxDetails) => {
                if (mailboxDetails == null || mailboxDetails.mailbox.folders == null) {
                    return;
                }
                const folders = await this.mailModel.getMailboxFoldersForId(mailboxDetails.mailbox.folders._id);
                const name = getPathToFolderString(folders, folder);
                this.folderMailboxText = `${getMailboxName(this.logins, mailboxDetails)} / ${name}`;
                m.redraw();
            });
        }
    }
    dispose() {
        // currently, the conversation view disposes us twice if our mail is deleted because it's getting disposed itself
        // (from the list selecting a different element) and because it disposes the mailViewerViewModel that got updated
        // this silences the warning about leaking entity event listeners when the listener is removed twice.
        this.dispose = () => console.log("disposed MailViewerViewModel a second time, ignoring");
        this.eventController.removeEntityListener(this.entityListener);
        const inlineImages = this.getLoadedInlineImages();
        revokeInlineImages(inlineImages);
    }
    async loadAll(delay, { notify, } = { notify: true }) {
        this.renderIsDelayed = true;
        try {
            await this.loading;
            try {
                this.loading = this.loadAndProcessAdditionalMailInfo(this.mail, delay)
                    .then((inlineImageCids) => {
                    this.determineRelevantRecipient();
                    return inlineImageCids;
                })
                    .then((inlineImageCids) => this.loadAttachments(this.mail, inlineImageCids));
                await this.loadingState.trackPromise(this.loading);
                if (notify)
                    this.loadCompleteNotification(null);
            }
            catch (e) {
                this.loading = null;
                if (!isOfflineError(e)) {
                    throw e;
                }
            }
            m.redraw();
            // We need the conversation entry in order to reply to the message.
            // We don't want the user to have to wait for it to load when they click reply,
            // So we load it here pre-emptively to make sure it is in the cache.
            this.entityClient.load(ConversationEntryTypeRef, this.mail.conversationEntry).catch((e) => {
                if (e instanceof NotFoundError) {
                    console.log("could load conversation entry as it has been moved/deleted already", e);
                }
                else if (isOfflineError(e)) {
                    console.log("failed to load conversation entry, because of a lost connection", e);
                }
                else {
                    throw e;
                }
            });
        }
        finally {
            this.renderIsDelayed = false;
        }
    }
    isLoading() {
        return this.loadingState.isLoading();
    }
    isConnectionLost() {
        return this.loadingState.isConnectionLost();
    }
    getAttachments() {
        return this.attachments;
    }
    getInlineCids() {
        return this.sanitizeResult?.inlineImageCids ?? [];
    }
    getLoadedInlineImages() {
        return this.loadedInlineImages ?? new Map();
    }
    isContrastFixNeeded() {
        return this.contrastFixNeeded;
    }
    isDraftMail() {
        return this.mail.state === "0" /* MailState.DRAFT */;
    }
    isReceivedMail() {
        return this.mail.state === "2" /* MailState.RECEIVED */;
    }
    isLoadingAttachments() {
        return this.loadingAttachments;
    }
    getFolderMailboxText() {
        return this.folderMailboxText;
    }
    getFolderInfo() {
        const folder = this.mailModel.getMailFolderForMail(this.mail);
        if (!folder)
            return null;
        return { folderType: folder.folderType, name: getFolderName(folder) };
    }
    getSubject() {
        return this.mail.subject;
    }
    isConfidential() {
        return this.mail.confidential;
    }
    isMailSuspicious() {
        return this.mail.phishingStatus === "1" /* MailPhishingStatus.SUSPICIOUS */;
    }
    getMailId() {
        return this.mail._id;
    }
    getSanitizedMailBody() {
        return this.sanitizeResult?.fragment ?? null;
    }
    getMailBody() {
        if (this.mailDetails) {
            return getMailBodyText(this.mailDetails.body);
        }
        else {
            return "";
        }
    }
    getDate() {
        return this.mail.receivedDate;
    }
    getToRecipients() {
        if (this.mailDetails === null) {
            return [];
        }
        return this.mailDetails.recipients.toRecipients;
    }
    getCcRecipients() {
        if (this.mailDetails === null) {
            return [];
        }
        return this.mailDetails.recipients.ccRecipients;
    }
    getBccRecipients() {
        if (this.mailDetails === null) {
            return [];
        }
        return this.mailDetails.recipients.bccRecipients;
    }
    /** Get the recipient which is relevant the most for the current mailboxes. */
    getRelevantRecipient() {
        return this.relevantRecipient;
    }
    getNumberOfRecipients() {
        return filterInt(this.mail.recipientCount);
    }
    getReplyTos() {
        if (this.mailDetails === null) {
            return [];
        }
        return this.mailDetails.replyTos;
    }
    getSender() {
        return this.mail.sender;
    }
    /**
     * Can be {@code null} if sender should not be displayed e.g. for system notifications.
     */
    getDisplayedSender() {
        if (isSystemNotification(this.mail)) {
            return null;
        }
        else {
            return getDisplayedSender(this.mail);
        }
    }
    getPhishingStatus() {
        return this.mail.phishingStatus;
    }
    setPhishingStatus(status) {
        this.mail.phishingStatus = status;
    }
    checkMailAuthenticationStatus(status) {
        if (this.mail.authStatus != null) {
            return this.mail.authStatus === status;
        }
        else if (this.mailDetails) {
            return this.mailDetails.authStatus === status;
        }
        else {
            // mailDetails not loaded yet
            return false;
        }
    }
    canCreateSpamRule() {
        return this.logins.isGlobalAdminUserLoggedIn() && !this.logins.isEnabled(FeatureType.InternalCommunication);
    }
    didErrorsOccur() {
        let bodyErrors = false;
        if (this.mailDetails) {
            bodyErrors = typeof downcast(this.mailDetails.body)._errors !== "undefined";
        }
        return this.errorOccurred || typeof this.mail._errors !== "undefined" || bodyErrors;
    }
    isTutanotaTeamMail() {
        return isTutanotaTeamMail(this.mail);
    }
    isShowingExternalContent() {
        return this.contentBlockingStatus === "1" /* ContentBlockingStatus.Show */ || this.contentBlockingStatus === "2" /* ContentBlockingStatus.AlwaysShow */;
    }
    isBlockingExternalImages() {
        return this.contentBlockingStatus === "0" /* ContentBlockingStatus.Block */ || this.contentBlockingStatus === "4" /* ContentBlockingStatus.AlwaysBlock */;
    }
    getDifferentEnvelopeSender() {
        return this.mail.differentEnvelopeSender;
    }
    getCalendarEventAttachment() {
        return this.calendarEventAttachment;
    }
    getContentBlockingStatus() {
        return this.contentBlockingStatus;
    }
    isWarningDismissed() {
        return this.warningDismissed;
    }
    setWarningDismissed(dismissed) {
        this.warningDismissed = dismissed;
    }
    async setContentBlockingStatus(status) {
        // We can only be set to NoExternalContent when initially loading the mailbody (_loadMailBody)
        // so we ignore it here, and don't do anything if we were already set to NoExternalContent
        if (status === "3" /* ContentBlockingStatus.NoExternalContent */ ||
            this.contentBlockingStatus === "3" /* ContentBlockingStatus.NoExternalContent */ ||
            this.contentBlockingStatus === status) {
            return;
        }
        if (status === "2" /* ContentBlockingStatus.AlwaysShow */) {
            this.configFacade.addExternalImageRule(this.getSender().address, "1" /* ExternalImageRule.Allow */).catch(ofClass(IndexingNotSupportedError, noOp));
        }
        else if (status === "4" /* ContentBlockingStatus.AlwaysBlock */) {
            this.configFacade.addExternalImageRule(this.getSender().address, "2" /* ExternalImageRule.Block */).catch(ofClass(IndexingNotSupportedError, noOp));
        }
        else {
            // we are going from allow or block to something else it means we're resetting to the default rule for the given sender
            this.configFacade.addExternalImageRule(this.getSender().address, "0" /* ExternalImageRule.None */).catch(ofClass(IndexingNotSupportedError, noOp));
        }
        // We don't check mail authentication status here because the user has manually called this
        this.sanitizeResult = await this.sanitizeMailBody(this.mail, status === "0" /* ContentBlockingStatus.Block */ || status === "4" /* ContentBlockingStatus.AlwaysBlock */);
        //follow-up actions resulting from a changed blocking status must start after sanitization finished
        this.contentBlockingStatus = status;
    }
    async markAsNotPhishing() {
        const oldStatus = this.getPhishingStatus();
        if (oldStatus === "2" /* MailPhishingStatus.WHITELISTED */) {
            return;
        }
        this.setPhishingStatus("2" /* MailPhishingStatus.WHITELISTED */);
        await this.entityClient.update(this.mail).catch(() => this.setPhishingStatus(oldStatus));
    }
    async reportMail(reportType) {
        try {
            await this.mailModel.reportMails(reportType, [this.mail]);
            if (reportType === "0" /* MailReportType.PHISHING */) {
                this.setPhishingStatus("1" /* MailPhishingStatus.SUSPICIOUS */);
                await this.entityClient.update(this.mail);
            }
            const mailboxDetail = await this.mailModel.getMailboxDetailsForMail(this.mail);
            if (mailboxDetail == null || mailboxDetail.mailbox.folders == null) {
                return;
            }
            const folders = await this.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.folders._id);
            const spamFolder = assertSystemFolderOfType(folders, MailSetKind.SPAM);
            // do not report moved mails again
            await moveMails({
                mailboxModel: this.mailboxModel,
                mailModel: this.mailModel,
                mails: [this.mail],
                targetMailFolder: spamFolder,
                isReportable: false,
            });
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                console.log("mail already moved");
            }
            else {
                throw e;
            }
        }
    }
    canExport() {
        return !this.isAnnouncement() && !this.logins.isEnabled(FeatureType.DisableMailExport);
    }
    canPrint() {
        return !this.logins.isEnabled(FeatureType.DisableMailExport);
    }
    canReport() {
        return this.getPhishingStatus() === "0" /* MailPhishingStatus.UNKNOWN */ && !this.isTutanotaTeamMail() && this.logins.isInternalUserLoggedIn();
    }
    canShowHeaders() {
        return this.logins.isInternalUserLoggedIn();
    }
    canPersistBlockingStatus() {
        return this.searchModel.indexingSupported;
    }
    async exportMail() {
        await exportMails([this.mail], this.mailFacade, this.entityClient, this.fileController, this.cryptoFacade);
    }
    async getHeaders() {
        // make sure that the mailDetails are loaded
        const mailDetails = await loadMailDetails(this.mailFacade, this.mail);
        return loadMailHeaders(mailDetails);
    }
    isUnread() {
        return this.mail.unread;
    }
    async setUnread(unread) {
        if (this.mail.unread !== unread) {
            this.mail.unread = unread;
            await this.entityClient
                .update(this.mail)
                .catch(ofClass(LockedError, () => console.log("could not update mail read state: ", lang.get("operationStillActive_msg"))))
                .catch(ofClass(NotFoundError, noOp));
        }
    }
    isListUnsubscribe() {
        return this.mail.listUnsubscribe;
    }
    isAnnouncement() {
        const replyTos = this.mailDetails?.replyTos;
        return (isSystemNotification(this.mail) &&
            // hide the actions until mailDetails are loaded rather than showing them quickly and then hiding them
            (replyTos == null || replyTos?.length === 0 || (replyTos?.length === 1 && isNoReplyTeamAddress(replyTos[0].address))));
    }
    async unsubscribe() {
        if (!this.isListUnsubscribe()) {
            return false;
        }
        const mailHeaders = await this.getHeaders();
        if (!mailHeaders) {
            return false;
        }
        const unsubHeaders = mailHeaders
            .replaceAll(/\r\n/g, "\n") // replace all CR LF with LF
            .replaceAll(/\n[ \t]/g, "") // join multiline headers to a single line
            .split("\n") // split headers
            .filter((headerLine) => headerLine.toLowerCase().startsWith("list-unsubscribe"));
        if (unsubHeaders.length > 0) {
            const recipient = await this.getSenderOfResponseMail();
            await this.mailModel.unsubscribe(this.mail, recipient, unsubHeaders);
            return true;
        }
        else {
            return false;
        }
    }
    getMailboxDetails() {
        return this.mailModel.getMailboxDetailsForMail(this.mail);
    }
    /** @return list of inline referenced cid */
    async loadAndProcessAdditionalMailInfo(mail, delayBodyRenderingUntil) {
        // If the mail is a non-draft and we have loaded it before, we don't need to reload it because it cannot have been edited, so we return early
        // drafts however can be edited, and we want to receive the changes, so for drafts we will always reload
        let isDraft = mail.state === "0" /* MailState.DRAFT */;
        if (this.renderedMail != null && haveSameId(mail, this.renderedMail) && !isDraft && this.sanitizeResult != null) {
            return this.sanitizeResult.inlineImageCids;
        }
        try {
            this.mailDetails = await loadMailDetails(this.mailFacade, this.mail);
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                console.log("could load mail body as it has been moved/deleted already", e);
                this.errorOccurred = true;
                return [];
            }
            if (e instanceof NotAuthorizedError) {
                console.log("could load mail body as the permission is missing", e);
                this.errorOccurred = true;
                return [];
            }
            throw e;
        }
        const externalImageRule = await this.configFacade.getExternalImageRule(mail.sender.address).catch((e) => {
            console.log("Error getting external image rule:", e);
            return "0" /* ExternalImageRule.None */;
        });
        const isAllowedAndAuthenticatedExternalSender = externalImageRule === "1" /* ExternalImageRule.Allow */ && this.checkMailAuthenticationStatus(MailAuthenticationStatus.AUTHENTICATED);
        // We should not try to sanitize body while we still animate because it's a heavy operation.
        await delayBodyRenderingUntil;
        this.renderIsDelayed = false;
        this.sanitizeResult = await this.sanitizeMailBody(mail, !isAllowedAndAuthenticatedExternalSender);
        if (!isDraft) {
            this.checkMailForPhishing(mail, this.sanitizeResult.links);
        }
        this.contentBlockingStatus =
            externalImageRule === "2" /* ExternalImageRule.Block */
                ? "4" /* ContentBlockingStatus.AlwaysBlock */
                : isAllowedAndAuthenticatedExternalSender
                    ? "2" /* ContentBlockingStatus.AlwaysShow */
                    : this.sanitizeResult.blockedExternalContent > 0
                        ? "0" /* ContentBlockingStatus.Block */
                        : "3" /* ContentBlockingStatus.NoExternalContent */;
        m.redraw();
        this.renderedMail = this.mail;
        return this.sanitizeResult.inlineImageCids;
    }
    async loadAttachments(mail, inlineCids) {
        if (mail.attachments.length === 0) {
            this.loadingAttachments = false;
            m.redraw();
        }
        else {
            this.loadingAttachments = true;
            try {
                const files = await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, await this.mailFacade.loadAttachments(mail));
                this.handleCalendarFile(files, mail);
                this.attachments = files;
                this.loadingAttachments = false;
                m.redraw();
                // We can load any other part again because they are cached but inline images are fileData e.g. binary blobs so we don't cache them like
                // entities. So instead we check here whether we need to load them.
                if (this.loadedInlineImages == null) {
                    this.loadedInlineImages = await loadInlineImages(this.fileController, files, inlineCids);
                }
                m.redraw();
            }
            catch (e) {
                if (e instanceof NotFoundError) {
                    console.log("could load attachments as they have been moved/deleted already", e);
                }
                else {
                    throw e;
                }
            }
        }
    }
    checkMailForPhishing(mail, links) {
        if (mail.phishingStatus === "0" /* MailPhishingStatus.UNKNOWN */) {
            const linkObjects = links.map((link) => {
                return {
                    href: link.getAttribute("href") || "",
                    innerHTML: link.innerHTML,
                };
            });
            this.mailModel.checkMailForPhishing(mail, linkObjects).then((isSuspicious) => {
                if (isSuspicious) {
                    mail.phishingStatus = "1" /* MailPhishingStatus.SUSPICIOUS */;
                    this.entityClient
                        .update(mail)
                        .catch(ofClass(LockedError, (e) => console.log("could not update mail phishing status as mail is locked")))
                        .catch(ofClass(NotFoundError, (e) => console.log("mail already moved")));
                    m.redraw();
                }
            });
        }
    }
    /**
     * Check if the list of files contain an iCal file which we can then load and display details for. A calendar notification
     * should contain only one iCal attachment, so we only process the first matching one.
     *
     * (this is not true for ie google calendar, they send the invite twice in each mail, but it's always the same file twice)
     */
    handleCalendarFile(files, mail) {
        const calendarFile = files.find((a) => a.mimeType && a.mimeType.startsWith(CALENDAR_MIME_TYPE));
        if (calendarFile && (mail.method === "2" /* MailMethod.ICAL_REQUEST */ || mail.method === "3" /* MailMethod.ICAL_REPLY */) && mail.state === "2" /* MailState.RECEIVED */) {
            Promise.all([
                import("../../../calendar-app/calendar/view/CalendarInvites.js").then(({ getEventsFromFile }) => getEventsFromFile(calendarFile, mail.confidential)),
                this.getSenderOfResponseMail(),
            ]).then(([contents, recipient]) => {
                this.calendarEventAttachment =
                    contents != null
                        ? {
                            contents,
                            recipient,
                        }
                        : null;
                m.redraw();
            });
        }
    }
    getSenderOfResponseMail() {
        return this.mailModel.getMailboxDetailsForMail(this.mail).then(async (mailboxDetails) => {
            assertNonNull(mailboxDetails, "Mail list does not exist anymore");
            const myMailAddresses = getEnabledMailAddressesWithUser(mailboxDetails, this.logins.getUserController().userGroupInfo);
            const addressesInMail = [];
            const mailDetails = await loadMailDetails(this.mailFacade, this.mail);
            addressesInMail.push(...mailDetails.recipients.toRecipients);
            addressesInMail.push(...mailDetails.recipients.ccRecipients);
            addressesInMail.push(...mailDetails.recipients.bccRecipients);
            const mailAddressAndName = this.getDisplayedSender();
            if (mailAddressAndName) {
                addressesInMail.push(createMailAddress({
                    name: mailAddressAndName.name,
                    address: mailAddressAndName.address,
                    contact: null,
                }));
            }
            const foundAddress = addressesInMail.find((address) => contains(myMailAddresses, address.address.toLowerCase()));
            if (foundAddress) {
                return foundAddress.address.toLowerCase();
            }
            else {
                return getDefaultSender(this.logins, mailboxDetails);
            }
        });
    }
    /** @throws UserError */
    async forward() {
        const sendAllowed = await checkApprovalStatus(this.logins, false);
        if (sendAllowed) {
            const args = await this.createResponseMailArgsForForwarding([], [], true);
            const [mailboxDetails, { newMailEditorAsResponse }] = await Promise.all([this.getMailboxDetails(), import("../editor/MailEditor")]);
            if (mailboxDetails == null) {
                return;
            }
            const isReloadNeeded = !this.sanitizeResult || this.mail.attachments.length !== this.attachments.length;
            if (isReloadNeeded) {
                // Call this again to make sure everything is loaded, including inline images because this can be called earlier than all the parts are loaded.
                await this.loadAll(Promise.resolve(), { notify: true });
            }
            const editor = await newMailEditorAsResponse(args, this.isBlockingExternalImages(), this.getLoadedInlineImages(), mailboxDetails);
            editor.show();
        }
    }
    async createResponseMailArgsForForwarding(recipients, replyTos, addSignature) {
        let infoLine = lang.get("date_label") + ": " + formatDateTime(this.mail.receivedDate) + "<br>";
        const senderAddress = this.getDisplayedSender()?.address;
        if (senderAddress) {
            infoLine += lang.get("from_label") + ": " + senderAddress + "<br>";
        }
        if (this.getToRecipients().length > 0) {
            infoLine +=
                lang.get("to_label") +
                    ": " +
                    this.getToRecipients()
                        .map((recipient) => recipient.address)
                        .join(", ");
            infoLine += "<br>";
        }
        if (this.getCcRecipients().length > 0) {
            infoLine +=
                lang.get("cc_label") +
                    ": " +
                    this.getCcRecipients()
                        .map((recipient) => recipient.address)
                        .join(", ");
            infoLine += "<br>";
        }
        const mailSubject = this.getSubject() || "";
        infoLine += lang.get("subject_label") + ": " + urlEncodeHtmlTags(mailSubject);
        let body = infoLine + '<br><br><blockquote class="tutanota_quote">' + this.getMailBody() + "</blockquote>";
        const { prependEmailSignature } = await import("../signature/Signature");
        const senderMailAddress = await this.getSenderOfResponseMail();
        return {
            previousMail: this.mail,
            conversationType: "2" /* ConversationType.FORWARD */,
            senderMailAddress,
            recipients,
            attachments: this.attachments.slice(),
            subject: "FWD: " + mailSubject,
            bodyText: addSignature ? prependEmailSignature(body, this.logins) : body,
            replyTos,
        };
    }
    async reply(replyAll) {
        if (this.isAnnouncement()) {
            return;
        }
        const sendAllowed = await checkApprovalStatus(this.logins, false);
        if (sendAllowed) {
            const mailboxDetails = await this.mailModel.getMailboxDetailsForMail(this.mail);
            if (mailboxDetails == null) {
                return;
            }
            // We already know it is not an announcement email and we want to get the sender even if it
            // is hidden. It will be replaced with replyTo() anyway
            const mailAddressAndName = getDisplayedSender(this.mail);
            const sender = createMailAddress({
                name: mailAddressAndName.name,
                address: mailAddressAndName.address,
                contact: null,
            });
            let prefix = "Re: ";
            const mailSubject = this.getSubject();
            let subject = mailSubject ? (startsWith(mailSubject.toUpperCase(), prefix.toUpperCase()) ? mailSubject : prefix + mailSubject) : "";
            let infoLine = formatDateTime(this.getDate()) + " " + lang.get("by_label") + " " + sender.address + ":";
            let body = infoLine + '<br><blockquote class="tutanota_quote">' + this.getMailBody() + "</blockquote>";
            let toRecipients = [];
            let ccRecipients = [];
            let bccRecipients = [];
            if (!this.logins.getUserController().isInternalUser() && this.isReceivedMail()) {
                toRecipients.push(sender);
            }
            else if (this.isReceivedMail()) {
                if (this.getReplyTos().some((address) => !downcast(address)._errors)) {
                    addAll(toRecipients, this.getReplyTos());
                }
                else {
                    toRecipients.push(sender);
                }
                if (replyAll) {
                    let myMailAddresses = getEnabledMailAddressesWithUser(mailboxDetails, this.logins.getUserController().userGroupInfo);
                    addAll(ccRecipients, this.getToRecipients().filter((recipient) => !contains(myMailAddresses, recipient.address.toLowerCase())));
                    addAll(ccRecipients, this.getCcRecipients().filter((recipient) => !contains(myMailAddresses, recipient.address.toLowerCase())));
                }
            }
            else {
                // this is a sent email, so use the to recipients as new recipients
                addAll(toRecipients, this.getToRecipients());
                if (replyAll) {
                    addAll(ccRecipients, this.getCcRecipients());
                    addAll(bccRecipients, this.getBccRecipients());
                }
            }
            const { prependEmailSignature } = await import("../signature/Signature.js");
            const { newMailEditorAsResponse } = await import("../editor/MailEditor");
            const isReloadNeeded = !this.sanitizeResult || this.mail.attachments.length !== this.attachments.length;
            if (isReloadNeeded) {
                await this.loadAll(Promise.resolve(), { notify: true });
            }
            // It should be there after loadAll() but if not we just give up
            const inlineImageCids = this.sanitizeResult?.inlineImageCids ?? [];
            const [senderMailAddress, referencedCids] = await Promise.all([this.getSenderOfResponseMail(), inlineImageCids]);
            const attachmentsForReply = getReferencedAttachments(this.attachments, referencedCids);
            try {
                const editor = await newMailEditorAsResponse({
                    previousMail: this.mail,
                    conversationType: "1" /* ConversationType.REPLY */,
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
                }, this.isBlockingExternalImages() || !this.isShowingExternalContent(), this.getLoadedInlineImages(), mailboxDetails);
                editor.show();
            }
            catch (e) {
                if (e instanceof UserError) {
                    showUserError(e);
                }
                else {
                    throw e;
                }
            }
        }
    }
    async sanitizeMailBody(mail, blockExternalContent) {
        const { htmlSanitizer } = await import("../../../common/misc/HtmlSanitizer");
        const rawBody = this.getMailBody();
        // Keeping this commented out because we want see the response
        // const urlified = await this.workerFacade.urlify(rawBody).catch((e) => {
        // 	console.warn("Failed to urlify mail body!", e)
        // 	return rawBody
        // })
        const sanitizeResult = htmlSanitizer.sanitizeFragment(rawBody, {
            blockExternalContent,
            allowRelativeLinks: isTutanotaTeamMail(mail),
        });
        const { fragment, inlineImageCids, links, blockedExternalContent } = sanitizeResult;
        /**
         * Check if we need to improve contrast for dark theme. We apply the contrast fix if any of the following is contained in
         * the html body of the mail
         *  * any tag with a style attribute that has the color property set (besides "inherit")
         *  * any tag with a style attribute that has the background-color set (besides "inherit")
         *  * any font tag with the color attribute set
         */
        this.contrastFixNeeded = isMailContrastFixNeeded(fragment);
        m.redraw();
        return {
            // We want to stringify and return the fragment here, because once a fragment is appended to a DOM Node, it's children are moved
            // and the fragment is left empty. If we cache the fragment and then append that directly to the DOM tree when rendering, there are cases where
            // we would try to do so twice, and on the second pass the mail body will be left blank
            fragment,
            inlineImageCids,
            links,
            blockedExternalContent,
        };
    }
    getNonInlineAttachments() {
        // If we have attachments it is safe to assume that we already have body and referenced cids from it
        const inlineFileIds = this.sanitizeResult?.inlineImageCids ?? [];
        return this.attachments.filter((a) => a.cid == null || !inlineFileIds.includes(a.cid));
    }
    async downloadAll() {
        const nonInlineAttachments = await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, this.getNonInlineAttachments());
        try {
            await this.fileController.downloadAll(nonInlineAttachments);
        }
        catch (e) {
            if (e instanceof FileOpenError) {
                console.warn("FileOpenError", e);
                await Dialog.message("canNotOpenFileOnDevice_msg");
            }
            else {
                console.error("could not open file:", e.message ?? "unknown error");
                await Dialog.message("errorDuringFileOpen_msg");
            }
        }
    }
    async downloadAndOpenAttachment(file, open) {
        file = (await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, [file]))[0];
        try {
            if (open) {
                await this.fileController.open(file);
            }
            else {
                await this.fileController.download(file);
            }
        }
        catch (e) {
            if (e instanceof FileOpenError) {
                console.warn("FileOpenError", e);
                await Dialog.message("canNotOpenFileOnDevice_msg");
            }
            else {
                console.error("could not open file:", e.message ?? "unknown error");
                await Dialog.message("errorDuringFileOpen_msg");
            }
        }
    }
    async importAttachment(file) {
        const attachmentType = getAttachmentType(file.mimeType ?? "");
        if (attachmentType === AttachmentType.CONTACT) {
            await this.importContacts(file);
        }
        else if (attachmentType === AttachmentType.CALENDAR) {
            await this.importCalendar(file);
        }
    }
    async importContacts(file) {
        file = (await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, [file]))[0];
        try {
            const dataFile = await this.fileController.getAsDataFile(file);
            const contactListId = await this.contactModel.getContactListId();
            // this shouldn't happen but if it did we can just bail
            if (contactListId == null)
                return;
            const contactImporter = await this.contactImporter();
            await contactImporter.importContactsFromFile(utf8Uint8ArrayToString(dataFile.data), contactListId);
        }
        catch (e) {
            console.log(e);
            throw new UserError("errorDuringFileOpen_msg");
        }
    }
    async importCalendar(file) {
        file = (await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(this._mail, [file]))[0];
        try {
            const { importCalendarFile, parseCalendarFile } = await import("../../../common/calendar/import/CalendarImporter.js");
            const dataFile = await this.fileController.getAsDataFile(file);
            const data = parseCalendarFile(dataFile);
            await importCalendarFile(await mailLocator.calendarModel(), this.logins.getUserController(), data.contents);
        }
        catch (e) {
            console.log(e);
            throw new UserError("errorDuringFileOpen_msg");
        }
    }
    canImportFile(file) {
        if (!this.logins.isInternalUserLoggedIn() || file.mimeType == null) {
            return false;
        }
        const attachmentType = getAttachmentType(file.mimeType);
        return attachmentType === AttachmentType.CONTACT || attachmentType === AttachmentType.CALENDAR;
    }
    canReplyAll() {
        return (this.logins.getUserController().isInternalUser() &&
            this.getToRecipients().length + this.getCcRecipients().length + this.getBccRecipients().length > 1);
    }
    canForwardOrMove() {
        return this.logins.getUserController().isInternalUser();
    }
    shouldDelayRendering() {
        return this.renderIsDelayed;
    }
    isCollapsed() {
        return this.collapsed;
    }
    expandMail(delayBodyRendering) {
        this.loadAll(delayBodyRendering, { notify: true });
        if (this.isUnread()) {
            // When we automatically mark email as read (e.g. opening it from notification) we don't want to run into offline errors, but we still want to mark
            // the email as read once we log in.l
            // It is appropriate to show the error when the user marks the email as unread explicitly but less so when they open it and just didn't reach the
            // full login yet.
            this.logins.waitForFullLogin().then(() => this.setUnread(false));
        }
        this.collapsed = false;
    }
    collapseMail() {
        this.collapsed = true;
    }
    getLabels() {
        return this.mailModel.getLabelsForMail(this.mail);
    }
    getMailOwnerGroup() {
        return this.mail._ownerGroup;
    }
    updateMail({ mail, showFolder }) {
        if (!isSameId(mail._id, this.mail._id)) {
            throw new ProgrammingError(`Trying to update MailViewerViewModel with unrelated email ${JSON.stringify(this.mail._id)} ${JSON.stringify(mail._id)} ${m.route.get()}`);
        }
        this._mail = mail;
        this.folderMailboxText = null;
        if (showFolder) {
            this.showFolder();
        }
        this.relevantRecipient = null;
        this.determineRelevantRecipient();
        this.loadAll(Promise.resolve(), { notify: true });
    }
}
//# sourceMappingURL=MailViewerViewModel.js.map