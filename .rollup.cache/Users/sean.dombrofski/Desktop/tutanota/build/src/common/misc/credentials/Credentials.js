import { ProgrammingError } from "../../api/common/error/ProgrammingError.js";
export function credentialsToUnencrypted(credentials, databaseKey) {
    if (credentials.encryptedPassword == null) {
        throw new ProgrammingError("Credentials->UnencryptedCredentials encryptedPassword and encryptedPassphraseKey are both null!");
    }
    return {
        credentialInfo: {
            login: credentials.login,
            type: credentials.type,
            userId: credentials.userId,
        },
        encryptedPassword: credentials.encryptedPassword,
        encryptedPassphraseKey: credentials.encryptedPassphraseKey,
        accessToken: credentials.accessToken,
        databaseKey: databaseKey,
    };
}
export function unencryptedToCredentials(unencryptedCredentials) {
    return {
        login: unencryptedCredentials.credentialInfo.login,
        userId: unencryptedCredentials.credentialInfo.userId,
        type: unencryptedCredentials.credentialInfo.type,
        accessToken: unencryptedCredentials.accessToken,
        encryptedPassword: unencryptedCredentials.encryptedPassword,
        encryptedPassphraseKey: unencryptedCredentials.encryptedPassphraseKey,
    };
}
//# sourceMappingURL=Credentials.js.map