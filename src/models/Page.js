;
define([
    'jquery',
    'backbone'
],
function($, Backbone) {

    var m = Backbone.Model.extend({
        sync : function(method, model, options) {
            switch(method) {
                case 'update':
                    Blog.putToDB(model.id, model.toJSON(),
                        function(data) {
                            if(data.ok) {
                                model.set('_rev', data.rev),
                                model.set('_id', data.id)
                            }
                            options.success(data);
                        });
                    break;

                case 'create':
                    Blog.putToDB(model.id, model.toJSON(), 
                        function(data) {
                            if(data.ok) {
                                model.set('_rev', data.rev);
                                model.set('_id', data.id);
                            }

                            options.success(data);
                        });
                    break;

                case 'delete':
                    Blog.deleteFromDB(model.id, options.success);
                    break;

                case 'read':
                    Blog.getFromDB(model.id,
                                 model.attributes.force||false,
                                 function(data) {
                        options.success(data); 
                        model.trigger('loaded');
                    });
                    break;

                default:
                    options.error("Illegal operation on model.sync: "+ model);
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