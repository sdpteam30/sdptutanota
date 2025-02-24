import m from "mithril";
import { lang } from "../../misc/LanguageViewModel.js";
import { htmlSanitizer } from "../../misc/HtmlSanitizer.js";
import { convertTextToHtml } from "../../misc/Formatter.js";
import { getLocalisedTopicIssue } from "../SupportDialog.js";
import { Card } from "../../gui/base/Card.js";
import { theme } from "../../gui/theme.js";
import { SectionButton } from "../../gui/base/buttons/SectionButton.js";
export class SupportTopicPage {
    view({ attrs: { data, goToContactSupportPage, goToSolutionWasHelpfulPage } }) {
        const topic = data.selectedTopic();
        if (topic == null) {
            return;
        }
        const languageTag = lang.languageTag;
        const solution = languageTag.includes("de") ? topic.solutionHtmlDE : topic.solutionHtmlEN;
        const sanitisedSolution = htmlSanitizer.sanitizeHTML(convertTextToHtml(solution), {
            blockExternalContent: true,
        }).html;
        const issue = getLocalisedTopicIssue(topic, languageTag);
        return m(".flex.flex-column.pt.pb", {
            style: {
                "overflow-x": "auto",
            },
            class: "height-100p",
        }, [
            m(Card, {
                rootElementType: "div",
                classes: ["scroll", "mb"],
            }, m(".h4.m-0.pb", issue), m.trust(sanitisedSolution)),
        ], m(WasThisHelpful, { goToContactSupportPage, goToSolutionWasHelpfulPage }));
    }
}
class WasThisHelpful {
    view({ attrs: { goToContactSupportPage, goToSolutionWasHelpfulPage } }) {
        return m(".flex.flex-column.gap-vpad-s", m("small.uppercase.b.text-ellipsis", { style: { color: theme.navigation_button } }, lang.get("wasThisHelpful_msg")), m(Card, { shouldDivide: true }, [
            m(SectionButton, {
                text: "yes_label",
                onclick: goToSolutionWasHelpfulPage,
                rightIcon: { icon: "Checkmark" /* Icons.Checkmark */, title: "yes_label" },
            }),
            m(SectionButton, {
                text: "no_label",
                onclick: goToContactSupportPage,
            }),
        ]));
    }
}
//# sourceMappingURL=SupportTopicPage.js.map