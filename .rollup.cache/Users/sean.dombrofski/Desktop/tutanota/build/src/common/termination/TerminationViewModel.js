import { lang } from "../misc/LanguageViewModel.js";
import { getLoginErrorStateAndMessage } from "../misc/LoginUtils.js";
import { TerminationPeriodOptions } from "../api/common/TutanotaConstants.js";
import { CustomerAccountTerminationService } from "../api/entities/sys/Services.js";
import { createCustomerAccountTerminationPostIn, CustomerAccountTerminationRequestTypeRef, } from "../api/entities/sys/TypeRefs.js";
import { PreconditionFailedError } from "../api/common/error/RestError.js";
import { incrementDate } from "@tutao/tutanota-utils";
export class TerminationViewModel {
    loginController;
    secondFactorHandler;
    serviceExecutor;
    entityClient;
    mailAddress;
    password;
    date;
    terminationPeriodOption;
    acceptedTerminationRequest;
    helpText;
    loginState;
    constructor(loginController, secondFactorHandler, serviceExecutor, entityClient) {
        this.loginController = loginController;
        this.secondFactorHandler = secondFactorHandler;
        this.serviceExecutor = serviceExecutor;
        this.entityClient = entityClient;
        this.mailAddress = "";
        this.password = "";
        this.date = incrementDate(new Date(), 1);
        this.acceptedTerminationRequest = null;
        this.terminationPeriodOption = TerminationPeriodOptions.EndOfCurrentPeriod;
        this.helpText = "emptyString_msg";
        this.loginState = "NotAuthenticated" /* LoginState.NotAuthenticated */;
    }
    async createAccountTerminationRequest(surveyData = null) {
        await this.authenticate();
        if (this.loginState == "LoggedIn" /* LoginState.LoggedIn */) {
            await this.createTerminationRequest(surveyData);
        }
    }
    /**
     * Creates the termination request based on the date option selected by the user and assument that the authentication was successfull.
     */
    async createTerminationRequest(surveyData) {
        try {
            const inputData = createCustomerAccountTerminationPostIn({
                terminationDate: this.getTerminationDate(),
                surveyData: surveyData,
            });
            let serviceResponse = await this.serviceExecutor.post(CustomerAccountTerminationService, inputData);
            this.acceptedTerminationRequest = await this.entityClient.load(CustomerAccountTerminationRequestTypeRef, serviceResponse.terminationRequest);
        }
        catch (e) {
            if (e instanceof PreconditionFailedError) {
                switch (e.data) {
                    case "invalidTerminationDate":
                        this.onTerminationRequestFailed("terminationInvalidDate_msg");
                        break;
                    case "alreadyCancelled":
                        this.onTerminationRequestFailed("terminationAlreadyCancelled_msg");
                        break;
                    case "noActiveSubscription":
                        this.onTerminationRequestFailed("terminationNoActiveSubscription_msg");
                        break;
                    case "hasAppStoreSubscription":
                        this.onTerminationRequestFailed(lang.getTranslation("deleteAccountWithAppStoreSubscription_msg", { "{AppStorePayment}": "https://tuta.com/support/#appstore-payments" /* InfoLink.AppStorePayment */ }));
                        break;
                    default:
                        throw e;
                }
            }
            else {
                throw e;
            }
        }
        finally {
            await this.loginController.logout(false);
            this.loginState = "NotAuthenticated" /* LoginState.NotAuthenticated */;
        }
    }
    onTerminationRequestFailed(errorMessage) {
        this.helpText = errorMessage;
    }
    onAuthentication() {
        this.helpText = "emptyString_msg";
        this.loginState = "LoggedIn" /* LoginState.LoggedIn */;
    }
    onError(helpText, state) {
        this.helpText = helpText;
        this.loginState = state;
    }
    getTerminationDate() {
        return this.terminationPeriodOption === TerminationPeriodOptions.EndOfCurrentPeriod
            ? // The server will use the end of the current subscription period to cancel the account if the terminationDate is null.
                null
            : this.date;
    }
    async authenticate() {
        const mailAddress = this.mailAddress;
        const password = this.password;
        if (mailAddress === "" || password === "") {
            this.onError("loginFailed_msg", "InvalidCredentials" /* LoginState.InvalidCredentials */);
            return;
        }
        this.helpText = "emptyString_msg";
        try {
            await this.loginController.createSession(mailAddress, password, 1 /* SessionType.Temporary */);
            this.onAuthentication();
        }
        catch (e) {
            const { errorMessage, state } = getLoginErrorStateAndMessage(e);
            this.onError(errorMessage, state);
        }
        finally {
            await this.secondFactorHandler.closeWaitingForSecondFactorDialog();
        }
    }
}
//# sourceMappingURL=TerminationViewModel.js.map