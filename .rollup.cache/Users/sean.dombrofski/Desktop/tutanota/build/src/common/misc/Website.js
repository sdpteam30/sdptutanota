export async function requestFromWebsite(path, domainConfig) {
    const url = new URL(path, domainConfig.websiteBaseUrl);
    return fetch(url.href);
}
//# sourceMappingURL=Website.js.map