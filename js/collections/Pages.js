define([
    'config',
    'jquery',
    'backbone',
    'models/Page',
    'router'
],
function(Config, $, Backbone, Page, Router) {

    var c = Backbone.Collection.extend({
        model: Page,
        url: Config.dbName,
        dbView : 'index',
        comparator : Config.comparator,
        _firstLoaded : false,
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

            Blog.viewDB(collection.dbView, function(indexData) {

                options.success(indexData.rows.map(function(row) {
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
                }));

                if(!collection._firstLoaded) {
                    // Start router now that index is loaded
                    Blog.router = new Router;
                    collection._firstLoaded = true;
                }
            });
        }
    });

    return c;

});