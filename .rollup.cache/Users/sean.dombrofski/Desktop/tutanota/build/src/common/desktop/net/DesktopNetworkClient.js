import http from "node:http";
import https from "node:https";
import { ConnectionError } from "../../api/common/error/RestError.js";
import { log } from "../DesktopLog.js";
const TAG = "[DesktopNetworkClient]";
export class DesktopNetworkClient {
    request(url, opts) {
        return this.getModule(url).request(url, opts);
    }
    /**
     * resolves when we get the first part of the response
     * rejects on errors that happen before that point
     *
     * later errors must be handled on the response onerror handler
     */
    executeRequest(url, opts, uploadStream) {
        return new Promise((resolve, reject) => {
            let resp = null;
            function onerror(e) {
                log.debug(TAG, `aborting req due to err`, e);
                if (resp != null) {
                    resp.destroy(e);
                    return;
                }
                reject(e);
            }
            const req = this.request(url, opts)
                .on("response", (r) => {
                resp = r;
                resolve(r);
            })
                .on("error", onerror)
                .on("timeout", () => {
                log.debug(TAG, "timed out req");
                req.destroy(new ConnectionError("timed out"));
            });
            if (uploadStream) {
                uploadStream.on("error", onerror).pipe(req);
            }
            else {
                req.end();
            }
        });
    }
    getModule(url) {
        if (url.protocol === "https:") {
            return https;
        }
        else {
            return http;
        }
    }
}
//# sourceMappingURL=DesktopNetworkClient.js.map