import { default as Sqlite } from "better-sqlite3";
import { mapNullable, uint8ArrayToHex } from "@tutao/tutanota-utils";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
import { OfflineDbClosedError } from "../../api/common/error/OfflineDbClosedError.js";
import { ProgrammingError } from "../../api/common/error/ProgrammingError.js";
import { tagSqlObject, untagSqlValue } from "../../api/worker/offline/SqlValue.js";
import { Mode } from "../../api/common/Env.js";
export class DesktopSqlCipher {
    nativeBindingPath;
    dbPath;
    integrityCheck;
    _db = null;
    get db() {
        if (this._db == null) {
            throw new OfflineDbClosedError();
        }
        return this._db;
    }
    /**
     * @param nativeBindingPath the path to the sqlite native module
     * @param dbPath the path to the database file to use
     * @param integrityCheck whether to check the integrity of the db file during initialization
     */
    constructor(nativeBindingPath, dbPath, integrityCheck) {
        this.nativeBindingPath = nativeBindingPath;
        this.dbPath = dbPath;
        this.integrityCheck = integrityCheck;
        process.on("exit", () => this._db?.close());
    }
    async openDb(userId, dbKey) {
        this._db = new Sqlite(this.dbPath, {
            // Remove ts-ignore once proper definition of Options exists, see https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/59049#
            // @ts-ignore missing type
            nativeBinding: this.nativeBindingPath,
            // verbose: (message, args) => console.log("DB", message, args),
        });
        try {
            this.initSqlcipher({ databaseKey: dbKey, enableMemorySecurity: true, integrityCheck: this.integrityCheck });
        }
        catch (e) {
            // If we can't initialize the database we don't want to be stuck in a state where we hold the file lock, we need to retry the whole process again
            this.db.close();
            this._db = null;
            throw e; // "file is not a database" is most likely wrong database key
        }
    }
    async closeDb() {
        try {
            // We are performing defragmentation (incremental_vacuum) the database before closing.
            // But if it fails for some reason we don't want ot get stuck with non-closed database that we cannot delete so we close it and rethrow.
            this.db.pragma("incremental_vacuum");
        }
        finally {
            this.db.close();
            this._db = null;
        }
    }
    /**
     * not implemented because we delete the DB directly from the per-window facade
     */
    deleteDb(userId) {
        throw new ProgrammingError("Not implemented");
    }
    /**
     * Initialise sqlcipher with a database key, configuration:
     * - Sqlcipher always uses aes-256 for encryption.
     * - Sqlcipher always creates per page hmac for integrity with sha512.
     * - Sqlcipher generates a database salt value randomly and stores in the first 16 bytes of the database.
     * - We pass the database key directly to sqlcipher rather than using a password and therefore do not configure key derivation.
     * - we assume that adding entropy to entropy pool of the crypto provide (cipher_add_random) "is not necessary [...], since [openssl] does (re-)seed itself automatically using trusted system entropy sources", https://www.openssl.org/docs/man1.1.1/man3/RAND_add.html
     * @param databaseKey
     * @param enableMemorySecurity if true the the memory security option (that was default until 4.5, https://www.zetetic.net/blog/2021/10/28/sqlcipher-4.5.0-release/) to wipe memory allocated by SQLite internally, including the page cache is enabled.
     * @param integrityCheck: if true the hmac stored with each page of the database is verified to detect modification.
     * @throws if an error is detected during the integrity check
     */
    initSqlcipher({ databaseKey, enableMemorySecurity, integrityCheck, }) {
        if (env.mode === Mode.Test) {
            this.db.pragma("cipher_log_source = NONE");
        }
        if (enableMemorySecurity) {
            this.db.pragma("cipher_memory_security = ON");
        }
        const key = `x'${uint8ArrayToHex(databaseKey)}'`;
        this.db.pragma(`KEY = "${key}"`);
        // We are using the auto_vacuum=incremental mode to allow for a faster vacuum execution
        // After changing the auto_vacuum mode we need to run "vacuum" once
        // auto_vacuum mode: 0 (NONE) | 1 (FULL) | 2 (INCREMENTAL)
        if (this.db.pragma("auto_vacuum", { simple: true }) != 2) {
            this.db.pragma("auto_vacuum = incremental");
            this.db.pragma("vacuum");
        }
        if (integrityCheck) {
            this.checkIntegrity();
        }
    }
    /**
     * Execute a query
     */
    async run(query, params) {
        this.db.prepare(query).run(params.map(untagSqlValue));
    }
    /**
     * Execute a query
     * @returns a single object or undefined if the query returns nothing
     */
    async get(query, params) {
        const result = this.db.prepare(query).get(params.map(untagSqlValue)) ?? null;
        return mapNullable(result, tagSqlObject);
    }
    /**
     * Execute a query
     * @returns a list of objects or an empty list if the query returns nothing
     */
    async all(query, params) {
        const result = this.db.prepare(query).all(params.map(untagSqlValue));
        return result.map(tagSqlObject);
    }
    /**
     * not implemented because we lock the "ranges" DB directly from the per-window facade
     * we return Promise.resolve() in order to allow testing of the "clearExcludedData" function
     */
    lockRangesDbAccess(userId) {
        return Promise.resolve();
    }
    /**
     * not implemented because we unlock the "ranges" DB directly from the per-window facade
     * we return Promise.resolve() in order to allow testing of the "clearExcludedData" function
     */
    unlockRangesDbAccess(userId) {
        return Promise.resolve();
    }
    checkIntegrity() {
        /**
         * Throws a CryptoError if MAC verification fails
         */
        const errors = this.db.pragma("cipher_integrity_check");
        if (errors.length > 0) {
            throw new CryptoError(`Integrity check failed with result : ${JSON.stringify(errors)}`);
        }
    }
}
//# sourceMappingURL=DesktopSqlCipher.js.map