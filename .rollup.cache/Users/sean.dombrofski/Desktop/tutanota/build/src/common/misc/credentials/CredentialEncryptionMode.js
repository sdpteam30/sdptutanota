/**
 * Enum that describes the different methods for encrypting the intermediate key used for credentials encryption.
 */
export var CredentialEncryptionMode;
(function (CredentialEncryptionMode) {
    /**
     * Credentials key can be decrypted without user interaction if the device is in an unlocked state.
     */
    CredentialEncryptionMode["DEVICE_LOCK"] = "DEVICE_LOCK";
    /**
     * Credentials key can only be decrypted after authenticating using the system password/device pin.
     * Depending on the platform authenticating using system password will keep the user authenticated for
     * a certain period of time, i.e. the user might NOT have to enter the system password each time.
     */
    CredentialEncryptionMode["SYSTEM_PASSWORD"] = "SYSTEM_PASSWORD";
    /**
     * Credentials key can only be decrypted using biometric evidence. Depending on the device, there might be
     * a fallback option to use the system password/device pin as an alternative. In contrast to SYSTEM_PASSWORD
     * mode every access to the credentials key must be individually authenticated - even when using the fallback.
     */
    CredentialEncryptionMode["BIOMETRICS"] = "BIOMETRICS";
    /**
     * Credentials key is secured with a separate password / pin that is independent of the state of the system
     * keychain.
     */
    CredentialEncryptionMode["APP_PASSWORD"] = "APP_PASSWORD";
})(CredentialEncryptionMode || (CredentialEncryptionMode = {}));
//# sourceMappingURL=CredentialEncryptionMode.js.map