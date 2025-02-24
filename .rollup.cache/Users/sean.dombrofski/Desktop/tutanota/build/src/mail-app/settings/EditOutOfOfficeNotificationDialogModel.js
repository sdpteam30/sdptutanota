import { createOutOfOfficeNotification, createOutOfOfficeNotificationMessage } from "../../common/api/entities/tutanota/TypeRefs.js";
import stream from "mithril/stream";
import { getDayShifted, getStartOfDay, getStartOfNextDay, ofClass } from "@tutao/tutanota-utils";
import { InvalidDataError, PreconditionFailedError } from "../../common/api/common/error/RestError";
import { lang } from "../../common/misc/LanguageViewModel";
import { appendEmailSignature } from "../mail/signature/Signature";
import { UserError } from "../../common/api/main/UserError";
import { UpgradeRequiredError } from "../../common/api/main/UpgradeRequiredError.js";
import { getAvailablePlansWithAutoResponder } from "../../common/subscription/SubscriptionUtils.js";
const FAILURE_UPGRADE_REQUIRED = "outofoffice.not_available_on_current_plan";
export class EditOutOfOfficeNotificationDialogModel {
    serviceExecutor;
    outOfOfficeNotification;
    enabled = stream(false);
    startDate = stream(new Date());
    endDate = stream(new Date());
    indefiniteTimeRange = stream(true);
    timeRangeEnabled = stream(false);
    organizationSubject = stream("");
    organizationMessage = stream("");
    defaultSubject = stream("");
    defaultMessage = stream("");
    recipientMessageTypes = stream(0 /* RecipientMessageType.EXTERNAL_TO_EVERYONE */);
    _entityClient;
    _userController;
    _languageViewModel;
    constructor(outOfOfficeNotification, entityClient, userController, languageViewModel, serviceExecutor) {
        this.serviceExecutor = serviceExecutor;
        this._entityClient = entityClient;
        this._userController = userController;
        this._languageViewModel = languageViewModel;
        this._setDefaultMessages();
        if (!outOfOfficeNotification) {
            this.startDate(getStartOfDay(new Date()));
            this.outOfOfficeNotification = createOutOfOfficeNotification({
                notifications: [],
                enabled: false,
                endDate: null,
                startDate: null,
            });
        }
        else {
            this.outOfOfficeNotification = outOfOfficeNotification;
            this.enabled(outOfOfficeNotification.enabled);
            let defaultEnabled = false;
            let organizationEnabled = false;
            for (const notification of outOfOfficeNotification.notifications) {
                if (notification.type === "0" /* OutOfOfficeNotificationMessageType.Default */) {
                    defaultEnabled = true;
                    this.defaultSubject(notification.subject);
                    this.defaultMessage(notification.message);
                }
                else if (notification.type === "1" /* OutOfOfficeNotificationMessageType.InsideOrganization */) {
                    organizationEnabled = true;
                    this.organizationSubject(notification.subject);
                    this.organizationMessage(notification.message);
                }
            }
            if (defaultEnabled && organizationEnabled) {
                this.recipientMessageTypes(1 /* RecipientMessageType.INTERNAL_AND_EXTERNAL */);
            }
            else if (organizationEnabled) {
                this.recipientMessageTypes(2 /* RecipientMessageType.INTERNAL_ONLY */);
            }
            else {
                this.recipientMessageTypes(0 /* RecipientMessageType.EXTERNAL_TO_EVERYONE */);
            }
            if (outOfOfficeNotification.startDate) {
                this.startDate(outOfOfficeNotification.startDate);
                this.timeRangeEnabled(true);
                // end dates are stored as the beginning of the following date. We subtract one day to show the correct date to the user.
                if (outOfOfficeNotification.endDate) {
                    const shiftedEndDate = getDayShifted(outOfOfficeNotification.endDate, -1);
                    this.endDate(shiftedEndDate);
                    this.indefiniteTimeRange(false);
                }
                else {
                    this.indefiniteTimeRange(true);
                }
            }
        }
    }
    _setDefaultMessages() {
        const templateSubject = this._languageViewModel.get("outOfOfficeDefaultSubject_msg");
        const templateMessage = appendEmailSignature(this._languageViewModel.get("outOfOfficeDefault_msg"), this._userController.props);
        this.organizationSubject(templateSubject);
        this.defaultSubject(templateSubject);
        this.defaultMessage(templateMessage);
        this.organizationMessage(templateMessage);
    }
    /**
     * Return OutOfOfficeNotification created from input data.
     * @throws UserError if time period is invalid
     * */
    getNotificationFromData() {
        let startDate = null;
        let endDate = null;
        // We use the last second of the day as end time to make sure notifications are still send during this day.
        // We use the local time for date picking and convert it to UTC because the server expects utc dates
        if (this.timeRangeEnabled()) {
            startDate = this.startDate();
            if (!this.indefiniteTimeRange()) {
                endDate = getStartOfNextDay(this.endDate());
                if (startDate.getTime() > endDate.getTime() || endDate.getTime() < Date.now()) {
                    throw new UserError("invalidTimePeriod_msg");
                }
            }
        }
        const notificationMessages = [];
        if (this.isDefaultMessageEnabled()) {
            const defaultNotification = createOutOfOfficeNotificationMessage({
                subject: this.defaultSubject().trim(),
                message: this.defaultMessage().trim(),
                type: "0" /* OutOfOfficeNotificationMessageType.Default */,
            });
            notificationMessages.push(defaultNotification);
        }
        if (this.isOrganizationMessageEnabled()) {
            const organizationNotification = createOutOfOfficeNotificationMessage({
                subject: this.organizationSubject().trim(),
                message: this.organizationMessage().trim(),
                type: "1" /* OutOfOfficeNotificationMessageType.InsideOrganization */,
            });
            notificationMessages.push(organizationNotification);
        }
        this.outOfOfficeNotification._ownerGroup = this._userController.getUserMailGroupMembership().group;
        this.outOfOfficeNotification.enabled = this.enabled();
        this.outOfOfficeNotification.startDate = startDate;
        this.outOfOfficeNotification.endDate = endDate;
        this.outOfOfficeNotification.notifications = notificationMessages;
        return this.outOfOfficeNotification;
    }
    isOrganizationMessageEnabled() {
        return (this.recipientMessageTypes() === 2 /* RecipientMessageType.INTERNAL_ONLY */ || this.recipientMessageTypes() === 1 /* RecipientMessageType.INTERNAL_AND_EXTERNAL */);
    }
    isDefaultMessageEnabled() {
        return (this.recipientMessageTypes() === 0 /* RecipientMessageType.EXTERNAL_TO_EVERYONE */ ||
            this.recipientMessageTypes() === 1 /* RecipientMessageType.INTERNAL_AND_EXTERNAL */);
    }
    /**
     * @throws UserError
     * @throws UpgradeRequiredError
     */
    saveOutOfOfficeNotification() {
        return Promise.resolve()
            .then(() => this.getNotificationFromData())
            .then(async (sendableNotification) => {
            // Error messages are already shown if sendableNotification is null. We do not close the dialog.
            if (this._isNewNotification()) {
                await this._entityClient.setup(null, sendableNotification);
            }
            else {
                await this._entityClient.update(sendableNotification);
            }
        })
            .catch(ofClass(InvalidDataError, (e) => {
            throw new UserError("outOfOfficeMessageInvalid_msg");
        }))
            .catch(ofClass(PreconditionFailedError, async (e) => {
            if (e.data === FAILURE_UPGRADE_REQUIRED) {
                throw new UpgradeRequiredError("upgradeRequired_msg", await getAvailablePlansWithAutoResponder());
            }
            else {
                throw new UserError(lang.makeTranslation("error_msg", e.toString()));
            }
        }));
    }
    _isNewNotification() {
        return !this.outOfOfficeNotification._id;
    }
}
//# sourceMappingURL=EditOutOfOfficeNotificationDialogModel.js.map