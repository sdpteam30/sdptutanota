/* generated file, don't edit. */
export class NativeCryptoFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async rsaEncrypt(...args) {
        return this.transport.invokeNative("ipc", ["NativeCryptoFacade", "rsaEncrypt", ...args]);
    }
    async rsaDecrypt(...args) {
        return this.transport.invokeNative("ipc", ["NativeCryptoFacade", "rsaDecrypt", ...args]);
    }
    async aesEncryptFile(...args) {
        return this.transport.invokeNative("ipc", ["NativeCryptoFacade", "aesEncryptFile", ...args]);
    }
    async aesDecryptFile(...args) {
        return this.transport.invokeNative("ipc", ["NativeCryptoFacade", "aesDecryptFile", ...args]);
    }
    async argon2idGeneratePassphraseKey(...args) {
        return this.transport.invokeNative("ipc", ["NativeCryptoFacade", "argon2idGeneratePassphraseKey", ...args]);
    }
    async generateKyberKeypair(...args) {
        return this.transport.invokeNative("ipc", ["NativeCryptoFacade", "generateKyberKeypair", ...args]);
    }
    async kyberEncapsulate(...args) {
        return this.transport.invokeNative("ipc", ["NativeCryptoFacade", "kyberEncapsulate", ...args]);
    }
    async kyberDecapsulate(...args) {
        return this.transport.invokeNative("ipc", ["NativeCryptoFacade", "kyberDecapsulate", ...args]);
    }
}
//# sourceMappingURL=NativeCryptoFacadeSendDispatcher.js.map