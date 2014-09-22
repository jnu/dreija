/**
 * Blog API
 */

'use strict';

var BlogResource = {

    getPostById: function *() {
        var id = this.params.id;
        return {
            id: id,
            title: "title: " + id,
            content: "bla bla bla"
        };
    }

};

module.exports = BlogResource;