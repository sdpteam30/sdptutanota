import { generateKeyFromPassphraseArgon2id, uint8ArrayToBitArray } from "@tutao/tutanota-crypto";
import { LazyLoaded } from "@tutao/tutanota-utils";
import { assertWorkerOrNode } from "../../common/Env.js";
import { loadWasm } from "argon2.wasm";
assertWorkerOrNode();
/**
 * WebAssembly implementation of Argon2id
 */
export class WASMArgon2idFacade {
    // loads argon2 WASM
    argon2 = new LazyLoaded(async () => {
        return await loadWasm();
    });
    async generateKeyFromPassphrase(passphrase, salt) {
        return generateKeyFromPassphraseArgon2id(await this.argon2.getAsync(), passphrase, salt);
    }
}
/**
 * Native implementation of Argon2id
 */
export class NativeArgon2idFacade {
    nativeCryptoFacade;
    constructor(nativeCryptoFacade) {
        this.nativeCryptoFacade = nativeCryptoFacade;
    }
    async generateKeyFromPassphrase(passphrase, salt) {
        const hash = await this.nativeCryptoFacade.argon2idGeneratePassphraseKey(passphrase, salt);
        return uint8ArrayToBitArray(hash);
    }
}
//# sourceMappingURL=Argon2idFacade.js.map