/* generated file, don't edit. */
export class NativeCryptoFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "rsaEncrypt": {
                const publicKey = arg[0];
                const data = arg[1];
                const seed = arg[2];
                return this.facade.rsaEncrypt(publicKey, data, seed);
            }
            case "rsaDecrypt": {
                const privateKey = arg[0];
                const data = arg[1];
                return this.facade.rsaDecrypt(privateKey, data);
            }
            case "aesEncryptFile": {
                const key = arg[0];
                const fileUri = arg[1];
                const iv = arg[2];
                return this.facade.aesEncryptFile(key, fileUri, iv);
            }
            case "aesDecryptFile": {
                const key = arg[0];
                const fileUri = arg[1];
                return this.facade.aesDecryptFile(key, fileUri);
            }
            case "argon2idGeneratePassphraseKey": {
                const passphrase = arg[0];
                const salt = arg[1];
                return this.facade.argon2idGeneratePassphraseKey(passphrase, salt);
            }
            case "generateKyberKeypair": {
                const seed = arg[0];
                return this.facade.generateKyberKeypair(seed);
            }
            case "kyberEncapsulate": {
                const publicKey = arg[0];
                const seed = arg[1];
                return this.facade.kyberEncapsulate(publicKey, seed);
            }
            case "kyberDecapsulate": {
                const privateKey = arg[0];
                const ciphertext = arg[1];
                return this.facade.kyberDecapsulate(privateKey, ciphertext);
            }
        }
    }
}
//# sourceMappingURL=NativeCryptoFacadeReceiveDispatcher.js.map