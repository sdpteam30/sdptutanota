// @bundleInto:boot
export function applicationPaths({ login, termination, mail, externalLogin, contact, contactList, search, settings, calendar, signup, giftcard, recover, webauthn, webauthnmobile, }) {
    return {
        "/login": login,
        "/termination": termination,
        "/signup": signup,
        "/recover": recover,
        "/mailto": mail,
        "/mail": mail,
        "/mail/:folderId": mail,
        "/mail/:folderId/:mailId": mail,
        "/ext": externalLogin,
        "/contact": contact,
        "/contact/:listId": contact,
        "/contact/:listId/:contactId": contact,
        "/contactlist": contactList,
        "/contactlist/:listId": contactList,
        "/contactlist/:listId/:Id": contactList,
        "/search/:category": search,
        "/search/:category/:id": search,
        "/settings": settings,
        "/settings/:folder": settings,
        "/settings/:folder/:id": settings,
        "/calendar": calendar,
        "/calendar/:view": calendar,
        "/calendar/:view/:date": calendar,
        "/giftcard/": giftcard,
        "/webauthn": webauthn,
        "/webauthnmobile": webauthnmobile,
    };
}
export function getPathBases() {
    const paths = Object.keys(applicationPaths({}));
    const uniquePathBases = new Set(paths.map((path) => path.split("/")[1]));
    return Array.from(uniquePathBases);
}
//# sourceMappingURL=ApplicationPaths.js.map