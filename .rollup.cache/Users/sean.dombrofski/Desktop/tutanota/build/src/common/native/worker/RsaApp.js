export class RsaApp {
    nativeCryptoFacade;
    rng;
    constructor(nativeCryptoFacade, rng) {
        this.nativeCryptoFacade = nativeCryptoFacade;
        this.rng = rng;
    }
    /**
     * Encrypt bytes with the provided publicKey
     */
    async encrypt(publicKey, bytes) {
        const seed = this.rng.generateRandomData(32);
        return await this.nativeCryptoFacade.rsaEncrypt(publicKey, bytes, seed);
    }
    /**
     * Decrypt bytes with the provided privateKey
     */
    async decrypt(privateKey, bytes) {
        return await this.nativeCryptoFacade.rsaDecrypt(privateKey, bytes);
    }
}
//# sourceMappingURL=RsaApp.js.map