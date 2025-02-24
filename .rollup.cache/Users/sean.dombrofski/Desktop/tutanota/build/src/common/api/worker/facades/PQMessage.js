import { byteArraysToBytes, bytesToByteArrays } from "@tutao/tutanota-utils/dist/Encoding.js";
export function decodePQMessage(encoded) {
    const pqMessageParts = bytesToByteArrays(encoded, 4);
    return {
        senderIdentityPubKey: pqMessageParts[0],
        ephemeralPubKey: pqMessageParts[1],
        encapsulation: {
            kyberCipherText: pqMessageParts[2],
            kekEncBucketKey: pqMessageParts[3],
        },
    };
}
export function encodePQMessage({ senderIdentityPubKey, ephemeralPubKey, encapsulation }) {
    return byteArraysToBytes([senderIdentityPubKey, ephemeralPubKey, encapsulation.kyberCipherText, encapsulation.kekEncBucketKey]);
}
//# sourceMappingURL=PQMessage.js.map