define([
    'config',
    'jquery',
    'backbone',
],
function(Config, $, Backbone) {
    var v = Backbone.View.extend({
        tagName: 'div',
        //
        children: [],
        defaults: {
            type: '-',
            author: 'Anonymous',
            created: 'Unknown',
            category: 'Uncategorized',
            id: -1,
            title: "Untitled"
        },
        //
        initialize : function(attrs) {
            _.bindAll(this, 'render');

            this.render();
        },
        //
        render: function() {
            var that=this,
                newEntry = Blog.render('bareIndexLine',
                    $.extend({}, this.defaults, this.model.toJSON()));

            this.$el.html(newEntry);

            this.trigger('rendered');

            return this;
        },
        //
        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            _.each(this.children, function(v){ v.remove(); });
        }
    });

    return v; 
});