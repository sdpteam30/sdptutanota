import m from "mithril";
import { lang } from "../../misc/LanguageViewModel.js";
import { SectionButton } from "../../gui/base/buttons/SectionButton.js";
import { getLocalisedCategoryName } from "../SupportDialog.js";
import { NoSolutionSectionButton } from "../NoSolutionSectionButton.js";
import { px } from "../../gui/size.js";
import { Card } from "../../gui/base/Card.js";
import { Icon, IconSize } from "../../gui/base/Icon.js";
import { theme } from "../../gui/theme.js";
export class SupportLandingPage {
    view({ attrs: { data: { categories, selectedCategory }, goToContactSupport, toCategoryDetail, }, }) {
        const defaultHeight = 666;
        return m(".pt.pb", {
            style: {
                height: px(defaultHeight),
                // height: px(styles.bodyHeight > defaultHeight ? defaultHeight : styles.bodyHeight),
            },
        }, m(Card, {
            classes: [],
        }, m("", {
            style: {
                padding: "0.5em",
            },
        }, m(".center", m(Icon, {
            icon: "SpeechBubbleOutline" /* Icons.SpeechBubbleOutline */,
            size: IconSize.XXL,
        })), m(".center.h4", lang.get("supportStartPage_title")), m(".center", lang.get("supportStartPage_msg")))), m(".pb.pt.flex.col.gap-vpad.fit-height.box-content", categories.map((category) => m(SectionButton, {
            leftIcon: { icon: category.icon, title: "close_alt", fill: theme.content_accent },
            text: { text: getLocalisedCategoryName(category, lang.languageTag), testId: "" },
            onclick: () => {
                selectedCategory(category);
                toCategoryDetail();
            },
        })), m(NoSolutionSectionButton, {
            onClick: goToContactSupport,
        })));
    }
}
//# sourceMappingURL=SupportLandingPage.js.map