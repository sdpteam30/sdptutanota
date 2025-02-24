import { ConversationEntryTypeRef, MailTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { elementIdPart, firstBiggerThanSecond, getElementId, haveSameId, isSameId, listIdPart } from "../../../common/api/common/utils/EntityUtils.js";
import { assertNotNull, findLastIndex, groupBy, makeSingleUse, ofClass } from "@tutao/tutanota-utils";
import { LoadingStateTracker } from "../../../common/offline/LoadingState.js";
import { MailSetKind } from "../../../common/api/common/TutanotaConstants.js";
import { NotAuthorizedError, NotFoundError } from "../../../common/api/common/error/RestError.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { isOfTypeOrSubfolderOf } from "../model/MailChecks.js";
export class ConversationViewModel {
    options;
    viewModelFactory;
    entityClient;
    eventController;
    conversationPrefProvider;
    mailModel;
    onUiUpdate;
    /** Primary viewModel is for the mail that was selected from the list. */
    _primaryViewModel;
    loadingState = new LoadingStateTracker();
    loadingPromise = null;
    /** Is not set until {@link loadConversation is finished. Until it is finished we display primary mail and subject. */
    conversation = null;
    constructor(options, viewModelFactory, entityClient, eventController, conversationPrefProvider, mailModel, onUiUpdate) {
        this.options = options;
        this.viewModelFactory = viewModelFactory;
        this.entityClient = entityClient;
        this.eventController = eventController;
        this.conversationPrefProvider = conversationPrefProvider;
        this.mailModel = mailModel;
        this.onUiUpdate = onUiUpdate;
        this._primaryViewModel = viewModelFactory(options);
    }
    init = makeSingleUse((delayBodyRendering) => {
        this.loadingPromise = this.loadingState.trackPromise(this.loadConversation());
        this.eventController.addEntityListener(this.onEntityEvent);
        this._primaryViewModel.expandMail(delayBodyRendering);
    });
    onEntityEvent = async (updates, eventOwnerGroupId) => {
        // conversation entry can be created when new email arrives
        // conversation entry can be updated when email is moved around or deleted
        // conversation entry is deleted only when every email in the conversation is deleted (the whole conversation list will be deleted)
        for (const update of updates) {
            if (isUpdateForTypeRef(ConversationEntryTypeRef, update) && update.instanceListId === this.conversationListId()) {
                if (this.conversationPrefProvider.getConversationViewShowOnlySelectedMail()) {
                    // no need to handle CREATE because we only show a single item and we don't want to add new ones
                    // no need to handle UPDATE because the only update that can happen is when email gets deleted and then we should be closed from the
                    // outside anyway
                    continue;
                }
                switch (update.operation) {
                    case "0" /* OperationType.CREATE */:
                        await this.processCreateConversationEntry(update);
                        break;
                    case "1" /* OperationType.UPDATE */:
                        await this.processUpdateConversationEntry(update);
                        break;
                    // don't process DELETE because the primary email (selected from the mail list) will be deleted first anyway
                    // and we should be closed when it happens
                }
            }
        }
    };
    async processCreateConversationEntry(update) {
        const id = [update.instanceListId, update.instanceId];
        try {
            const entry = await this.entityClient.load(ConversationEntryTypeRef, id);
            if (entry.mail) {
                try {
                    // first wait that we load the conversation, otherwise we might already have the email
                    await this.loadingPromise;
                }
                catch (e) {
                    return;
                }
                const conversation = assertNotNull(this.conversation);
                if (conversation.some((item) => item.type === "mail" && isSameId(item.viewModel.mail.conversationEntry, id))) {
                    // already loaded
                    return;
                }
                const mail = await this.entityClient.load(MailTypeRef, entry.mail);
                let index = findLastIndex(conversation, (i) => firstBiggerThanSecond(getElementId(entry), elementIdPart(i.entryId)));
                if (index < 0) {
                    index = conversation.length;
                }
                else {
                    index = index + 1;
                }
                conversation.splice(index, 0, { type: "mail", viewModel: this.viewModelFactory({ ...this.options, mail }), entryId: entry._id });
                this.onUiUpdate();
            }
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                // Ignore, something was already deleted
            }
            else {
                throw e;
            }
        }
    }
    async processUpdateConversationEntry(update) {
        try {
            // first wait that we load the conversation, otherwise we might already have the email
            await this.loadingPromise;
        }
        catch (e) {
            return;
        }
        const conversation = assertNotNull(this.conversation);
        const ceId = [update.instanceListId, update.instanceId];
        let conversationEntry;
        let mail;
        try {
            conversationEntry = await this.entityClient.load(ConversationEntryTypeRef, ceId);
            mail =
                // ideally checking the `mail` ref should be enough but we sometimes get an update with UNKNOWN and non-existing email but still with the ref
                conversationEntry.conversationType !== "3" /* ConversationType.UNKNOWN */ && conversationEntry.mail
                    ? await this.entityClient.load(MailTypeRef, conversationEntry.mail).catch(ofClass(NotFoundError, () => {
                        console.log(`Could not find updated mail ${JSON.stringify(conversationEntry.mail)}`);
                        return null;
                    }))
                    : null;
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                // Ignore, something was already deleted
                return;
            }
            else {
                throw e;
            }
        }
        const oldItemIndex = conversation.findIndex((e) => e.type === "mail" && isSameId(e.viewModel.mail.conversationEntry, ceId));
        if (oldItemIndex === -1) {
            return;
        }
        const oldItem = conversation[oldItemIndex];
        if (mail && oldItem.type === "mail" && haveSameId(oldItem.viewModel.mail, mail)) {
            console.log("Noop entry update?", oldItem.viewModel.mail);
            // nothing to do really, why do we get this update again?
        }
        else {
            if (oldItem.type === "mail") {
                oldItem.viewModel.dispose();
            }
            if (mail) {
                // We do not show trashed drafts
                if (mail.state === "0" /* MailState.DRAFT */ && (await this.isInTrash(mail))) {
                    conversation.splice(oldItemIndex, 1);
                }
                else {
                    conversation[oldItemIndex] = {
                        type: "mail",
                        viewModel: this.viewModelFactory({ ...this.options, mail }),
                        entryId: conversationEntry._id,
                    };
                }
            }
            else {
                // When DELETED conversation status type is added, replace entry with deleted entry instead of splicing out
                conversation.splice(oldItemIndex, 1);
            }
            this.onUiUpdate();
        }
    }
    conversationListId() {
        return listIdPart(this._primaryViewModel.mail.conversationEntry);
    }
    async loadConversation() {
        try {
            if (this.conversationPrefProvider.getConversationViewShowOnlySelectedMail()) {
                this.conversation = this.conversationItemsForSelectedMailOnly();
            }
            else {
                // Catch errors but only for loading conversation entries.
                // if success, proceed with loading mails
                // otherwise do the error handling
                this.conversation = await this.entityClient.loadAll(ConversationEntryTypeRef, listIdPart(this.primaryMail.conversationEntry)).then(async (entries) => {
                    // if the primary mail is not along conversation then only display the primary mail
                    if (!entries.some((entry) => isSameId(entry.mail, this.primaryMail._id))) {
                        return this.conversationItemsForSelectedMailOnly();
                    }
                    else {
                        const allMails = await this.loadMails(entries);
                        return this.createConversationItems(entries, allMails);
                    }
                }, async (e) => {
                    if (e instanceof NotAuthorizedError) {
                        // Most likely the conversation entry list does not exist anymore. The server does not distinguish between the case when the
                        // list does not exist and when we have no permission on it (and for good reasons, it prevents enumeration).
                        // Most often it happens when we are not fully synced with the server yet and the primary mail does not even exist.
                        return this.conversationItemsForSelectedMailOnly();
                    }
                    else {
                        throw e;
                    }
                });
            }
        }
        finally {
            this.onUiUpdate();
        }
    }
    createConversationItems(conversationEntries, allMails) {
        const newConversation = [];
        for (const c of conversationEntries) {
            const mail = c.mail && allMails.get(elementIdPart(c.mail));
            if (mail) {
                newConversation.push({
                    type: "mail",
                    viewModel: isSameId(mail._id, this.options.mail._id) ? this._primaryViewModel : this.viewModelFactory({ ...this.options, mail }),
                    entryId: c._id,
                });
            }
        }
        return newConversation;
    }
    async loadMails(conversationEntries) {
        const byList = groupBy(conversationEntries, (c) => c.mail && listIdPart(c.mail));
        const allMails = new Map();
        for (const [listId, conversations] of byList.entries()) {
            if (!listId)
                continue;
            const loaded = await this.entityClient.loadMultiple(MailTypeRef, listId, conversations.map((c) => elementIdPart(assertNotNull(c.mail))));
            for (const mail of loaded) {
                // If the mail is a draft and is the primary mail, we will show it no matter what
                // otherwise, if a draft is in trash we will not show it
                if (isSameId(mail._id, this.primaryMail._id) || mail.state !== "0" /* MailState.DRAFT */ || !(await this.isInTrash(mail))) {
                    allMails.set(getElementId(mail), mail);
                }
            }
        }
        return allMails;
    }
    async isInTrash(mail) {
        const mailboxDetail = await this.mailModel.getMailboxDetailsForMail(mail);
        const mailFolder = this.mailModel.getMailFolderForMail(mail);
        if (mailFolder == null || mailboxDetail == null || mailboxDetail.mailbox.folders == null) {
            return;
        }
        const folders = await this.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.folders._id);
        return isOfTypeOrSubfolderOf(folders, mailFolder, MailSetKind.TRASH);
    }
    conversationItems() {
        return this.conversation ?? this.conversationItemsForSelectedMailOnly();
    }
    conversationItemsForSelectedMailOnly() {
        return [{ type: "mail", viewModel: this._primaryViewModel, entryId: this._primaryViewModel.mail.conversationEntry }];
    }
    get primaryMail() {
        return this._primaryViewModel.mail;
    }
    primaryViewModel() {
        return this._primaryViewModel;
    }
    isFinished() {
        return this.loadingState.isIdle();
    }
    isConnectionLost() {
        return this.loadingState.isConnectionLost();
    }
    retry() {
        if (this.loadingState.isConnectionLost()) {
            this.loadingState.trackPromise(this.loadConversation().then(async () => {
                const mails = (this.conversation?.filter((e) => e.type === "mail") ?? []);
                await Promise.all(mails.map((m) => m.viewModel.loadAll(Promise.resolve())));
            }));
        }
    }
    dispose() {
        // hack: init has been called if loadingPromise is set
        if (this.loadingPromise != null) {
            this.eventController.removeEntityListener(this.onEntityEvent);
            for (const item of this.conversationItems()) {
                if (item.type === "mail") {
                    item.viewModel.dispose();
                }
            }
        }
    }
}
//# sourceMappingURL=ConversationViewModel.js.map