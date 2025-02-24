/** @file Types from Credential Management API. */
/** see https://www.iana.org/assignments/cose/cose.xhtml#algorithms */
export var COSEAlgorithmIdentifier;
(function (COSEAlgorithmIdentifier) {
    COSEAlgorithmIdentifier[COSEAlgorithmIdentifier["ES256"] = -7] = "ES256";
    COSEAlgorithmIdentifier[COSEAlgorithmIdentifier["ES384"] = -35] = "ES384";
    COSEAlgorithmIdentifier[COSEAlgorithmIdentifier["ES512"] = -36] = "ES512";
    COSEAlgorithmIdentifier[COSEAlgorithmIdentifier["EdDSA"] = -8] = "EdDSA";
})(COSEAlgorithmIdentifier || (COSEAlgorithmIdentifier = {}));
//# sourceMappingURL=WebauthnTypes.js.map