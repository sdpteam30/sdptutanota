import { errorToObj, MessageDispatcher, Request } from "../../../common/api/common/threading/MessageDispatcher.js";
import { NotAuthenticatedError } from "../../../common/api/common/error/RestError.js";
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError.js";
import { initLocator, locator, resetLocator } from "./WorkerLocator.js";
import { assertWorkerOrNode, isMainOrNode } from "../../../common/api/common/Env.js";
import { exposeLocalDelayed, exposeRemote } from "../../../common/api/common/WorkerProxy.js";
import { random } from "@tutao/tutanota-crypto";
import { WebWorkerTransport } from "../../../common/api/common/threading/Transport.js";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
assertWorkerOrNode();
export class WorkerImpl {
    _scope;
    _dispatcher;
    constructor(self) {
        this._scope = self;
        this._dispatcher = new MessageDispatcher(new WebWorkerTransport(this._scope), this.queueCommands(this.exposedInterface), "worker-main");
    }
    async init(browserData) {
        // import("tuta-sdk").then(async (module) => {
        // 	// await module.default("wasm/tutasdk.wasm")
        // 	const entityClient = new module.EntityClient()
        // 	const typeRef = new module.TypeRef("tutanota", "Mail")
        // 	console.log("result from rust: ", awai t entityClient.load_element(typeRef, "myId"))
        // 	typeRef.free()
        // 	entityClient.free()
        // })
        await initLocator(this, browserData);
        const workerScope = this._scope;
        // only register oncaught error handler if we are in the *real* worker scope
        // Otherwise uncaught error handler might end up in an infinite loop for test cases.
        if (workerScope && !isMainOrNode()) {
            workerScope.addEventListener("unhandledrejection", (event) => {
                this.sendError(event.reason);
            });
            // @ts-ignore
            workerScope.onerror = (e, source, lineno, colno, error) => {
                console.error("workerImpl.onerror", e, source, lineno, colno, error);
                if (error instanceof Error) {
                    this.sendError(error);
                }
                else {
                    // @ts-ignore
                    const err = new Error(e);
                    // @ts-ignore
                    err.lineNumber = lineno;
                    // @ts-ignore
                    err.columnNumber = colno;
                    // @ts-ignore
                    err.fileName = source;
                    this.sendError(err);
                }
                return true;
            };
        }
    }
    get exposedInterface() {
        return {
            async loginFacade() {
                return locator.login;
            },
            async customerFacade() {
                return locator.customer();
            },
            async giftCardFacade() {
                return locator.giftCards();
            },
            async groupManagementFacade() {
                return locator.groupManagement();
            },
            async configFacade() {
                return locator.configFacade();
            },
            async calendarFacade() {
                return locator.calendar();
            },
            async mailFacade() {
                return locator.mail();
            },
            async shareFacade() {
                return locator.share();
            },
            async cacheManagementFacade() {
                return locator.cacheManagement();
            },
            async counterFacade() {
                return locator.counters();
            },
            async indexerFacade() {
                return locator.indexer();
            },
            async searchFacade() {
                return locator.search();
            },
            async bookingFacade() {
                return locator.booking();
            },
            async mailAddressFacade() {
                return locator.mailAddress();
            },
            async blobAccessTokenFacade() {
                return locator.blobAccessToken;
            },
            async blobFacade() {
                return locator.blob();
            },
            async userManagementFacade() {
                return locator.userManagement();
            },
            async recoverCodeFacade() {
                return locator.recoverCode();
            },
            async restInterface() {
                return locator.cache;
            },
            async serviceExecutor() {
                return locator.serviceExecutor;
            },
            async cryptoWrapper() {
                return locator.cryptoWrapper;
            },
            async publicKeyProvider() {
                return locator.publicKeyProvider;
            },
            async asymmetricCryptoFacade() {
                return locator.asymmetricCrypto;
            },
            async cryptoFacade() {
                return locator.crypto;
            },
            async cacheStorage() {
                return locator.cacheStorage;
            },
            async sqlCipherFacade() {
                return locator.sqlCipherFacade;
            },
            async random() {
                return {
                    async generateRandomNumber(nbrOfBytes) {
                        return random.generateRandomNumber(nbrOfBytes);
                    },
                };
            },
            async eventBus() {
                return locator.eventBusClient;
            },
            async entropyFacade() {
                return locator.entropyFacade;
            },
            async workerFacade() {
                return locator.workerFacade;
            },
            async contactFacade() {
                return locator.contactFacade();
            },
            async bulkMailLoader() {
                return locator.bulkMailLoader();
            },
            async mailExportFacade() {
                return locator.mailExportFacade();
            },
        };
    }
    queueCommands(exposedWorker) {
        return {
            setup: async (message) => {
                console.error("WorkerImpl: setup was called after bootstrap! message: ", message);
            },
            testEcho: (message) => Promise.resolve({
                msg: ">>> " + message.args[0].msg,
            }),
            testError: (message) => {
                const errorTypes = {
                    ProgrammingError,
                    CryptoError,
                    NotAuthenticatedError,
                };
                // @ts-ignore
                let ErrorType = errorTypes[message.args[0].errorType];
                return Promise.reject(new ErrorType(`wtf: ${message.args[0].errorType}`));
            },
            reset: (message) => {
                return resetLocator();
            },
            restRequest: (message) => {
                // This horror is to add auth headers to the admin client
                const args = message.args;
                let [path, method, options] = args;
                options = options ?? {};
                options.headers = { ...locator.user.createAuthHeaders(), ...options.headers };
                return locator.restClient.request(path, method, options);
            },
            facade: exposeLocalDelayed(exposedWorker),
        };
    }
    invokeNative(requestType, args) {
        return this._dispatcher.postRequest(new Request("execNative", [requestType, args]));
    }
    getMainInterface() {
        return exposeRemote((request) => this._dispatcher.postRequest(request));
    }
    sendError(e) {
        return this._dispatcher.postRequest(new Request("error", [errorToObj(e)]));
    }
}
//# sourceMappingURL=WorkerImpl.js.map