import { isApp } from "../../common/Env";
import { random, rsaDecrypt, rsaEncrypt } from "@tutao/tutanota-crypto";
import { NativeCryptoFacadeSendDispatcher } from "../../../native/common/generatedipc/NativeCryptoFacadeSendDispatcher";
export async function createRsaImplementation(native) {
    if (isApp()) {
        const { RsaApp } = await import("../../../native/worker/RsaApp");
        return new RsaApp(new NativeCryptoFacadeSendDispatcher(native), random);
    }
    else {
        return new RsaWeb();
    }
}
export class RsaWeb {
    async encrypt(publicKey, bytes) {
        const seed = random.generateRandomData(32);
        return rsaEncrypt(publicKey, bytes, seed);
    }
    async decrypt(privateKey, bytes) {
        return rsaDecrypt(privateKey, bytes);
    }
}
//# sourceMappingURL=RsaImplementation.js.map