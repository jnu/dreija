import logger from '../../lib/logger';
import UglifyJS from 'uglify-js';
import nano from 'nano';


/**
 * Key in Redis where auth cookie stored.
 * @constant {String}
 */
const DB_AUTH_KEY = 'auth:couchdb:session';

/**
 * Couch session expiration
 * @constant {Number}
 */
const COUCH_EXPIRE_S = 1 * 60 * 9.5;

/**
 * Get a deterministic string representation of a function in an acceptable
 * format for CouchDB's design doc views.
 * @param  {Function} fn
 * @return {String}
 */
function compileFunction(fn) {
    const str = fn.toString();

    // Wrap function as IIFE so Uglify can still compile anonymous functions.
    const wrapped = `!${str}();`;
    const compiled = UglifyJS.minify(wrapped, { fromString: true  }).code;

    // Remove the `!...();` IIFE wrapper
    return compiled.substr(1, compiled.length - 4);
}


/**
 * Wrap callback-taking method as a Promise-based method.
 * @param  {Function} method - function to call
 * @param  {Any[]}  args - args to pass to method, excluding last callback arg.
 * @param  {Any} ctx - context in which to invoke function
 * @return {Promise<any>}
 */
function promisify(method, args = [], ctx = null) {
    if (!method) {
        logger.error(`Cannot promisify method`);
        throw new Error('failed to promisify');
    }

    return new Promise((resolve, reject) => {
        const callback = (e, v) => e ? reject(e) : resolve(v);
        method.apply(ctx, [...args, callback]);
    });
}


/**
 * Maintain authenticated connection to a CouchDB database.
 */
export default class CouchClient {

    constructor({
        redisClient,
        host,
        port,
        user,
        password,
        name
    }) {
        this.redisClient = redisClient;
        this.conn = nano(`http://${host}:${port}`);
        this.user = user;
        this.pass = password;
        this.name = name;
    }

    /**
     * Update Redis with new auth cookie from headers if there is any
     * @param  {Object} headers - headers returned from Couch request
     * @return {Promise<void>}
     */
    maybeUpdateDbAuthCookie(headers) {
        const { redisClient } = this;

        return new Promise((resolve, reject) => {
            if (headers && headers['set-cookie']) {
                const cookies = headers['set-cookie'];
                const cookie = cookies[0];
                promisify(
                        redisClient.set,
                        [DB_AUTH_KEY, cookie],
                        redisClient
                    )
                    .then(promisify(
                        redisClient.expire,
                        [DB_AUTH_KEY, COUCH_EXPIRE_S],
                        redisClient
                    ))
                    .then(() => resolve(cookie), reject);
            } else {
                reject(new Error('failed to get cookie'));
            }
        });
    }

    /**
     * Create a new DB session
     * @return {Promise<void>}
     */
    createDbSession() {
        const { conn, user, pass } = this;
        logger.info('Authenticating with DB ...');

        return new Promise((resolve, reject) => {
            conn.auth(user, pass, (err, body, headers) => {
                if (err) {
                    logger.error('Could not authenticate with DB!');
                    return reject(err);
                }

                logger.info('Connected to DB.');
                this.maybeUpdateDbAuthCookie(headers).then(resolve, reject);
            });
        });
    }

    /**
     * Get existing auth cookie from Redis
     * @return {Promise<String>}
     */
    getExistingSession() {
        const { redisClient } = this;
        return new Promise((resolve, reject) => {
            redisClient.get(DB_AUTH_KEY, (err, cookie) => {
                if (err) {
                    logger.info('Failed connecting to Redis for auth session', err);
                    return reject(err);
                }

                // Resolve as successful if cookie exists. This might not be
                // a current session with Couch though.
                if (cookie) {
                    resolve(cookie);
                } else {
                    reject();
                }
            });
        });
    }

    /**
     * Validate an auth cookie.
     * @param  {String} cookie
     * @return {Promise<String>} resolves with the cookie, or rejects if not valid
     */
    validateExistingSession(cookie) {
        const { conn } = this;
        return new Promise((resolve, reject) => {
            conn.config.cookie = cookie;
            conn.session((err, session) => {
                if (err || !session) {
                    logger.error('Error validating couch session');
                    return reject(err);
                }

                if (!session.ok) {
                    logger.error('Couch session is not ok');
                    return reject(new Error('invalid session'));
                }

                const { name } = session.userCtx;
                if (!name || name !== this.user) {
                    logger.error(`Invalid session context: ${name}`);
                    return reject(new Error('bad session context'));
                }

                resolve(cookie);
            });
        });
    }

    /**
     * Get an authenticated Couch session.
     * @return {Promise<void>}
     */
    getCouchSession() {
        const { conn, name } = this;
        return this.getExistingSession()
            .then(cookie => this.validateExistingSession(cookie))
            .catch(err => {
                logger.warn('Error using current session:', err);
                logger.info('Trying to establish new session ...');
                return this.createDbSession();
            })
            .then(cookie => {
                logger.info('Authenticated.');
                conn.config.cookie = cookie;
            });
    }

    /**
     * Instrument views for a database.
     * @param  {String} designDoc - Name of design doc
     * @param  {Views} views - view definitions for this design doc
     * @return {Promise<void>}
     */
    createViews(designDoc, views) {
        const { conn } = this;
        return promisify(conn.insert, [views, `_design/${designDoc}`], conn);
    }

    /**
     * Compile an object containing views. Functions in this view will be
     * compiled into formats that are acceptable.
     * @param  {{ [key: string]: CouchView}} views
     * @return {{ [key: string]: CouchView }}
     */
    compileViews(views) {
        const compiled = {};
        Object.keys(views).forEach(viewKey => {
            const viewSpec = views[viewKey];
            const compiledSpec = compiled[viewKey] = {};
            Object.keys(viewSpec).forEach(specKey => {
                const specVal = viewSpec[specKey];
                compiledSpec[specKey] = (typeof specVal === 'function') ?
                    compileFunction(specVal) :
                    specVal;
            });
        });
        return compiled;
    }

    /**
     * Write views to given design doc. If the design doc exists, this will
     * replace existing views; otherwise, a new design doc will be created.
     * @param  {String} designDoc - name of design doc
     * @param  {{ [key: string]: CouchView }} views - Hash of couch views
     * @return {Promise<Document>}
     */
    ensureViews(designDoc, views = {}) {
        const docId = `_design/${designDoc}`;
        const compiledViews = this.compileViews(views);

        return this.get(docId)
            .then(doc => ({ ...doc, views: compiledViews }))
            .catch(() => ({ views: compiledViews }))
            .then(doc => this.put(doc));
    }

    /**
     * Get info about the DB with the given name.
     * @return {Promise<CouchDB>} DB descriptor
     */
    getDb() {
        const { conn, name } = this;
        return promisify(conn.db.get, [name], conn.db);
    }

    /**
     * Construct a database with the given name.
     * @return {Promise<Nano>} Connection to new database
     */
    createDb() {
        const { name, conn } = this;
        return promisify(conn.db.create, [name], conn.db)
            .then(() => {
                this.conn = conn.use(name);
                return this.conn;
            });
    }

    /**
     * Make sure that a CouchDB is instrumented with the given name.
     * @return {Promise<CouchDB>} database descriptor
     */
    ensureCouchDb() {
        logger.info(`Checking database ${this.name} (might take a minute) ...`);
        return this.getCouchSession()
            .then(() => this.getDb())
            .catch(e => {
                if (e.statusCode === 404) {
                    logger.warn(`DB ${this.name} does not exist. Instrumenting ...`);
                    return this.createDb();
                }

                logger.error(`Error checking DB existence :(`);
                throw e;
            })
            // Get DB again to make sure it was properly created
            // TODO- also check views and merge new ones with existing!
            .then(() => this.getDb())
            .then(db => {
                logger.info(`Using DB: ${db.db_name}`, db);
                this.conn = this.conn.use(db.db_name);
                return db;
            });
    }

    /**
     * Wrappers for operating on DB
     */

    /**
     * Get a Document from the database by ID. Optionally pass some other params.
     * @param  {String} id
     * @param  {Object?} params - Nano request params
     * @return {Promise<Document?>}
     */
    get(id, params = {}) {
        const { conn } = this;
        return promisify(conn.get, [id, params], conn);
    }

    /**
     * Get all Documents, optionally matching criteria, from view.
     * @param  {String} designDoc
     * @param  {String} view
     * @param  {String[]?} keys - optional keys to filter / sort by
     * @return {Promise<Document[]>}
     */
    getAllFromView(designDoc, view, keys = null) {
        const { conn } = this;
        const params = keys ? { keys } : {};
        return promisify(conn.view, [designDoc, view, params], conn)
            .then(results => results ? (results.rows || []) : [])
            .then(results => results.map(result => ({
                id: result.id,
                ...result.value
            })));
    }

    /**
     * Get a single Document from the given view, searching by the given keys.
     * Only returns first Document if there are multiple matches.
     * @param  {String} view
     * @param  {String[]?} keys - optional keys to filter / sort by
     * @return {Promise<Document?>}
     */
    getOneFromView(view, keys) {
        return this.getAllFromView(view, keys).then(results => results[0]);
    }

    /**
     * Create or update a document.
     *
     * !!!NOTE!!! This operates with an admin session!
     *
     * @param  {Document} doc - include _id and _rev fields for update
     * @return {Promise<Document>}
     */
    put(doc) {
        const { conn } = this;
        return this.getCouchSession()
            .then(() => promisify(conn.insert, [doc], conn));
    }

    /**
     * Ping CouchDB, returning true or false depending on result.
     * @return {Promise<boolean>}
     */
    ping() {
        const { conn } = this;
        return promisify(conn.dinosaur, [], conn)
            .then(resp => resp.couchdb === 'Welcome')
            .catch(e => {
                logger.error(`Error pinging CouchDB`, e);
                return false;
            });
    }


}
