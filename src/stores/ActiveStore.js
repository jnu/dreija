/**
 * Posts Store
 */

'use strict';

var _ = require('underscore');
var ajax = require('../util/ajax');
var Store = require('./Store');
var APIClient = require('../util/APIClient');

function fetchRemote(path, cb) {
    ajax.get(path, {
        json: true,
        success: cb,
        error: function() {
            // ?
        }
    });
}

function ActiveStore() {
    Store.apply(this, arguments);
}

// Static methods
_.extend(ActiveStore, {

    create: function(name, endpoint) {
        return _.extend(new ActiveStore(), {
            getURL: APIClient.getByIdUrl.bind(null, endpoint),
            name: name
        });

    }

});

// Prototype methods

_.extend(ActiveStore.prototype, Store.prototype, {

    getURL: function() {
        if (DEBUG) {
            console.warn(
                "ActiveStore instance called without a #getURL implementation"
            );
        }
    },

    get: function(id, cb) {
        var store = this;
        var item = Store.prototype.get.call(this, id);

        if (!item) {
            fetchRemote(this.getURL(id), function(json) {
                var data;
                if (json) {
                    if (DEBUG) {
                        if (json.store !== store.name) {
                            console.warn(
                                "ActiveStore instance `" + store.name + "` " +
                                "received data for store " + json.store + "! " +
                                "The app will probably crash."
                            );
                        }

                        if (json.data.length > 1) {
                            console.warn(
                                "ActiveStore instance `" + store.name + "` " +
                                "was given multiple pieces of data (" +
                                    json.data.length +
                                "). Extra pieces are being dropped."
                            );
                        }
                    }
                    data = json.data[0];
                    store.set(id, data);
                }
                cb(data);
            });
        } else {
            cb(item);
        }
    }

});

module.exports = ActiveStore;