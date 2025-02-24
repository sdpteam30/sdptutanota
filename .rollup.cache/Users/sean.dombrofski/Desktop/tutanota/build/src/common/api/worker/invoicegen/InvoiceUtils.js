import InvoiceTexts from "./InvoiceTexts.js";
/**
 * Returns the language code of country as either "en" or "de"
 * "de" is only returned if the country is Germany or Austria
 * @param country
 */
export function countryUsesGerman(country) {
    return country === "DE" || country === "AT" ? "de" : "en";
}
/**
 * Get the name of a given InvoiceItemType
 */
export function getInvoiceItemTypeName(type, languageCode) {
    switch (type) {
        case "0" /* InvoiceItemType.PREMIUM_USER */:
            return InvoiceTexts[languageCode].premiumUser;
        case "1" /* InvoiceItemType.StarterUser */:
            return InvoiceTexts[languageCode].starterUser;
        case "2" /* InvoiceItemType.StarterUserPackage */:
            return InvoiceTexts[languageCode].starterUserPackage;
        case "3" /* InvoiceItemType.StarterUserPackageUpgrade */:
            return InvoiceTexts[languageCode].starterUserPackageUpgrade;
        case "4" /* InvoiceItemType.StoragePackage */:
            return InvoiceTexts[languageCode].storagePackage;
        case "5" /* InvoiceItemType.StoragePackageUpgrade */:
            return InvoiceTexts[languageCode].storagePackageUpgrade;
        case "6" /* InvoiceItemType.EmailAliasPackage */:
            return InvoiceTexts[languageCode].emailAliasPackage;
        case "7" /* InvoiceItemType.EmailAliasPackageUpgrade */:
            return InvoiceTexts[languageCode].emailAliasPackageUpgrade;
        case "8" /* InvoiceItemType.SharedMailGroup */:
            return InvoiceTexts[languageCode].sharedMailGroup;
        case "9" /* InvoiceItemType.WhitelabelFeature */:
            return InvoiceTexts[languageCode].whitelabelFeature;
        case "10" /* InvoiceItemType.ContactForm_UNUSED */:
            return InvoiceTexts[languageCode].contactFormUnused;
        case "11" /* InvoiceItemType.WhitelabelChild */:
            return InvoiceTexts[languageCode].whitelabelChild;
        case "12" /* InvoiceItemType.LocalAdminGroup */:
            return InvoiceTexts[languageCode].localAdminGroup;
        case "13" /* InvoiceItemType.Discount */:
            return InvoiceTexts[languageCode].discount;
        case "14" /* InvoiceItemType.SharingFeature */:
            return InvoiceTexts[languageCode].sharingFeature;
        case "15" /* InvoiceItemType.Credit */:
            return InvoiceTexts[languageCode].creditType;
        case "16" /* InvoiceItemType.GiftCard */:
            return InvoiceTexts[languageCode].giftCard;
        case "17" /* InvoiceItemType.BusinessFeature */:
            return InvoiceTexts[languageCode].businessFeature;
        case "18" /* InvoiceItemType.GiftCardMigration */:
            return InvoiceTexts[languageCode].giftCardMigration;
        case "19" /* InvoiceItemType.ReferralCredit */:
            return InvoiceTexts[languageCode].referralCredit;
        case "20" /* InvoiceItemType.CancelledReferralCredit */:
            return InvoiceTexts[languageCode].cancelledReferralCredit;
        case "21" /* InvoiceItemType.RevolutionaryAccount */:
            return InvoiceTexts[languageCode].revolutionaryAccount;
        case "22" /* InvoiceItemType.LegendAccount */:
            return InvoiceTexts[languageCode].legendAccount;
        case "23" /* InvoiceItemType.EssentialAccount */:
            return InvoiceTexts[languageCode].essentialAccount;
        case "24" /* InvoiceItemType.AdvancedAccount */:
            return InvoiceTexts[languageCode].advancedAccount;
        case "25" /* InvoiceItemType.UnlimitedAccount */:
            return InvoiceTexts[languageCode].unlimitedAccount;
        default:
            throw new Error("Unknown InvoiceItemType " + type);
    }
}
//# sourceMappingURL=InvoiceUtils.js.map