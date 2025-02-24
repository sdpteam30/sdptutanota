import { assertMainOrNodeBoot } from "../api/common/Env";
assertMainOrNodeBoot();
export var ErrorReportClientType;
(function (ErrorReportClientType) {
    ErrorReportClientType["Browser"] = "0";
    ErrorReportClientType["Android"] = "1";
    ErrorReportClientType["Ios"] = "2";
    ErrorReportClientType["MacOS"] = "3";
    ErrorReportClientType["Linux"] = "4";
    ErrorReportClientType["Windows"] = "5";
})(ErrorReportClientType || (ErrorReportClientType = {}));
export const companyTeamLabel = "Tuta Team";
export var AppType;
(function (AppType) {
    /**
     * Desktop app / Web app
     */
    AppType["Integrated"] = "0";
    AppType["Mail"] = "1";
    AppType["Calendar"] = "2";
})(AppType || (AppType = {}));
//# sourceMappingURL=ClientConstants.js.map