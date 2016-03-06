import btoa from 'btoa';
import utf8 from 'utf8';

/**
 * Create an HTML-embeddable string representation of an object
 * @param  {Object} obj - implements #toJSON
 * @return {string} Base-64 encoded embeddable string
 */
export default function encodeObject(obj) {
    const str = JSON.stringify(obj);
    const sanitizedStr = utf8.encode(str);
    // Base-64 encode to avoid parsing mistakes from "</script>" etc.
    return btoa(sanitizedStr);
}

