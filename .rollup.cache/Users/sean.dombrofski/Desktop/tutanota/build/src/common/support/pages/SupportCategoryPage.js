import m from "mithril";
import { SectionButton } from "../../gui/base/buttons/SectionButton.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { getLocalisedCategoryIntroduction, getLocalisedCategoryName, getLocalisedTopicIssue } from "../SupportDialog.js";
import { NoSolutionSectionButton } from "../NoSolutionSectionButton.js";
import { Card } from "../../gui/base/Card.js";
import { px, size } from "../../gui/size.js";
export class SupportCategoryPage {
    view({ attrs: { data: { selectedCategory, selectedTopic }, goToTopicDetailPage, goToContactSupport, }, }) {
        const languageTag = lang.languageTag;
        const currentlySelectedCategory = selectedCategory();
        return m(".pt.pb", [
            m(Card, { shouldDivide: true }, [
                m("section.pt-s.pb-s", {
                    style: {
                        padding: px(size.vpad_small),
                    },
                }, [
                    m(".h4.mb-0", getLocalisedCategoryName(selectedCategory(), languageTag)),
                    m("p.mt-xs.mb-s", getLocalisedCategoryIntroduction(currentlySelectedCategory, languageTag)),
                ]),
                currentlySelectedCategory.topics.map((topic) => m(SectionButton, {
                    text: { text: getLocalisedTopicIssue(topic, languageTag), testId: "" },
                    onclick: () => {
                        selectedTopic(topic);
                        goToTopicDetailPage();
                    },
                })),
                m(NoSolutionSectionButton, {
                    onClick: () => goToContactSupport(),
                }),
            ]),
        ]);
    }
}
//# sourceMappingURL=SupportCategoryPage.js.map