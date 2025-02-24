import m from "mithril";
import { lang } from "../../common/misc/LanguageViewModel";
import { DropDownSelector } from "../../common/gui/base/DropDownSelector";
import { getMailboxName } from "../../common/mailFunctionality/SharedMailUtils";
import { mailLocator } from "../mailLocator";
import { first } from "@tutao/tutanota-utils";
import { Button } from "../../common/gui/base/Button";
import { IconButton } from "../../common/gui/base/IconButton";
import { LoginButton } from "../../common/gui/base/buttons/LoginButton";
import { Icon, IconSize } from "../../common/gui/base/Icon";
export class MailExportSettings {
    selectedMailbox = null;
    controllerSubscription = null;
    isExportHistoryExpanded = false;
    oncreate(vnode) {
        this.controllerSubscription = vnode.attrs.mailExportController.state.map(m.redraw);
    }
    onremove() {
        if (this.controllerSubscription) {
            this.controllerSubscription.end();
            this.controllerSubscription = null;
        }
    }
    view(vnode) {
        const { mailboxDetails } = vnode.attrs;
        this.selectedMailbox = this.selectedMailbox ?? first(mailboxDetails);
        const state = vnode.attrs.mailExportController.state();
        const emptyLabel = m("br");
        return [
            m(DropDownSelector, {
                label: "mailboxToExport_label",
                items: mailboxDetails.map((mailboxDetail) => {
                    return { name: getMailboxName(mailLocator.logins, mailboxDetail), value: mailboxDetail };
                }),
                selectedValue: this.selectedMailbox,
                selectionChangedHandler: (selectedMailbox) => {
                    this.selectedMailbox = selectedMailbox;
                },
                dropdownWidth: 300,
                disabled: state.type === "exporting",
                helpLabel: () => emptyLabel,
            }),
            this.renderState(vnode.attrs.mailExportController),
        ];
    }
    renderState(controller) {
        const state = controller.state();
        switch (state.type) {
            case "exporting":
                return [
                    m(".flex-start.mt-m.small", lang.get("exportingEmails_label", {
                        "{count}": state.exportedMails,
                    })),
                    m(".flex-space-between.border-radius-big.mt-s.rel.nav-bg.full-width.center-vertically", [
                        m(Icon, {
                            icon: "Progress" /* BootIcons.Progress */,
                            class: "flex-center items-center icon-progress-tiny icon-progress ml-s",
                            size: IconSize.Medium,
                        }),
                        m(IconButton, {
                            title: "cancel_action",
                            icon: "Cancel" /* Icons.Cancel */,
                            click: () => {
                                controller.cancelExport();
                            },
                            size: 0 /* ButtonSize.Normal */,
                        }),
                    ]),
                ];
            case "idle":
                return [
                    m(".flex-start.mt-m", this.renderExportInfoText()),
                    m(".flex-start.mt-s", m(LoginButton, {
                        type: "FlexWidth" /* LoginButtonType.FlexWidth */,
                        label: "export_action",
                        onclick: () => {
                            if (this.selectedMailbox) {
                                controller.startExport(this.selectedMailbox);
                            }
                        },
                    })),
                ];
            case "error":
                return [
                    m(".flex-space-between.items-center.mt.mb-s", [
                        m("small.noselect", state.message),
                        m(Button, {
                            label: "retry_action",
                            click: () => {
                                controller.cancelExport();
                                if (this.selectedMailbox) {
                                    controller.startExport(this.selectedMailbox);
                                }
                            },
                            type: "secondary" /* ButtonType.Secondary */,
                        }),
                    ]),
                ];
            case "finished":
                return [
                    m("small.noselect", lang.get("exportFinished_label")),
                    m(".flex-start.mt-s", m(LoginButton, {
                        type: "FlexWidth" /* LoginButtonType.FlexWidth */,
                        label: "open_action",
                        onclick: () => this.onOpenClicked(controller),
                    })),
                ];
            case "locked":
                return [
                    m(".flex-space-between.items-center.mt.mb-s.button-height", [
                        m("small.noselect", `${lang.get("exportRunningElsewhere_label")} ${lang.get("pleaseWait_msg")}`),
                    ]),
                ];
        }
    }
    async onOpenClicked(controller) {
        await controller.openExportDirectory();
        await controller.cancelExport();
    }
    renderExportInfoText() {
        return [m(".small", lang.get("mailExportInfoText_label"))];
    }
}
//# sourceMappingURL=MailExportSettings.js.map