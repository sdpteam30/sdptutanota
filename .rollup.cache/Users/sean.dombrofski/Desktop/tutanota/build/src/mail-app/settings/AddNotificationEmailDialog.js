import { createPushIdentifier } from "../../common/api/entities/sys/TypeRefs.js";
import { showNotAvailableForFreeDialog } from "../../common/misc/SubscriptionDialogs.js";
import { Dialog } from "../../common/gui/base/Dialog.js";
import { lang } from "../../common/misc/LanguageViewModel.js";
import m from "mithril";
import { TextField } from "../../common/gui/base/TextField.js";
import { assertNotNull } from "@tutao/tutanota-utils";
import { getCleanedMailAddress } from "../../common/misc/parsing/MailAddressParser.js";
import { showProgressDialog } from "../../common/gui/dialogs/ProgressDialog.js";
import { AppType } from "../../common/misc/ClientConstants.js";
export class AddNotificationEmailDialog {
    logins;
    entityClient;
    constructor(logins, entityClient) {
        this.logins = logins;
        this.entityClient = entityClient;
    }
    show() {
        if (this.logins.getUserController().isFreeAccount()) {
            showNotAvailableForFreeDialog();
        }
        else {
            let mailAddress = "";
            Dialog.showActionDialog({
                title: "notificationSettings_action",
                child: {
                    view: () => [
                        m(TextField, {
                            label: "mailAddress_label",
                            value: mailAddress,
                            type: "email" /* TextFieldType.Email */,
                            oninput: (newValue) => (mailAddress = newValue),
                        }),
                        m(".small.mt-s", lang.get("emailPushNotification_msg")),
                    ],
                },
                validator: () => this.validateAddNotificationEmailAddressInput(mailAddress),
                allowOkWithReturn: true,
                okAction: (dialog) => {
                    this.createNotificationEmail(mailAddress, this.logins.getUserController().user);
                    dialog.close();
                },
            });
        }
    }
    createNotificationEmail(mailAddress, user) {
        const pushIdentifier = createPushIdentifier({
            _area: "0", // legacy
            _owner: user.userGroup.group, // legacy
            _ownerGroup: user.userGroup.group,
            displayName: lang.get("adminEmailSettings_action"),
            identifier: assertNotNull(getCleanedMailAddress(mailAddress)),
            language: lang.code,
            pushServiceType: "2" /* PushServiceType.EMAIL */,
            lastUsageTime: new Date(),
            lastNotificationDate: null,
            disabled: false,
            app: AppType.Mail, // Calendar app doesn't receive mail notifications
        });
        showProgressDialog("pleaseWait_msg", this.entityClient.setup(assertNotNull(user.pushIdentifierList).list, pushIdentifier));
    }
    validateAddNotificationEmailAddressInput(emailAddress) {
        return getCleanedMailAddress(emailAddress) == null ? "mailAddressInvalid_msg" : null; // TODO check if it is a Tutanota mail address
    }
}
//# sourceMappingURL=AddNotificationEmailDialog.js.map