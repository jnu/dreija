/**
 * API client
 */

'use strict';

var v1 = 'v1';

var APIClientV1 = {

    getByIdUrl: function(base, id) {
        return ['', v1, base, id].join('/');
    }

};

module.exports = APIClientV1;