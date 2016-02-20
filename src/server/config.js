/**
 * DB Host name. Set this with an environment variable to point to couch
 * running somewhere other than localhost. E.g. use docker-machine ip default
 * for Couch running in a container through toolbox on OSX.
 * @constant {string}
 */
export const DBHOSTNAME = process.env.DBHOSTNAME || 'localhost';

/**
 * CouchDB root. Uses the DBHOSTNAME env variable.
 */
export const DB_HOST = `http://${DBHOSTNAME}:5984`;

/**
 * CouchDB database id
 */
export const DB_NAME = 'joenoodles';
