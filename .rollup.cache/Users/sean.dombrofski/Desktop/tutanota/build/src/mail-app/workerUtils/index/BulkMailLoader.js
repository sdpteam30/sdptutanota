import { assertNotNull, groupBy, groupByAndMap, neverNull, promiseMap, splitInChunks } from "@tutao/tutanota-utils";
import { elementIdPart, isSameId, listIdPart, timestampToGeneratedId } from "../../../common/api/common/utils/EntityUtils.js";
import { isDraft } from "../../mail/model/MailChecks.js";
import { FileTypeRef, MailDetailsBlobTypeRef, MailDetailsDraftTypeRef, MailTypeRef, } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { parseKeyVersion } from "../../../common/api/worker/facades/KeyLoaderFacade.js";
export const ENTITY_INDEXER_CHUNK = 20;
export const MAIL_INDEXER_CHUNK = 100;
export class BulkMailLoader {
    mailEntityClient;
    mailDataEntityClient;
    cachedStorage;
    constructor(mailEntityClient, mailDataEntityClient, cachedStorage) {
        this.mailEntityClient = mailEntityClient;
        this.mailDataEntityClient = mailDataEntityClient;
        this.cachedStorage = cachedStorage;
    }
    loadMailsInRangeWithCache(mailListId, [rangeStart, rangeEnd]) {
        return this.mailEntityClient.loadReverseRangeBetween(MailTypeRef, mailListId, timestampToGeneratedId(rangeStart), timestampToGeneratedId(rangeEnd), MAIL_INDEXER_CHUNK);
    }
    loadFixedNumberOfMailsWithCache(mailLIstId, startId, options = {}) {
        return this.mailEntityClient.loadRange(MailTypeRef, mailLIstId, startId, MAIL_INDEXER_CHUNK, true, { ...options, cacheMode: 2 /* CacheMode.ReadOnly */ });
    }
    async removeFromCache(id) {
        return this.cachedStorage?.deleteIfExists(MailTypeRef, listIdPart(id), elementIdPart(id));
    }
    async loadMailDetails(mails, options = {}) {
        const result = [];
        // mailDetails stored as blob
        let mailDetailsBlobMails = mails.filter((m) => !isDraft(m));
        const listIdToMailDetailsBlobIds = groupByAndMap(mailDetailsBlobMails, (m) => assertNotNull(m.mailDetails)[0], (m) => neverNull(m.mailDetails)[1]);
        for (let [listId, ids] of listIdToMailDetailsBlobIds) {
            const ownerEncSessionKeyProvider = async (instanceElementId) => {
                const mail = assertNotNull(mailDetailsBlobMails.find((m) => elementIdPart(assertNotNull(m.mailDetails)) === instanceElementId));
                return {
                    key: assertNotNull(mail._ownerEncSessionKey),
                    encryptingKeyVersion: parseKeyVersion(mail._ownerKeyVersion ?? "0"),
                };
            };
            const mailDetailsBlobs = await this.loadInChunks(MailDetailsBlobTypeRef, listId, ids, ownerEncSessionKeyProvider, options);
            result.push(...mailDetailsBlobs.map((mailDetailsBlob) => {
                const mail = assertNotNull(mailDetailsBlobMails.find((m) => isSameId(m.mailDetails, mailDetailsBlob._id)));
                return { mail, mailDetails: mailDetailsBlob.details };
            }));
        }
        // mailDetails stored in db (draft)
        let mailDetailsDraftMails = mails.filter((m) => isDraft(m));
        const listIdToMailDetailsDraftIds = groupByAndMap(mailDetailsDraftMails, (m) => assertNotNull(m.mailDetailsDraft)[0], (m) => neverNull(m.mailDetailsDraft)[1]);
        for (let [listId, ids] of listIdToMailDetailsDraftIds) {
            const ownerEncSessionKeyProvider = async (instanceElementId) => {
                const mail = assertNotNull(mailDetailsDraftMails.find((m) => elementIdPart(assertNotNull(m.mailDetailsDraft)) === instanceElementId));
                return {
                    key: assertNotNull(mail._ownerEncSessionKey),
                    encryptingKeyVersion: parseKeyVersion(mail._ownerKeyVersion ?? "0"),
                };
            };
            const mailDetailsDrafts = await this.loadInChunks(MailDetailsDraftTypeRef, listId, ids, ownerEncSessionKeyProvider, options);
            result.push(...mailDetailsDrafts.map((draftDetails) => {
                const mail = assertNotNull(mailDetailsDraftMails.find((m) => isSameId(m.mailDetailsDraft, draftDetails._id)));
                return { mail, mailDetails: draftDetails.details };
            }));
        }
        return result;
    }
    async loadAttachments(mails, options = {}) {
        const attachmentIds = [];
        for (const mail of mails) {
            attachmentIds.push(...mail.attachments);
        }
        const filesByList = groupBy(attachmentIds, (a) => a[0]);
        const fileLoadingPromises = [];
        for (const [listId, fileIds] of filesByList.entries()) {
            fileLoadingPromises.push(this.loadInChunks(FileTypeRef, listId, fileIds.map((f) => f[1]), undefined, options));
        }
        const filesResults = await Promise.all(fileLoadingPromises);
        return filesResults.flat();
    }
    async loadInChunks(typeRef, listId, ids, ownerEncSessionKeyProvider, options = {}) {
        const byChunk = splitInChunks(ENTITY_INDEXER_CHUNK, ids);
        const entityResults = await promiseMap(byChunk, (chunk) => {
            return chunk.length > 0
                ? this.mailDataEntityClient.loadMultiple(typeRef, listId, chunk, ownerEncSessionKeyProvider, { ...options, cacheMode: 2 /* CacheMode.ReadOnly */ })
                : Promise.resolve([]);
        }, {
            concurrency: 2,
        });
        return entityResults.flat();
    }
}
//# sourceMappingURL=BulkMailLoader.js.map