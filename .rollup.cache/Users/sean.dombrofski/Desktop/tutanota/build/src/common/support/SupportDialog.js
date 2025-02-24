import m from "mithril";
import { assertMainOrNode, isWebClient } from "../api/common/Env";
import Stream from "mithril/stream";
import { SupportDataTypeRef } from "../api/entities/tutanota/TypeRefs.js";
import { MultiPageDialog } from "../gui/dialogs/MultiPageDialog.js";
import { SupportLandingPage } from "./pages/SupportLandingPage.js";
import { locator } from "../api/main/CommonLocator.js";
import { SupportCategoryPage } from "./pages/SupportCategoryPage.js";
import { SupportTopicPage } from "./pages/SupportTopicPage.js";
import { ContactSupportPage } from "./pages/ContactSupportPage.js";
import { SupportSuccessPage } from "./pages/SupportSuccessPage.js";
import { Keys } from "../api/common/TutanotaConstants.js";
import { HtmlEditor } from "../gui/editor/HtmlEditor.js";
import { EmailSupportUnavailablePage } from "./pages/EmailSupportUnavailablePage.js";
import { Dialog } from "../gui/base/Dialog.js";
import { client } from "../misc/ClientDetector";
import { SupportVisibilityMask } from "./SupportVisibilityMask";
import { SupportRequestSentPage } from "./pages/SupportRequestSentPage.js";
import { lang } from "../misc/LanguageViewModel.js";
assertMainOrNode();
var SupportPages;
(function (SupportPages) {
    SupportPages[SupportPages["CATEGORIES"] = 0] = "CATEGORIES";
    SupportPages[SupportPages["CATEGORY_DETAIL"] = 1] = "CATEGORY_DETAIL";
    SupportPages[SupportPages["TOPIC_DETAIL"] = 2] = "TOPIC_DETAIL";
    SupportPages[SupportPages["CONTACT_SUPPORT"] = 3] = "CONTACT_SUPPORT";
    SupportPages[SupportPages["SUPPORT_REQUEST_SENT"] = 4] = "SUPPORT_REQUEST_SENT";
    SupportPages[SupportPages["EMAIL_SUPPORT_BEHIND_PAYWALL"] = 5] = "EMAIL_SUPPORT_BEHIND_PAYWALL";
    SupportPages[SupportPages["SOLUTION_WAS_HELPFUL"] = 6] = "SOLUTION_WAS_HELPFUL";
})(SupportPages || (SupportPages = {}));
function isEnabled(visibility, mask) {
    return !!(visibility & mask);
}
export async function showSupportDialog(logins) {
    const supportData = await locator.entityClient.load(SupportDataTypeRef, "--------1---", { cacheMode: 1 /* CacheMode.WriteOnly */ });
    const categories = supportData.categories;
    for (const key in supportData.categories) {
        const filteredTopics = [];
        const supportCategory = categories[key];
        for (const topic of supportCategory.topics) {
            const visibility = Number(topic.visibility);
            const meetsPlatform = (isEnabled(visibility, SupportVisibilityMask.TutaCalendarMobile) && client.isCalendarApp()) ||
                (isEnabled(visibility, SupportVisibilityMask.TutaMailMobile) && client.isMailApp()) ||
                (isEnabled(visibility, SupportVisibilityMask.DesktopOrWebApp) && (client.isDesktopDevice() || isWebClient()));
            const isFreeAccount = !locator.logins.getUserController().isPaidAccount();
            const meetsCustomerStatus = (isEnabled(visibility, SupportVisibilityMask.FreeUsers) && isFreeAccount) ||
                (isEnabled(visibility, SupportVisibilityMask.PaidUsers) && !isFreeAccount);
            if (meetsPlatform && meetsCustomerStatus) {
                filteredTopics.push(topic);
            }
        }
        supportCategory.topics = filteredTopics;
    }
    const data = {
        canHaveEmailSupport: logins.isInternalUserLoggedIn() && logins.getUserController().isPaidAccount(),
        selectedCategory: Stream(null),
        selectedTopic: Stream(null),
        categories: supportData.categories.filter((cat) => cat.topics.length > 0),
        htmlEditor: new HtmlEditor().setMinHeight(250).setEnabled(true),
        shouldIncludeLogs: Stream(true),
        logs: Stream([]),
    };
    const multiPageDialog = new MultiPageDialog(SupportPages.CATEGORIES)
        .buildDialog((currentPage, dialog, navigateToPage, _) => {
        switch (currentPage) {
            case SupportPages.CATEGORY_DETAIL:
                return m(SupportCategoryPage, {
                    data,
                    goToContactSupport: () => {
                        if (data.canHaveEmailSupport) {
                            navigateToPage(SupportPages.CONTACT_SUPPORT);
                        }
                        else {
                            navigateToPage(SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL);
                        }
                    },
                    goToTopicDetailPage: () => navigateToPage(SupportPages.TOPIC_DETAIL),
                });
            case SupportPages.TOPIC_DETAIL:
                return m(SupportTopicPage, {
                    data,
                    dialog,
                    goToSolutionWasHelpfulPage: () => {
                        navigateToPage(SupportPages.SOLUTION_WAS_HELPFUL);
                    },
                    goToContactSupportPage: () => {
                        if (data.canHaveEmailSupport) {
                            navigateToPage(SupportPages.CONTACT_SUPPORT);
                        }
                        else {
                            navigateToPage(SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL);
                        }
                    },
                });
            case SupportPages.CONTACT_SUPPORT:
                return m(ContactSupportPage, { data, goToSuccessPage: () => navigateToPage(SupportPages.SUPPORT_REQUEST_SENT) });
            case SupportPages.SOLUTION_WAS_HELPFUL:
                return m(SupportSuccessPage);
            case SupportPages.SUPPORT_REQUEST_SENT: {
                return m(SupportRequestSentPage);
            }
            case SupportPages.CATEGORIES:
                return m(SupportLandingPage, {
                    data,
                    toCategoryDetail: () => navigateToPage(SupportPages.CATEGORY_DETAIL),
                    goToContactSupport: () => {
                        if (data.canHaveEmailSupport) {
                            navigateToPage(SupportPages.CONTACT_SUPPORT);
                        }
                        else {
                            navigateToPage(SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL);
                        }
                    },
                });
            case SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL:
                return m(EmailSupportUnavailablePage, {
                    data,
                    goToContactSupportPage: () => {
                        navigateToPage(SupportPages.CONTACT_SUPPORT);
                    },
                });
        }
    }, {
        getPageTitle: (_) => {
            return { testId: "back_action", text: lang.get("supportMenu_label") };
        },
        getLeftAction: (currentPage, dialog, navigateToPage, goBack) => {
            switch (currentPage) {
                case SupportPages.CATEGORIES:
                    return { type: "secondary" /* ButtonType.Secondary */, click: () => dialog.close(), label: "close_alt", title: "close_alt" };
                case SupportPages.TOPIC_DETAIL:
                case SupportPages.CATEGORY_DETAIL:
                case SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL:
                    return { type: "secondary" /* ButtonType.Secondary */, click: () => goBack(), label: "back_action", title: "back_action" };
                case SupportPages.CONTACT_SUPPORT:
                    return {
                        type: "secondary" /* ButtonType.Secondary */,
                        click: async () => {
                            if (data.htmlEditor.getTrimmedValue().length > 10) {
                                const confirmed = await Dialog.confirm({
                                    testId: "close_alt",
                                    text: lang.get("supportBackLostRequest_msg"),
                                });
                                if (confirmed) {
                                    goBack();
                                }
                            }
                            else {
                                goBack();
                            }
                        },
                        label: "back_action",
                        title: "back_action",
                    };
                case SupportPages.SOLUTION_WAS_HELPFUL:
                case SupportPages.SUPPORT_REQUEST_SENT:
                    return { type: "secondary" /* ButtonType.Secondary */, click: () => dialog.close(), label: "close_alt", title: "close_alt" };
            }
        },
        getRightAction: (currentPage, dialog, _, __) => {
            if (currentPage === SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL) {
                return {
                    type: "secondary" /* ButtonType.Secondary */,
                    label: "close_alt",
                    title: "close_alt",
                    click: () => {
                        dialog.close();
                    },
                };
            }
        },
    })
        .addShortcut({
        help: "close_alt",
        key: Keys.ESC,
        exec: () => multiPageDialog.close(),
    })
        .show();
}
export function getLocalisedCategoryName(category, languageTag) {
    return languageTag.includes("de") ? category.nameDE : category.nameEN;
}
export function getLocalisedCategoryIntroduction(category, languageTag) {
    return languageTag.includes("de") ? category.introductionDE : category.introductionEN;
}
export function getLocalisedTopicIssue(topic, languageTag) {
    return languageTag.includes("de") ? topic.issueDE : topic.issueEN;
}
//# sourceMappingURL=SupportDialog.js.map