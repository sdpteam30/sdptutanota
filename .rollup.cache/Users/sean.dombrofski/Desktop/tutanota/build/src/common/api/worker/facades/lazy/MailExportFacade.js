import { assertWorkerOrNode } from "../../../common/Env";
import { convertToDataFile } from "../../../common/DataFile.js";
import { createReferencingInstance } from "../../../common/utils/BlobUtils.js";
import { assertNotNull, isNotNull } from "@tutao/tutanota-utils";
import { NotFoundError } from "../../../common/error/RestError";
import { elementIdPart } from "../../../common/utils/EntityUtils";
assertWorkerOrNode();
/**
 * Denotes the header that will have the mail export token.
 */
export const MAIL_EXPORT_TOKEN_HEADER = "mailExportToken";
/**
 * Wraps bulk loading of mails for mail export.
 *
 * Takes care of using mail export tokens.
 */
export class MailExportFacade {
    mailExportTokenFacade;
    bulkMailLoader;
    blobFacade;
    cryptoFacade;
    blobAccessTokenFacade;
    constructor(mailExportTokenFacade, bulkMailLoader, blobFacade, cryptoFacade, blobAccessTokenFacade) {
        this.mailExportTokenFacade = mailExportTokenFacade;
        this.bulkMailLoader = bulkMailLoader;
        this.blobFacade = blobFacade;
        this.cryptoFacade = cryptoFacade;
        this.blobAccessTokenFacade = blobAccessTokenFacade;
    }
    /**
     * Returns a list of servers that can be used to request data from.
     */
    async getExportServers(group) {
        const blobServerAccessInfo = await this.blobAccessTokenFacade.requestWriteToken("1" /* ArchiveDataType.Attachments */, group._id);
        return blobServerAccessInfo.servers;
    }
    async loadFixedNumberOfMailsWithCache(mailListId, startId, baseUrl) {
        return this.mailExportTokenFacade.loadWithToken((token) => this.bulkMailLoader.loadFixedNumberOfMailsWithCache(mailListId, startId, { baseUrl, ...this.options(token) }));
    }
    async loadMailDetails(mails) {
        return this.mailExportTokenFacade.loadWithToken((token) => this.bulkMailLoader.loadMailDetails(mails, this.options(token)));
    }
    async loadAttachments(mails, baseUrl) {
        return this.mailExportTokenFacade.loadWithToken((token) => this.bulkMailLoader.loadAttachments(mails, { baseUrl, ...this.options(token) }));
    }
    async loadAttachmentData(mail, attachments) {
        const attachmentsWithKeys = await this.cryptoFacade.enforceSessionKeyUpdateIfNeeded(mail, attachments);
        const downloads = await this.mailExportTokenFacade.loadWithToken((token) => {
            const referencingInstances = attachmentsWithKeys.map(createReferencingInstance);
            return this.blobFacade.downloadAndDecryptBlobsOfMultipleInstances("1" /* ArchiveDataType.Attachments */, referencingInstances, {
                ...this.options(token),
            });
        });
        const attachmentData = Array.from(downloads.entries()).map(([fileId, bytes]) => {
            try {
                if (bytes == null) {
                    return null;
                }
                else {
                    const attachment = assertNotNull(attachmentsWithKeys.find((attachment) => elementIdPart(attachment._id) === fileId));
                    return convertToDataFile(attachment, bytes);
                }
            }
            catch (e) {
                if (e instanceof NotFoundError) {
                    return null;
                }
                else {
                    throw e;
                }
            }
        });
        return attachmentData.filter(isNotNull);
    }
    options(token) {
        return {
            extraHeaders: {
                [MAIL_EXPORT_TOKEN_HEADER]: token,
            },
            suspensionBehavior: 1 /* SuspensionBehavior.Throw */,
        };
    }
}
//# sourceMappingURL=MailExportFacade.js.map