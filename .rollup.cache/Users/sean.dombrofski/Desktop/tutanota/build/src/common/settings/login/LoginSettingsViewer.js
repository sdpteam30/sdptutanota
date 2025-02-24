import m from "mithril";
import stream from "mithril/stream";
import { TextField } from "../../gui/base/TextField.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { CustomerPropertiesTypeRef, SessionTypeRef } from "../../api/entities/sys/TypeRefs.js";
import { assertNotNull, LazyLoaded, neverNull, ofClass } from "@tutao/tutanota-utils";
import { formatDateTimeFromYesterdayOn } from "../../misc/Formatter.js";
import { SecondFactorsEditForm } from "./secondfactor/SecondFactorsEditForm.js";
import { NotFoundError } from "../../api/common/error/RestError.js";
import * as RecoverCodeDialog from "./RecoverCodeDialog.js";
import { attachDropdown } from "../../gui/base/Dropdown.js";
import { ExpanderButton, ExpanderPanel } from "../../gui/base/Expander.js";
import { Table } from "../../gui/base/Table.js";
import { ifAllowedTutaLinks } from "../../gui/base/GuiUtils.js";
import { CredentialEncryptionMode } from "../../misc/credentials/CredentialEncryptionMode.js";
import { showCredentialsEncryptionModeDialog } from "../../gui/dialogs/SelectCredentialsEncryptionModeDialog.js";
import { assertMainOrNode, isDesktop } from "../../api/common/Env.js";
import { locator } from "../../api/main/CommonLocator.js";
import { elementIdPart, getElementId } from "../../api/common/utils/EntityUtils.js";
import { showChangeOwnPasswordDialog } from "./ChangePasswordDialogs.js";
import { IconButton } from "../../gui/base/IconButton.js";
import { DropDownSelector } from "../../gui/base/DropDownSelector.js";
import { UserSettingsGroupRootTypeRef } from "../../api/entities/tutanota/TypeRefs.js";
import { isUpdateForTypeRef } from "../../api/common/utils/EntityUpdateUtils.js";
import { Dialog } from "../../gui/base/Dialog.js";
import { MoreInfoLink } from "../../misc/news/MoreInfoLink.js";
assertMainOrNode();
export class LoginSettingsViewer {
    credentialsProvider;
    mobileSystemFacade;
    _mailAddress = stream(neverNull(locator.logins.getUserController().userGroupInfo.mailAddress));
    _stars = stream("***");
    _closedSessionsExpanded = stream(false);
    _sessions = [];
    _secondFactorsForm = new SecondFactorsEditForm(new LazyLoaded(() => Promise.resolve(locator.logins.getUserController().user)), locator.domainConfigProvider(), locator.loginFacade, true, false);
    _usageTestModel;
    credentialEncryptionMode = null;
    appLockMethod = null;
    constructor(credentialsProvider, mobileSystemFacade) {
        this.credentialsProvider = credentialsProvider;
        this.mobileSystemFacade = mobileSystemFacade;
        this._usageTestModel = locator.usageTestModel;
        this._updateSessions();
        this.updateAppLockData();
    }
    async updateAppLockData() {
        if (isDesktop()) {
            this.credentialEncryptionMode = await this.credentialsProvider.getCredentialEncryptionMode();
        }
        else if (this.mobileSystemFacade) {
            this.appLockMethod = await this.mobileSystemFacade.getAppLockMethod();
        }
        m.redraw();
    }
    view() {
        const mailAddressAttrs = {
            label: "mailAddress_label",
            value: this._mailAddress(),
            oninput: this._mailAddress,
            isReadOnly: true,
        };
        const changePasswordButtonAttrs = {
            title: "changePassword_label",
            click: () => showChangeOwnPasswordDialog(),
            icon: "Edit" /* Icons.Edit */,
            size: 1 /* ButtonSize.Compact */,
        };
        const passwordAttrs = {
            label: "password_label",
            value: this._stars(),
            oninput: this._stars,
            isReadOnly: true,
            injectionsRight: () => m(IconButton, changePasswordButtonAttrs),
        };
        const recoveryCodeDropdownButtonAttrs = attachDropdown({
            mainButtonAttrs: {
                title: "edit_action",
                icon: "Edit" /* Icons.Edit */,
                size: 1 /* ButtonSize.Compact */,
            },
            childAttrs: () => [
                locator.logins.getUserController().user.auth?.recoverCode
                    ? {
                        label: "show_action",
                        click: () => RecoverCodeDialog.showRecoverCodeDialogAfterPasswordVerification("get"),
                    }
                    : null,
                {
                    label: neverNull(locator.logins.getUserController().user.auth).recoverCode ? "update_action" : "setUp_action",
                    click: () => RecoverCodeDialog.showRecoverCodeDialogAfterPasswordVerification("create"),
                },
            ],
            showDropdown: () => true,
        });
        const recoveryCodeFieldAttrs = {
            label: "recoveryCode_label",
            helpLabel: () => {
                return ifAllowedTutaLinks(locator.logins, "https://tuta.com/faq#reset" /* InfoLink.RecoverCode */, (link) => [m(MoreInfoLink, { link: link })]);
            },
            value: this._stars(),
            oninput: this._stars,
            isReadOnly: true,
            injectionsRight: () => m(IconButton, recoveryCodeDropdownButtonAttrs),
        };
        const usageDataOptInAttrs = {
            label: "userUsageDataOptIn_label",
            items: [
                {
                    name: lang.get("activated_label"),
                    value: true,
                },
                {
                    name: lang.get("deactivated_label"),
                    value: false,
                },
                {
                    name: lang.get("undecided_label"),
                    value: null,
                    selectable: false,
                },
            ],
            selectedValue: locator.logins.getUserController().userSettingsGroupRoot.usageDataOptedIn,
            selectionChangedHandler: (v) => {
                this._usageTestModel.setOptInDecision(assertNotNull(v));
            },
            helpLabel: () => {
                return ifAllowedTutaLinks(locator.logins, "https://tuta.com/faq#usage" /* InfoLink.Usage */, (link) => [
                    m("span", lang.get("userUsageDataOptInInfo_msg") + " "),
                    m(MoreInfoLink, { link: link }),
                ]);
            },
            dropdownWidth: 250,
        };
        // Might be not there when we are logging out
        if (locator.logins.isUserLoggedIn()) {
            const user = locator.logins.getUserController();
            return m("", [
                m("#user-settings.fill-absolute.scroll.plr-l.pb-xl", [
                    m(".h4.mt-l", lang.get("loginCredentials_label")),
                    m(TextField, mailAddressAttrs),
                    m(TextField, passwordAttrs),
                    user.isGlobalAdmin() ? m(TextField, recoveryCodeFieldAttrs) : null,
                    this.renderAppLockField(),
                    m(this._secondFactorsForm),
                    m(".h4.mt-l", lang.get("activeSessions_label")),
                    this._renderActiveSessions(),
                    m(".small", lang.get("sessionsInfo_msg")),
                    m(".flex-space-between.items-center.mt-l.mb-s", [
                        m(".h4", lang.get("closedSessions_label")),
                        m(ExpanderButton, {
                            label: "show_action",
                            expanded: this._closedSessionsExpanded(),
                            onExpandedChange: this._closedSessionsExpanded,
                            showWarning: false,
                        }),
                    ]),
                    m(ExpanderPanel, {
                        expanded: this._closedSessionsExpanded(),
                    }, this._renderClosedSessions()),
                    m(".small", lang.get("sessionsWillBeDeleted_msg")),
                    m(".small", lang.get("sessionsInfo_msg")),
                    this._usageTestModel.isCustomerOptedOut()
                        ? null
                        : m("", [m(".h4.mt-l", lang.get("usageData_label")), m(DropDownSelector, usageDataOptInAttrs)]),
                ]),
            ]);
        }
        else {
            return null;
        }
    }
    renderAppLockField() {
        const mobileSystemFacade = this.mobileSystemFacade;
        // On mobile we display app lock dialog, on desktop credential encryption dialog. They are similar but different.
        if (mobileSystemFacade) {
            const onEdit = async () => {
                const { showAppLockMethodDialog } = await import("../../native/main/SelectAppLockMethodDialog.js");
                await showAppLockMethodDialog(mobileSystemFacade);
                await this.updateAppLockData();
            };
            return m(TextField, {
                label: "credentialsEncryptionMode_label",
                value: this.appLockMethodName(this.appLockMethod ?? "0" /* AppLockMethod.None */),
                isReadOnly: true,
                injectionsRight: () => m(IconButton, {
                    title: "edit_action",
                    icon: "Edit" /* Icons.Edit */,
                    click: () => onEdit(),
                }),
            });
        }
        else if (isDesktop()) {
            const usedMode = this.credentialEncryptionMode ?? CredentialEncryptionMode.DEVICE_LOCK;
            return m(TextField, {
                label: "credentialsEncryptionMode_label",
                value: this.credentialsEncryptionModeName(usedMode),
                isReadOnly: true,
                injectionsRight: () => m(IconButton, {
                    title: "edit_action",
                    icon: "Edit" /* Icons.Edit */,
                    click: () => showCredentialsEncryptionModeDialog(this.credentialsProvider).then(() => this.updateAppLockData()),
                }),
            });
        }
    }
    async _updateSessions() {
        const sessions = await locator.entityClient.loadAll(SessionTypeRef, neverNull(locator.logins.getUserController().user.auth).sessions);
        sessions.sort((s1, s2) => s2.lastAccessTime.getTime() - s1.lastAccessTime.getTime());
        this._sessions = sessions;
        m.redraw();
    }
    _renderActiveSessions() {
        return m(Table, {
            columnHeading: ["client_label"],
            columnWidths: [".column-width-largest" /* ColumnWidth.Largest */],
            showActionButtonColumn: true,
            lines: this._sessions
                .filter((session) => session.state === "0" /* SessionState.SESSION_STATE_ACTIVE */)
                .map((session) => {
                const thisSession = elementIdPart(locator.logins.getUserController().sessionId) === getElementId(session);
                return {
                    cells: () => [
                        {
                            main: thisSession ? lang.get("thisClient_label") : session.clientIdentifier,
                            info: [
                                lang.get("lastAccessWithTime_label", {
                                    "{time}": formatDateTimeFromYesterdayOn(session.lastAccessTime),
                                }),
                                session.loginIpAddress ? session.loginIpAddress : "",
                            ],
                            click: () => this.showActiveSessionInfoDialog(session, thisSession),
                        },
                    ],
                    actionButtonAttrs: thisSession
                        ? null
                        : {
                            title: "closeSession_action",
                            click: () => {
                                this._closeSession(session);
                            },
                            icon: "Cancel" /* Icons.Cancel */,
                            size: 1 /* ButtonSize.Compact */,
                        },
                };
            }),
        });
    }
    showActiveSessionInfoDialog(session, isThisSession) {
        const actionDialogProperties = {
            title: "details_label",
            child: {
                view: () => {
                    return [
                        m(TextField, {
                            label: "client_label",
                            value: isThisSession ? lang.get("thisClient_label") : session.clientIdentifier,
                            isReadOnly: true,
                        }),
                        m(TextField, {
                            label: "lastAccess_label",
                            value: `${formatDateTimeFromYesterdayOn(session.lastAccessTime)}`,
                            isReadOnly: true,
                        }),
                        m(TextField, {
                            label: "IpAddress_label",
                            value: session.loginIpAddress ? session.loginIpAddress : "",
                            isReadOnly: true,
                        }),
                    ];
                },
            },
            okAction: null,
            allowCancel: true,
            allowOkWithReturn: false,
            cancelActionTextId: "close_alt",
        };
        Dialog.showActionDialog(actionDialogProperties);
    }
    _closeSession(session) {
        locator.entityClient.erase(session).catch(ofClass(NotFoundError, () => {
            console.log(`session ${JSON.stringify(session._id)} already deleted`);
        }));
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            if (isUpdateForTypeRef(SessionTypeRef, update)) {
                await this._updateSessions();
            }
            else if (isUpdateForTypeRef(CustomerPropertiesTypeRef, update) || isUpdateForTypeRef(UserSettingsGroupRootTypeRef, update)) {
                m.redraw();
            }
            await this._secondFactorsForm.entityEventReceived(update);
        }
    }
    credentialsEncryptionModeName(credentialsEncryptionMode) {
        const mapping = {
            [CredentialEncryptionMode.DEVICE_LOCK]: "credentialsEncryptionModeDeviceLock_label",
            [CredentialEncryptionMode.SYSTEM_PASSWORD]: "credentialsEncryptionModeDeviceCredentials_label",
            [CredentialEncryptionMode.BIOMETRICS]: "credentialsEncryptionModeBiometrics_label",
            [CredentialEncryptionMode.APP_PASSWORD]: "credentialsEncryptionModeAppPassword_label",
        };
        return lang.get(mapping[credentialsEncryptionMode]);
    }
    appLockMethodName(appLockMethod) {
        const mapping = {
            ["0" /* AppLockMethod.None */]: "credentialsEncryptionModeDeviceLock_label",
            ["1" /* AppLockMethod.SystemPassOrBiometrics */]: "credentialsEncryptionModeDeviceCredentials_label",
            ["2" /* AppLockMethod.Biometrics */]: "credentialsEncryptionModeBiometrics_label",
        };
        return lang.get(mapping[appLockMethod]);
    }
    _renderClosedSessions() {
        const lines = this._sessions
            .filter((session) => session.state !== "0" /* SessionState.SESSION_STATE_ACTIVE */)
            .map((session) => {
            return {
                cells: [
                    session.clientIdentifier,
                    formatDateTimeFromYesterdayOn(session.lastAccessTime),
                    session.loginIpAddress ? session.loginIpAddress : "",
                ],
            };
        });
        return m(Table, {
            columnHeading: ["client_label", "lastAccess_label", "IpAddress_label"],
            columnWidths: [".column-width-small" /* ColumnWidth.Small */, ".column-width-largest" /* ColumnWidth.Largest */, ".column-width-small" /* ColumnWidth.Small */],
            showActionButtonColumn: true,
            lines: lines,
        });
    }
}
//# sourceMappingURL=LoginSettingsViewer.js.map