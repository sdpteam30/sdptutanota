import { log } from "../DesktopLog.js";
import { default as Sqlite } from "better-sqlite3";
import fs from "node:fs";
import { OfflineDbClosedError } from "../../api/common/error/OfflineDbClosedError.js";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
import { usql } from "../../api/worker/offline/Sql.js";
import { CredentialEncryptionMode } from "../../misc/credentials/CredentialEncryptionMode.js";
const TableDefinitions = Object.freeze({
    meta: "key TEXT NOT NULL, value",
    // v1: add encryptedPassphraseKey BLOB
    credentials: "login TEXT NOT NULL, userId TEXT NOT NULL, type TEXT NOT NULL, accessToken BLOB NOT NULL, databaseKey BLOB," +
        " encryptedPassword TEXT NOT NULL, PRIMARY KEY (userId), UNIQUE(login)",
    credentialEncryptionMode: "id INTEGER NOT NULL, credentialEncryptionMode TEXT NOT NULL, FOREIGN KEY(credentialEncryptionMode) REFERENCES credentialEncryptionModeEnum(mode), PRIMARY KEY (id), CHECK (id=0)",
    credentialEncryptionKey: "id INTEGER NOT NULL, credentialEncryptionKey BLOB NOT NULL, PRIMARY KEY (id), CHECK (id=0)",
});
/**
 * Sql database for storing already encrypted user credentials
 */
export class DesktopCredentialsStorage {
    dbPath;
    _db = null;
    get db() {
        if (this._db == null) {
            throw new OfflineDbClosedError();
        }
        return this._db;
    }
    _sqliteNativePath = null;
    constructor(sqliteNativePath, dbPath, app) {
        this.dbPath = dbPath;
        this._sqliteNativePath = sqliteNativePath;
        if (this._db == null) {
            this.create().then(() => {
                app.on("will-quit", () => this.closeDb());
            });
        }
    }
    async create(retry = true) {
        try {
            this.openDb();
            this.createTables();
        }
        catch (e) {
            if (!retry)
                throw e;
            log.debug("retrying to create credentials db");
            await this.deleteDb();
            return this.create(false);
        }
    }
    openDb() {
        this._db = new Sqlite(this.dbPath, {
            // Remove ts-ignore once proper definition of Options exists, see https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/59049#
            // @ts-ignore missing type
            nativeBinding: this._sqliteNativePath,
            // verbose: (message, args) => console.log("DB", message, args),
        });
        try {
            this.initSql();
        }
        catch (e) {
            // If we can't initialize the database we don't want to be stuck in a state where we hold the file lock, we need to retry the whole process again
            this.db.close();
            this._db = null;
            throw e;
        }
    }
    initSql() {
        this.db.pragma("cipher_memory_security = ON");
        const errors = this.db.pragma("cipher_integrity_check");
        if (errors.length > 0) {
            throw new CryptoError(`Integrity check failed with result : ${JSON.stringify(errors)}`);
        }
    }
    async closeDb() {
        this.db.close();
        this._db = null;
    }
    async deleteDb() {
        log.debug("deleting credentials db");
        await fs.promises.rm(this.dbPath, { maxRetries: 3, force: true });
    }
    createTables() {
        log.debug(`Creating tables...`);
        this.createEnumTable();
        for (let [name, definition] of Object.entries(TableDefinitions)) {
            this.run({ query: `CREATE TABLE IF NOT EXISTS ${name} (${definition})`, params: [] });
        }
        const version = this.get(usql `SELECT value FROM meta WHERE key = 'version'`)?.value;
        log.debug(`Current credentials version: ${version}`);
        if (version == null) {
            log.debug(`Migrating to v1`);
            this.db.transaction(() => {
                this.run({ query: `ALTER TABLE credentials ADD COLUMN encryptedPassphraseKey BLOB`, params: [] });
                this.run({ query: `INSERT INTO meta VALUES ('version', 1)`, params: [] });
            })();
        }
        log.debug(`Tables created successfully!`);
    }
    store(credentials) {
        const formattedQuery = usql `INSERT OR REPLACE INTO credentials (login, userId, type, accessToken, databaseKey, encryptedPassword, encryptedPassphraseKey) VALUES (
${credentials.credentialInfo.login}, ${credentials.credentialInfo.userId}, ${credentials.credentialInfo.type},
${credentials.accessToken}, ${credentials.databaseKey}, ${credentials.encryptedPassword}, ${credentials.encryptedPassphraseKey})`;
        return this.run(formattedQuery);
    }
    getAllCredentials() {
        const records = this.all(usql `SELECT * FROM credentials`);
        return records.map((row) => this.unmapCredentials(row));
    }
    getCredentialsByUserId(userId) {
        const row = this.get(usql `SELECT * FROM credentials WHERE userId = ${userId}`);
        if (!row)
            return null;
        return this.unmapCredentials(row);
    }
    deleteByUserId(userId) {
        return this.run(usql `DELETE FROM credentials WHERE userId = ${userId}`);
    }
    deleteAllCredentials() {
        this.run(usql `DELETE FROM credentials`);
    }
    createEnumTable() {
        this.run({ query: `CREATE TABLE IF NOT EXISTS credentialEncryptionModeEnum (mode TEXT UNIQUE)`, params: [] });
        for (let i in CredentialEncryptionMode) {
            const insertQuery = usql `INSERT OR REPLACE INTO credentialEncryptionModeEnum (mode) VALUES (${i})`;
            this.run(insertQuery);
        }
    }
    unmapCredentials(row) {
        const credentialType = row.type;
        return {
            credentialInfo: {
                login: row.login,
                userId: row.userId,
                type: credentialType,
            },
            encryptedPassword: row.encryptedPassword,
            encryptedPassphraseKey: row.encryptedPassphraseKey,
            accessToken: row.accessToken,
            databaseKey: row.databaseKey,
        };
    }
    run({ query, params }) {
        this.db.prepare(query).run(params);
    }
    /**
     * Execute a query
     * @returns a single object or undefined if the query returns nothing
     */
    get({ query, params }) {
        return this.db.prepare(query).get(params) ?? null;
    }
    /**
     * Execute a query
     * @returns a list of objects or an empty list if the query returns nothing
     */
    all({ query, params }) {
        return this.db.prepare(query).all(params);
    }
    getCredentialEncryptionMode() {
        const row = this.get(usql `SELECT credentialEncryptionMode FROM credentialEncryptionMode LIMIT 1`);
        if (!row)
            return null;
        return row.credentialEncryptionMode;
    }
    getCredentialEncryptionKey() {
        const row = this.get(usql `SELECT credentialEncryptionKey FROM credentialEncryptionKey LIMIT 1`);
        if (!row)
            return null;
        return row.credentialEncryptionKey;
    }
    setCredentialEncryptionMode(encryptionMode) {
        if (encryptionMode != null) {
            this.run(usql `INSERT OR REPLACE INTO credentialEncryptionMode (id, credentialEncryptionMode) VALUES (0, ${encryptionMode})`);
        }
        else {
            this.run(usql `DELETE FROM credentialEncryptionMode`);
        }
    }
    setCredentialEncryptionKey(encryptionKey) {
        if (encryptionKey != null) {
            this.run(usql `INSERT OR REPLACE INTO credentialEncryptionKey (id, credentialEncryptionKey) VALUES (0, ${encryptionKey})`);
        }
        else {
            this.run(usql `DELETE FROM credentialEncryptionKey`);
        }
    }
}
//# sourceMappingURL=DesktopCredentialsStorage.js.map