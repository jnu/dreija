define([
    'jquery',
    'backbone'
],
function($, Backbone) {

    var m = Backbone.Model.extend({
        sync : function(method, model, options) {
            // Only implements "read" method! Aliases 'update' to identity.
            if(model.id===null) {
                options.error("Need to pass ID to fetch; got null.");
                return false;
            }

            switch(method) {
                case 'update':
                    options.success(model.attributes);
                    break;

                case 'read':
                    Blog.queryDB(model.id,
                                 model.attributes.force||false,
                                 function(data) {
                        options.success(data); 
                        model.trigger('loaded');
                    });
                    break;

                default:
                    options.error("Illegal operation on model.sync: "+model);
                    return false;
            }
        },
        //
        initialize : function(attributes) {
            // `id` should be passed in attributes. Fetch the post on init.
            //if(attributes.id||attributes.force) this.fetch();
        }
    });

    return m;

});