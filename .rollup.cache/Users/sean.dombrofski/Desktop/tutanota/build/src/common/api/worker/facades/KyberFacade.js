import { LazyLoaded } from "@tutao/tutanota-utils";
import { assertWorkerOrNode } from "../../common/Env.js";
import { decapsulateKyber, encapsulateKyber, generateKeyPairKyber, ML_KEM_RAND_AMOUNT_OF_ENTROPY, random, } from "@tutao/tutanota-crypto";
import { loadWasm } from "liboqs.wasm";
assertWorkerOrNode();
/**
 * WebAssembly implementation of Liboqs
 */
export class WASMKyberFacade {
    testWASM;
    constructor(testWASM) {
        this.testWASM = testWASM;
    }
    // loads liboqs WASM
    liboqs = new LazyLoaded(async () => {
        if (this.testWASM) {
            return this.testWASM;
        }
        return await loadWasm();
    });
    async generateKeypair() {
        return generateKeyPairKyber(await this.liboqs.getAsync(), random);
    }
    async encapsulate(publicKey) {
        return encapsulateKyber(await this.liboqs.getAsync(), publicKey, random);
    }
    async decapsulate(privateKey, ciphertext) {
        return decapsulateKyber(await this.liboqs.getAsync(), privateKey, ciphertext);
    }
}
/**
 * Native implementation of Liboqs
 */
export class NativeKyberFacade {
    nativeCryptoFacade;
    constructor(nativeCryptoFacade) {
        this.nativeCryptoFacade = nativeCryptoFacade;
    }
    generateKeypair() {
        return this.nativeCryptoFacade.generateKyberKeypair(random.generateRandomData(ML_KEM_RAND_AMOUNT_OF_ENTROPY));
    }
    encapsulate(publicKey) {
        return this.nativeCryptoFacade.kyberEncapsulate(publicKey, random.generateRandomData(ML_KEM_RAND_AMOUNT_OF_ENTROPY));
    }
    decapsulate(privateKey, ciphertext) {
        return this.nativeCryptoFacade.kyberDecapsulate(privateKey, ciphertext);
    }
}
//# sourceMappingURL=KyberFacade.js.map