//@bundleInto:common-min
import { errorToString, stringToUtf8Uint8Array } from "@tutao/tutanota-utils";
export const LOG_SIZE = 1000;
export class Logger {
    // Circular buffer with next writable position pointed by _index
    _entries;
    _index;
    _dateProvider;
    constructor(dateProvider = () => new Date()) {
        this._entries = new Array(LOG_SIZE);
        this._index = 0;
        this._dateProvider = dateProvider;
    }
    logInfo(...args) {
        this.log("I", args);
    }
    logError(...args) {
        this.log("E", args);
    }
    logWarn(...args) {
        this.log("W", args);
    }
    log(level, args) {
        const entry = [this._dateProvider(), level];
        entry.push(...args);
        this._entries[this._index] = entry;
        this._index++;
        if (this._index === LOG_SIZE) {
            this._index = 0;
        }
    }
    formatLogEntry(date, level, ...rest) {
        const formattedArgs = rest.map((obj) => {
            try {
                return obj instanceof Error ? errorToString(Object.assign({ stack: null }, obj)) : JSON.stringify(obj);
            }
            catch (e) {
                return "[cyclic object]";
            }
        });
        const message = formattedArgs.join(",");
        return `${date.toISOString()} ${level} ${message}`;
    }
    getEntries() {
        const newerPart = this._entries.slice(0, this._index);
        const olderPart = this._entries.slice(this._index);
        return olderPart
            .concat(newerPart)
            .filter(Boolean)
            .map(([date, level, ...rest]) => {
            return this.formatLogEntry(date, level, ...rest);
        });
    }
}
export function createLogFile(content, scope, timestamp) {
    const data = stringToUtf8Uint8Array(content);
    const timestampString = timestamp ? timestamp + "_" : "";
    return {
        _type: "DataFile",
        name: timestampString + scope + "_tutanota.log",
        mimeType: "text/plain",
        data,
        size: data.byteLength,
        id: undefined,
    };
}
export function replaceNativeLogger(global, loggerInstance, force = false) {
    // Replace native logger only when enabled because we lose line numbers
    if (force || global.env.dist || global.debug) {
        global.logger = loggerInstance;
        const globalConsole = global.console;
        global.console = {
            log(...args) {
                globalConsole.log(...args);
                loggerInstance.logInfo(...args);
            },
            warn(...args) {
                globalConsole.warn(...args);
                loggerInstance.logWarn(...args);
            },
            error(...args) {
                globalConsole.error(...args);
                loggerInstance.logError(...args);
            },
            trace(...args) {
                globalConsole.trace(...args);
            },
            info(...args) {
                globalConsole.info(...args);
            },
        };
    }
}
//# sourceMappingURL=Logger.js.map