import { authenticatedAesDecrypt, random } from "@tutao/tutanota-crypto";
import { createEntropyData } from "../../entities/tutanota/TypeRefs.js";
import { EntropyService } from "../../entities/tutanota/Services.js";
import { noOp, ofClass } from "@tutao/tutanota-utils";
import { ConnectionError, LockedError, ServiceUnavailableError } from "../../common/error/RestError.js";
import { parseKeyVersion } from "./KeyLoaderFacade.js";
import { encryptBytes } from "../crypto/CryptoWrapper.js";
/** A class which accumulates the entropy and stores it on the server. */
export class EntropyFacade {
    userFacade;
    serviceExecutor;
    random;
    lazyKeyLoaderFacade;
    newEntropy = -1;
    lastEntropyUpdate = Date.now();
    constructor(userFacade, serviceExecutor, random, lazyKeyLoaderFacade) {
        this.userFacade = userFacade;
        this.serviceExecutor = serviceExecutor;
        this.random = random;
        this.lazyKeyLoaderFacade = lazyKeyLoaderFacade;
    }
    /**
     * Adds entropy to the randomizer. Updated the stored entropy for a user when enough entropy has been collected.
     */
    addEntropy(entropy) {
        try {
            return this.random.addEntropy(entropy);
        }
        finally {
            this.newEntropy = this.newEntropy + entropy.reduce((sum, value) => value.entropy + sum, 0);
            const now = new Date().getTime();
            if (this.newEntropy > 5000 && now - this.lastEntropyUpdate > 1000 * 60 * 5) {
                this.lastEntropyUpdate = now;
                this.newEntropy = 0;
                this.storeEntropy();
            }
        }
    }
    storeEntropy() {
        // We only store entropy to the server if we are the leader
        if (!this.userFacade.isFullyLoggedIn() || !this.userFacade.isLeader())
            return Promise.resolve();
        const userGroupKey = this.userFacade.getCurrentUserGroupKey();
        const entropyData = createEntropyData({
            userEncEntropy: encryptBytes(userGroupKey.object, this.random.generateRandomData(32)),
            userKeyVersion: userGroupKey.version.toString(),
        });
        return this.serviceExecutor
            .put(EntropyService, entropyData)
            .catch(ofClass(LockedError, noOp))
            .catch(ofClass(ConnectionError, (e) => {
            console.log("could not store entropy", e);
        }))
            .catch(ofClass(ServiceUnavailableError, (e) => {
            console.log("could not store entropy", e);
        }));
    }
    /**
     * Loads entropy from the last logout.
     */
    async loadEntropy(tutanotaProperties) {
        if (tutanotaProperties.userEncEntropy) {
            try {
                const keyLoaderFacade = this.lazyKeyLoaderFacade();
                const userGroupKey = await keyLoaderFacade.loadSymUserGroupKey(parseKeyVersion(tutanotaProperties.userKeyVersion ?? "0"));
                const entropy = authenticatedAesDecrypt(userGroupKey, tutanotaProperties.userEncEntropy);
                random.addStaticEntropy(entropy);
            }
            catch (error) {
                console.log("could not decrypt entropy", error);
            }
        }
    }
}
//# sourceMappingURL=EntropyFacade.js.map