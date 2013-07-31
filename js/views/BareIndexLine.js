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
            title: "Untitled",
        },
        header: false,
        //
        initialize : function(attrs) {
            _.bindAll(this, 'render');

            this.header = attrs.header;

            this.render();
        },
        //
        render: function() {
            var that=this,
                newEntry,
                _m = $.extend({
                        "__header__" : this.header? true : false
                    }, this.defaults, this.model.toJSON());

            // Patch model with defaults
            if(!_m.title || !_m.title.length) {
                _m.title = this.defaults.title;
            }

            newEntry = Blog.render('bareIndexLine', _m);

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