define([
    'config',
    'jquery',
    'backbone',
],
function(Config, $, Backbone) {
    var v = Backbone.View.extend({
        tagName: 'div',
        id: Config.contentEl,
        //
        children: [],
        //
        initialize : function(attrs) {
            _.bindAll(this, 'render');

            this.render();
        },
        //
        render: function() {
            var sv = Blog.render('settings', {});

            this.$el.html(sv);
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