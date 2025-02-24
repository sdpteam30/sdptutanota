export function getWhitelabelDomainInfo(customerInfo, domainName) {
    return customerInfo.domainInfos.find((info) => info.whitelabelConfig != null && (domainName == null || info.domain === domainName)) ?? null;
}
export function getCustomMailDomains(customerInfo) {
    return customerInfo.domainInfos.filter((di) => di.whitelabelConfig == null);
}
export function isCustomizationEnabledForCustomer(customer, feature) {
    return customer.customizations.some((customization) => customization.feature === feature);
}
//# sourceMappingURL=CustomerUtils.js.map