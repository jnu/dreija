define([
    'config',
    'jquery',
    'backbone',
    'views/Social'
],
function(Config, $, Backbone, Social) {
   
   var v = Backbone.View.extend({
        tagName: 'div',
        id: Config.contentEl,
        //
        children: [],
        //
        initialize : function(attrs) {
            var that = this;
            _.bindAll(this, 'render');

            //this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'loaded', this.render);
        },
        //
        render: function() {
            var post = Blog.render(this.model.get('template'),
                                 this.model.toJSON());

            this.$el.html(post);

            // Add share buttons
            var shareView = new Social;
            this.children.push(shareView.render());
            this.$el.append("<div class='row-fluid text-center'><div class='span4 offset4' id='social-cont'></div></div>");
            this.$el.find('#social-cont').html(shareView.el);

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