import m from "mithril";
import { formatDateWithWeekday, formatTime } from "../../../common/misc/Formatter.js";
import { theme } from "../../../common/gui/theme.js";
import { Icon } from "../../../common/gui/base/Icon.js";
import { responsiveCardHPadding } from "../../../common/gui/cards.js";
import { Keys } from "../../../common/api/common/TutanotaConstants.js";
import { isKeyPressed } from "../../../common/misc/KeyManager.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { getMailAddressDisplayText } from "../../../common/mailFunctionality/SharedMailUtils.js";
import { getConfidentialIcon, getFolderIconByType } from "./MailGuiUtils.js";
export class CollapsedMailView {
    view({ attrs }) {
        const { viewModel } = attrs;
        const { mail } = viewModel;
        const dateTime = formatDateWithWeekday(mail.receivedDate) + " • " + formatTime(mail.receivedDate);
        const folderInfo = viewModel.getFolderInfo();
        if (!folderInfo)
            return null;
        return m(".flex.items-center.pt.pb.click.no-wrap", {
            class: responsiveCardHPadding(),
            role: "button",
            "aria-expanded": "false",
            style: {
                color: theme.content_button,
            },
            onclick: () => viewModel.expandMail(Promise.resolve()),
            onkeyup: (e) => {
                if (isKeyPressed(e.key, Keys.SPACE)) {
                    viewModel.expandMail(Promise.resolve());
                }
            },
            tabindex: "0" /* TabIndex.Default */,
        }, [
            viewModel.isUnread() ? this.renderUnreadDot() : null,
            viewModel.isDraftMail() ? m(".mr-xs", this.renderIcon("Edit" /* Icons.Edit */, lang.get("draft_label"))) : null,
            this.renderSender(viewModel),
            m(".flex.ml-between-s.items-center", [
                mail.attachments.length > 0 ? this.renderIcon("Attachment" /* Icons.Attachment */, lang.get("attachment_label")) : null,
                viewModel.isConfidential() ? this.renderIcon(getConfidentialIcon(mail), lang.get("confidential_label")) : null,
                this.renderIcon(getFolderIconByType(folderInfo.folderType), folderInfo.name),
                m(".small.font-weight-600", dateTime),
            ]),
        ]);
    }
    renderSender(viewModel) {
        const sender = viewModel.getDisplayedSender();
        return m(this.getMailAddressDisplayClasses(viewModel), sender == null ? "" : getMailAddressDisplayText(sender.name, sender.address, true));
    }
    getMailAddressDisplayClasses(viewModel) {
        let classes = ".flex-grow.text-ellipsis";
        if (viewModel.isUnread()) {
            classes += ".font-weight-600";
        }
        return classes;
    }
    renderUnreadDot() {
        return m(".flex.flex-no-grow.no-shrink.pr-s", m(".dot.bg-accent-fg", {
            style: {
                marginTop: 0,
            },
        }));
    }
    renderIcon(icon, hoverText = null) {
        return m(Icon, {
            icon,
            container: "div",
            style: {
                fill: theme.content_button,
            },
            hoverText: hoverText,
        });
    }
}
//# sourceMappingURL=CollapsedMailView.js.map