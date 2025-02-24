import { NotAuthorizedError, NotFoundError } from "../../../common/api/common/error/RestError.js";
import { ContactTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { typeModels as tutanotaModels } from "../../../common/api/entities/tutanota/TypeModels.js";
import { _createNewIndexUpdate, typeRefToTypeInfo } from "../../../common/api/worker/search/IndexUtils.js";
import { neverNull, noOp, ofClass, promiseMap } from "@tutao/tutanota-utils";
import { FULL_INDEXED_TIMESTAMP } from "../../../common/api/common/TutanotaConstants.js";
import { tokenize } from "@tutao/tutanota-utils";
import { GroupDataOS, MetaDataOS } from "../../../common/api/worker/search/IndexTables.js";
export class ContactIndexer {
    _core;
    _db;
    _entity;
    suggestionFacade;
    constructor(core, db, entity, suggestionFacade) {
        this._core = core;
        this._db = db;
        this._entity = entity;
        this.suggestionFacade = suggestionFacade;
    }
    createContactIndexEntries(contact) {
        const ContactModel = tutanotaModels.Contact;
        let keyToIndexEntries = this._core.createIndexEntriesForAttributes(contact, [
            {
                attribute: ContactModel.values["firstName"],
                value: () => contact.firstName,
            },
            {
                attribute: ContactModel.values["lastName"],
                value: () => contact.lastName,
            },
            {
                attribute: ContactModel.values["nickname"],
                value: () => contact.nickname || "",
            },
            {
                attribute: ContactModel.values["role"],
                value: () => contact.role,
            },
            {
                attribute: ContactModel.values["title"],
                value: () => contact.title || "",
            },
            {
                attribute: ContactModel.values["comment"],
                value: () => contact.comment,
            },
            {
                attribute: ContactModel.values["company"],
                value: () => contact.company,
            },
            {
                attribute: ContactModel.associations["addresses"],
                value: () => contact.addresses.map((a) => a.address).join(","),
            },
            {
                attribute: ContactModel.associations["mailAddresses"],
                value: () => contact.mailAddresses.map((cma) => cma.address).join(","),
            },
            {
                attribute: ContactModel.associations["phoneNumbers"],
                value: () => contact.phoneNumbers.map((pn) => pn.number).join(","),
            },
            {
                attribute: ContactModel.associations["socialIds"],
                value: () => contact.socialIds.map((s) => s.socialId).join(","),
            },
        ]);
        this.suggestionFacade.addSuggestions(this._getSuggestionWords(contact));
        return keyToIndexEntries;
    }
    _getSuggestionWords(contact) {
        return tokenize(contact.firstName + " " + contact.lastName + " " + contact.mailAddresses.map((ma) => ma.address).join(" "));
    }
    processNewContact(event) {
        return this._entity
            .load(ContactTypeRef, [event.instanceListId, event.instanceId])
            .then((contact) => {
            let keyToIndexEntries = this.createContactIndexEntries(contact);
            return this.suggestionFacade.store().then(() => {
                return {
                    contact,
                    keyToIndexEntries,
                };
            });
        })
            .catch(ofClass(NotFoundError, () => {
            console.log("tried to index non existing contact");
            return null;
        }))
            .catch(ofClass(NotAuthorizedError, () => {
            console.log("tried to index contact without permission");
            return null;
        }));
    }
    async getIndexTimestamp(contactList) {
        const t = await this._db.dbFacade.createTransaction(true, [MetaDataOS, GroupDataOS]);
        const groupId = neverNull(contactList._ownerGroup);
        return t.get(GroupDataOS, groupId).then((groupData) => {
            return groupData ? groupData.indexTimestamp : null;
        });
    }
    /**
     * Indexes the contact list if it is not yet indexed.
     */
    async indexFullContactList(contactList) {
        const groupId = neverNull(contactList._ownerGroup);
        let indexUpdate = _createNewIndexUpdate(typeRefToTypeInfo(ContactTypeRef));
        try {
            const contacts = await this._entity.loadAll(ContactTypeRef, contactList.contacts);
            for (const contact of contacts) {
                let keyToIndexEntries = this.createContactIndexEntries(contact);
                this._core.encryptSearchIndexEntries(contact._id, neverNull(contact._ownerGroup), keyToIndexEntries, indexUpdate);
            }
            return Promise.all([
                this._core.writeIndexUpdate([
                    {
                        groupId,
                        indexTimestamp: FULL_INDEXED_TIMESTAMP,
                    },
                ], indexUpdate),
                this.suggestionFacade.store(),
            ]);
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                return Promise.resolve();
            }
            throw e;
        }
    }
    processEntityEvents(events, groupId, batchId, indexUpdate) {
        return promiseMap(events, async (event) => {
            if (event.operation === "0" /* OperationType.CREATE */) {
                await this.processNewContact(event).then((result) => {
                    if (result) {
                        this._core.encryptSearchIndexEntries(result.contact._id, neverNull(result.contact._ownerGroup), result.keyToIndexEntries, indexUpdate);
                    }
                });
            }
            else if (event.operation === "1" /* OperationType.UPDATE */) {
                await Promise.all([
                    this._core._processDeleted(event, indexUpdate),
                    this.processNewContact(event).then((result) => {
                        if (result) {
                            this._core.encryptSearchIndexEntries(result.contact._id, neverNull(result.contact._ownerGroup), result.keyToIndexEntries, indexUpdate);
                        }
                    }),
                ]);
            }
            else if (event.operation === "2" /* OperationType.DELETE */) {
                await this._core._processDeleted(event, indexUpdate);
            }
        }).then(noOp);
    }
}
//# sourceMappingURL=ContactIndexer.js.map