import { assert } from "@tutao/tutanota-utils";
import { CredentialEncryptionMode } from "../../misc/credentials/CredentialEncryptionMode.js";
/** the single source of truth for this configuration */
export const SUPPORTED_MODES = Object.freeze([CredentialEncryptionMode.DEVICE_LOCK, CredentialEncryptionMode.APP_PASSWORD]);
export function assertSupportedEncryptionMode(encryptionMode) {
    assert(SUPPORTED_MODES.includes(encryptionMode), `should not use unsupported encryption mode ${encryptionMode}`);
}
export function assertDesktopEncryptionMode(encryptionMode) {
    assertSupportedEncryptionMode(encryptionMode);
}
//# sourceMappingURL=CredentialCommons.js.map