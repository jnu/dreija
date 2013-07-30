define([
    'config',
    'jquery',
    'backbone',
    'models/Page'
],
function(Config, $, Backbone, Page) {

    var c = Backbone.Collection.extend({
        model: Page,
        url: Config.dbName,
        dbView : 'index',
        comparator : Config.comparator,
        //
        initialize: function(attrs) {
            attrs = attrs || {};
            this.dbView = attrs.view || 'index';

            _.bindAll(this, 'refresh');

            if(attrs.fetch) {
                this.fetch({success: attrs.callback});
            }
        },
        //
        refresh: function(view, callback) {
            if(typeof view=='function') {
                callback = view;
                view = undefined;
            }

            this.dbView = view || this.dbView;

            this.fetch({
                success: function(c) {
                    if(typeof callback=='function') {
                        callback(c);
                    }
                },
                force: true // force refresh from server
            })
            
        },
        //
        sync: function(method, collection, options) {
            // Only implements "read"! Overridden because collection accesses
            // CouchDB view running on port 5894 which Backbone assumes won't
            // work by default and so doesn't support (and it won't work,
            // without CORS.)
            
            if(method!='read') {
                options.error("Illegal operation on collection.sync "+method);
                return false;
            }

            Blog.viewDB(collection.dbView, options.force, function(indexData) {

                options.success(
                    indexData.rows.map(function(row) {
                    // Add retrieved indexes to collection, with slight
                    // addendums to the retrieved object.
                    // Note: this view doesn't load full text of any pages,
                    // just enough info to lay out the index of pages.
                    var rowData = row.value,
                        postDate = new Date(rowData.created),
                        categories = (rowData.category||'').split('>');

                    $.extend(rowData, {
                        id: row.id,
                        cleanTitle: Blog.wp.cleanPostTitle(rowData.title),
                        date: new Date(rowData.created||0),
                        categories: categories,
                        cleanCategories: categories.map(Blog.wp.cleanPostTitle),
                        template: 'post'
                    });
                    return rowData;
                }),
                    collection);
            });
        }
    });

    return c;

});