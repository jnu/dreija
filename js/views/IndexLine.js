define([
    'jquery',
    'backbone'
],
function($, Backbone) {

    var v = Backbone.View.extend({
        tagName: 'div',
        className: 'indexline',
        //
        properties : {},
        //
        initialize: function(attrs) {
            _.bindAll(this, 'render');
            this.properties = attrs.properties;
        },
        //
        render: function() {
            var indexline = Blog.render('indexline', this.properties)
            this.$el.html(indexline);
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