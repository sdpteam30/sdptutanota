import { ImporterApi } from "@tutao/node-mimimi";
import { assertNotNull, clear, defer } from "@tutao/tutanota-utils";
import { MailImportError } from "../../api/common/error/MailImportError.js";
import { ProgrammingError } from "../../api/common/error/ProgrammingError.js";
import path from "node:path";
const TAG = "[DesktopMailImportFacade]";
function asyncImportErrorToMailImportErrorData(message) {
    const { kind } = message;
    switch (kind) {
        case "FileDeletionError" /* ImportErrorKind.FileDeletionError */:
            return { category: 3 /* ImportErrorCategories.InvalidImportFilesErrors */, source: kind };
        case "SdkError" /* ImportErrorKind.SdkError */:
        case "EmptyBlobServerList" /* ImportErrorKind.EmptyBlobServerList */:
            return { category: 1 /* ImportErrorCategories.LocalSdkError */, source: kind };
        case "ImportFeatureDisabled" /* ImportErrorKind.ImportFeatureDisabled */:
            return { category: 0 /* ImportErrorCategories.ImportFeatureDisabled */ };
        case "TooBigChunk" /* ImportErrorKind.TooBigChunk */:
        case "SourceExhaustedSomeError" /* ImportErrorKind.SourceExhaustedSomeError */:
            return { category: 4 /* ImportErrorCategories.ImportIncomplete */, source: kind };
    }
}
function mimimiErrorToImportErrorData(error) {
    const { message: source } = error;
    switch (source) {
        // errors related to the files we use to track the import progress.
        // might require manual intervention due to misconfiguration or leftover files.
        case "FailedToReadEmls" /* PreparationError.FailedToReadEmls */:
        case "StateFileWriteFailed" /* PreparationError.StateFileWriteFailed */:
        case "CanNotCreateImportDir" /* PreparationError.CanNotCreateImportDir */:
        case "CanNotDeleteImportDir" /* PreparationError.CanNotDeleteImportDir */:
        case "FileReadError" /* PreparationError.FileReadError */:
        case "EmlFileWriteFailure" /* PreparationError.EmlFileWriteFailure */:
            return { category: 3 /* ImportErrorCategories.InvalidImportFilesErrors */, source };
        // errors due to problems communicating with the server (network, auth,...)
        case "LoginError" /* PreparationError.LoginError */:
        case "NoMailGroupKey" /* PreparationError.NoMailGroupKey */:
        case "CannotLoadRemoteState" /* PreparationError.CannotLoadRemoteState */:
            return { category: 2 /* ImportErrorCategories.ServerCommunicationError */, source };
        case "ImportFeatureDisabled" /* PreparationError.ImportFeatureDisabled */:
            return { category: 0 /* ImportErrorCategories.ImportFeatureDisabled */ };
        // errors that happen before we even talk to the server. usually not actionable.
        case "NoNativeRestClient" /* PreparationError.NoNativeRestClient */:
            return { category: 1 /* ImportErrorCategories.LocalSdkError */, source };
        // this one is very actionable, but we don't have associated data currently to show the user which file is bad.
        case "NotAValidEmailFile" /* PreparationError.NotAValidEmailFile */:
            return { category: 4 /* ImportErrorCategories.ImportIncomplete */, source };
        default:
            // we'd like ts to check we considered all variants, but we can't do that without checking the type
            // before passing it into this function. removing the default case would cause us to lose error
            // types we didn't account for.
            throw new ProgrammingError(`unknown mimimi error ${error}`);
    }
}
/**
 * This is the persistent part of the importer running in the node main process. as long as the client is running, this will stay around.
 * windows can subscribe to events and control the importer, but are considered "disposable" and are not required for the importer to do work.
 */
export class DesktopMailImportFacade {
    electron;
    notifier;
    lang;
    configDirectory;
    // map from mailbox id to its importer Api
    importerApis = new Map();
    currentListeners = new Map();
    constructor(electron, notifier, lang) {
        this.electron = electron;
        this.notifier = notifier;
        this.lang = lang;
        ImporterApi.initLog();
        electron.app.on("before-quit", () => ImporterApi.deinitLog());
        this.configDirectory = electron.app.getPath("userData");
    }
    async getResumableImport(mailboxId, targetOwnerGroup, unencryptedTutaCredentials, apiUrl) {
        const existingImporterApi = this.importerApis.get(mailboxId);
        if (existingImporterApi) {
            const { listId, elementId } = await existingImporterApi.then((importerApi) => importerApi.getImportStateId());
            return [listId, elementId];
        }
        else {
            const tutaCredentials = this.createTutaCredentials(unencryptedTutaCredentials, apiUrl);
            let importerApi;
            try {
                importerApi = await ImporterApi.getResumableImport(mailboxId, this.configDirectory, targetOwnerGroup, tutaCredentials);
            }
            catch (e) {
                throw new MailImportError(mimimiErrorToImportErrorData(e));
            }
            if (importerApi != null) {
                importerApi.setMessageHook((message) => this.processMimimiMessage(mailboxId, message));
                this.importerApis.set(mailboxId, Promise.resolve(importerApi));
                const { listId, elementId } = importerApi.getImportStateId();
                return [listId, elementId];
            }
        }
        return null;
    }
    async prepareNewImport(mailboxId, targetOwnerGroup, targetMailset, filePaths, unencryptedTutaCredentials, apiUrl) {
        const tutaCredentials = this.createTutaCredentials(unencryptedTutaCredentials, apiUrl);
        let hasOngoingImport = this.importerApis.has(mailboxId);
        if (hasOngoingImport) {
            throw new MailImportError({ category: 5 /* ImportErrorCategories.ConcurrentImport */ });
        }
        let importerApiPromise = ImporterApi.prepareNewImport(mailboxId, tutaCredentials, targetOwnerGroup, [targetMailset[0], targetMailset[1]], filePaths.slice(), this.configDirectory);
        // we want an unconditional error handler, but also don't want to change the type of the promise.
        importerApiPromise.catch((_) => this.importerApis.delete(mailboxId));
        this.importerApis.set(mailboxId, importerApiPromise);
        let importerApi = null;
        try {
            importerApi = await importerApiPromise;
        }
        catch (e) {
            this.showImportFailNotification(null);
            throw new MailImportError(mimimiErrorToImportErrorData(e));
        }
        importerApi.setMessageHook((message) => this.processMimimiMessage(mailboxId, message));
        this.importerApis.set(mailboxId, Promise.resolve(importerApi));
        const { listId, elementId } = importerApi.getImportStateId();
        return [listId, elementId];
    }
    async setProgressAction(mailboxId, progressAction) {
        let importerApiPromise = this.importerApis.get(mailboxId);
        if (importerApiPromise) {
            const importerApi = await importerApiPromise;
            await importerApi.setProgressAction(progressAction);
        }
        else {
            console.warn(TAG, "received progress action for nonexistent import");
            // we can ignore this - the worst that can happen is that we have an unresponsive button.
            // import was probably finished, but UI didn't get the entity event yet
            return;
        }
    }
    async setAsyncErrorHook(mailboxId) {
        const { promise, reject } = defer();
        const listeners = this.currentListeners.get(mailboxId);
        if (listeners != null) {
            listeners.push(reject);
        }
        else {
            const newListeners = [reject];
            this.currentListeners.set(mailboxId, newListeners);
        }
        return promise;
    }
    processMimimiMessage(mailboxId, message) {
        const haveOkMessage = message.okMessage != null;
        const haveErrMessage = message.errorMessage != null;
        if (haveErrMessage == haveOkMessage) {
            throw new ProgrammingError("Mail import message can either only be error or only be ok");
        }
        else if (haveErrMessage) {
            return this.processMimimiErrMessage(mailboxId, assertNotNull(message.errorMessage));
        }
        const okMessage = assertNotNull(message.okMessage);
        switch (okMessage) {
            case "UserCancelInterruption" /* ImportOkKind.UserCancelInterruption */:
                this.importerApis.delete(mailboxId);
                break;
            case "SourceExhaustedNoError" /* ImportOkKind.SourceExhaustedNoError */:
                this.importerApis.delete(mailboxId);
                this.notifier
                    .showOneShot({
                    title: this.lang.get("importComplete_title"),
                    body: this.lang.get("importComplete_msg"),
                })
                    .catch();
                break;
            case "UserPauseInterruption" /* ImportOkKind.UserPauseInterruption */:
                console.log("User pause request was complete.");
                // have to do nothing for pause
                break;
        }
    }
    processMimimiErrMessage(mailboxId, error) {
        if (error.kind === "SourceExhaustedSomeError" /* ImportErrorKind.SourceExhaustedSomeError */) {
            this.importerApis.delete(mailboxId);
        }
        let errorData = asyncImportErrorToMailImportErrorData(error);
        // this is the only category where it does not make sense for user to retry
        // because we would have already cleaned up the local state and all the files will be renamed to failed.eml
        if (errorData.category === 4 /* ImportErrorCategories.ImportIncomplete */) {
            this.importerApis.delete(mailboxId);
        }
        this.showImportFailNotification(mailboxId);
        let listeners = this.currentListeners.get(mailboxId);
        if (listeners != null) {
            for (const listener of listeners) {
                const mailImportError = new MailImportError(errorData);
                listener(mailImportError);
            }
            clear(listeners);
        }
    }
    /**
     * show a system notification (even if there are currently no windows)
     *
     * @param mailboxId this is the name of the import  subdirectory we show on click. if null, the notification does nothing,
     * for example if the directory hasn't been created yet.
     */
    showImportFailNotification(mailboxId) {
        this.notifier
            .showOneShot({
            title: this.lang.get("importIncomplete_title"),
            body: this.lang.get("importIncomplete_msg"),
        })
            .then((res) => {
            if (res === "click" /* NotificationResult.Click */ && mailboxId != null) {
                this.electron.shell.showItemInFolder(path.join(this.configDirectory, "current_imports", mailboxId, "dummy.eml"));
            }
        });
    }
    createTutaCredentials(unencTutaCredentials, apiUrl) {
        const tutaCredentials = {
            accessToken: unencTutaCredentials?.accessToken,
            isInternalCredential: unencTutaCredentials.credentialInfo.type === "internal" /* CredentialType.Internal */,
            encryptedPassphraseKey: unencTutaCredentials.encryptedPassphraseKey ? Array.from(unencTutaCredentials.encryptedPassphraseKey) : [],
            login: unencTutaCredentials.credentialInfo.login,
            userId: unencTutaCredentials.credentialInfo.userId,
            apiUrl,
            clientVersion: env.versionNumber,
        };
        return tutaCredentials;
    }
}
//# sourceMappingURL=DesktopMailImportFacade.js.map