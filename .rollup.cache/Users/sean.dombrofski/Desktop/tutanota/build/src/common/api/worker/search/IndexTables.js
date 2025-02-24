export const SearchIndexOS = "SearchIndex";
export const SearchIndexMetaDataOS = "SearchIndexMeta";
export const ElementDataOS = "ElementData";
export const MetaDataOS = "MetaData";
export const GroupDataOS = "GroupMetaData";
export const SearchTermSuggestionsOS = "SearchTermSuggestions";
export const SearchIndexWordsIndex = "SearchIndexWords";
export const Metadata = {
    userEncDbKey: "userEncDbKey",
    encDbIv: "encDbIv",
    userGroupKeyVersion: "userGroupKeyVersion",
    mailIndexingEnabled: "mailIndexingEnabled",
    // we don't index some mail lists (eg spam)
    excludedListIds: "excludedListIds",
    // stored in the database, so the mailbox does not need to be loaded when starting to index mails except spam folder after login
    // server timestamp of the last time we indexed on this client, in millis
    lastEventIndexTimeMs: "lastEventIndexTimeMs",
};
//# sourceMappingURL=IndexTables.js.map