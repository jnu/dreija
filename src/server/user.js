import logger from '../../lib/logger';


/**
 * Auth key/ID pairs. These key/IDs should correspond to the keys used to index
 * the users view. See the CouchDB views for more info.
 * @typedef OAuthParams
 * @property {String?} googleId - Google OAuth ID
 * @property {String?} id - Local app ID
 */


export default class User {

    constructor({ couchClient, design }) {
        this.couchClient = couchClient;
        this.design = design;
    }

    /**
     * Find a user given the local app user ID.
     * @param  {String} id - ID of the user profile in the Couch database (this
     *                       should not be an OAuth ID).
     * @return {Promise<User>}
     */
    findById(id) {
        logger.info('Finding user', id);
        return this.couchClient.get(id);
    }

    /**
     * Build users sort keys from search params. The keys in these params
     * should correspond to the OAuth keys that are used to index the users
     * view. See `./views` for more info.
     * @param  {OAuthParams} params
     * @return {String[]}
     */
    buildKeysFromParams(params = {}) {
        if (!params) {
            throw new Error(`Can't find user with no params given`);
        }

        const paramKeys = Object.keys(params);
        const keys = new Array(paramKeys.length);

        for (let i = 0; i < paramKeys.length; i++) {
            let key = paramKeys[i];
            let val = params[key];
            keys[i] = (key === 'id') ? val : `${key}-${val}`;
        }

        return keys;
    }

    /**
     * Find User given OAuth ID keys, creating if it doesn't exist.
     * @param  {OAuthParams} params
     * @return {Promise<User>}
     */
    findOrCreate(params) {
        const filterKeys = this.buildKeysFromParams(params);
        return this.couchClient
            .getOneFromView(this.design, 'users', filterKeys)
            .then(user => {
                if (user) {
                    logger.info(`Found user: ${user.id}`);
                    return user;
                }

                logger.warn(`User does not exist yet matching params ${JSON.stringify(filterKeys)}. Creating!`);
                return this.create(params);
            })
            .catch(e => {
                logger.error('Error finding / creating user', e);
                throw e;
            });
    }

    /**
     * Create a user given OAuth ID param(s).
     * @param  {OAuthParams} params
     * @return {Promise<User>}
     */
    create(params) {
        return this.couchClient.put({
            type: 'user',
            roles: [],
            ...params
        });
    }

};
