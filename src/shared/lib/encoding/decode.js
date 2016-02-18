/* eslint-env browser */
import utf8 from 'utf8';

/**
 * Decode an object (on the client; assumes atob is available).
 * @param  {string} encoded - @see ./encode
 * @return {Object}
 */
export default function decodeObject(encoded) {
    return JSON.parse(utf8.decode(atob(encoded)));
}
