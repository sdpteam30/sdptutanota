//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class ConnectionError extends TutanotaError {
    static CODE = 0;
    constructor(msg) {
        super("ConnectionError", msg);
    }
}
export class BadRequestError extends TutanotaError {
    static CODE = 400;
    constructor(msg) {
        super("BadRequestError", msg);
    }
}
export class NotAuthenticatedError extends TutanotaError {
    static CODE = 401;
    constructor(msg) {
        super("NotAuthenticatedError", msg);
    }
}
export class NotAuthorizedError extends TutanotaError {
    static CODE = 403;
    constructor(msg) {
        super("NotAuthorizedError", msg);
    }
}
export class NotFoundError extends TutanotaError {
    static CODE = 404;
    constructor(msg) {
        super("NotFoundError", msg);
    }
}
export class MethodNotAllowedError extends TutanotaError {
    static CODE = 405;
    constructor(msg) {
        super("MethodNotAllowedError", msg);
    }
}
export class RequestTimeoutError extends TutanotaError {
    static CODE = 408;
    constructor(msg) {
        super("RequestTimeoutError", msg);
    }
}
export class PreconditionFailedError extends TutanotaError {
    static CODE = 412;
    // data field is respected by the WorkerProtocol. Other fields might not be passed
    data;
    constructor(msg, reason) {
        super("PreconditionFailedError", msg);
        this.data = reason;
    }
}
export class LockedError extends TutanotaError {
    static CODE = 423;
    constructor(msg) {
        super("LockedError", msg);
    }
}
export class TooManyRequestsError extends TutanotaError {
    static CODE = 429;
    constructor(msg) {
        super("TooManyRequestsError", msg);
    }
}
export class SessionExpiredError extends TutanotaError {
    static CODE = 440;
    constructor(msg) {
        super("SessionExpiredError", msg);
    }
}
export class AccessDeactivatedError extends TutanotaError {
    static CODE = 470;
    constructor(msg) {
        super("AccessDeactivatedError", msg);
    }
}
/** External users only, related to password changes. */
export class AccessExpiredError extends TutanotaError {
    static CODE = 471;
    constructor(msg) {
        super("AccessExpiredError", msg);
    }
}
export class AccessBlockedError extends TutanotaError {
    static CODE = 472;
    constructor(msg) {
        super("AccessBlockedError", msg);
    }
}
export class InvalidDataError extends TutanotaError {
    static CODE = 473;
    constructor(msg) {
        super("InvalidDataError", msg);
    }
}
export class InvalidSoftwareVersionError extends TutanotaError {
    static CODE = 474;
    constructor(msg) {
        super("InvalidSoftwareVersionError", msg);
    }
}
export class LimitReachedError extends TutanotaError {
    static CODE = 475;
    constructor(msg) {
        super("LimitReachedError", msg);
    }
}
export class InternalServerError extends TutanotaError {
    static CODE = 500;
    constructor(msg) {
        super("InternalServerError", msg);
    }
}
export class BadGatewayError extends TutanotaError {
    static CODE = 502;
    constructor(msg) {
        super("BadGatewayError", msg);
    }
}
export class ServiceUnavailableError extends TutanotaError {
    static CODE = 503;
    constructor(msg) {
        super("ServiceUnavailableError", msg);
    }
}
export class InsufficientStorageError extends TutanotaError {
    static CODE = 507;
    constructor(msg) {
        super("InsufficientStorageError", msg);
    }
}
export class ResourceError extends TutanotaError {
    constructor(msg) {
        super("ResourceError", msg);
    }
}
export class PayloadTooLargeError extends TutanotaError {
    static CODE = 413;
    constructor(msg) {
        super("PayloadTooLargeError", msg);
    }
}
/**
 * Attention: When adding an Error also add it in WorkerProtocol.ErrorNameToType.
 */
export function handleRestError(errorCode, path, errorId, precondition) {
    let message = `${errorCode}: ${errorId ? errorId + " " : ""}${precondition ? precondition + " " : ""}${path}`;
    switch (errorCode) {
        case ConnectionError.CODE:
            return new ConnectionError(message);
        case BadRequestError.CODE:
            return new BadRequestError(message);
        case NotAuthenticatedError.CODE:
            return new NotAuthenticatedError(message);
        case NotAuthorizedError.CODE:
            return new NotAuthorizedError(message);
        case NotFoundError.CODE:
            return new NotFoundError(message);
        case MethodNotAllowedError.CODE:
            return new MethodNotAllowedError(message);
        case PreconditionFailedError.CODE:
            return new PreconditionFailedError(message, precondition ?? null);
        case LockedError.CODE:
            return new LockedError(message);
        case TooManyRequestsError.CODE:
            return new TooManyRequestsError(message);
        case SessionExpiredError.CODE:
            return new SessionExpiredError(message);
        case AccessDeactivatedError.CODE:
            return new AccessDeactivatedError(message);
        case AccessExpiredError.CODE:
            return new AccessExpiredError(message);
        case AccessBlockedError.CODE:
            return new AccessBlockedError(message);
        case InvalidDataError.CODE:
            return new InvalidDataError(message);
        case InvalidSoftwareVersionError.CODE:
            return new InvalidSoftwareVersionError(message);
        case LimitReachedError.CODE:
            return new LimitReachedError(message);
        case InternalServerError.CODE:
            return new InternalServerError(message);
        case BadGatewayError.CODE:
            return new BadGatewayError(message);
        case ServiceUnavailableError.CODE:
            return new ServiceUnavailableError(message);
        case InsufficientStorageError.CODE:
            return new InsufficientStorageError(message);
        case PayloadTooLargeError.CODE:
            return new PayloadTooLargeError(message);
        case RequestTimeoutError.CODE:
            return new RequestTimeoutError(message);
        default:
            return new ResourceError(message);
    }
}
//# sourceMappingURL=RestError.js.map