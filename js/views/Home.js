define([
    'config',
    'jquery',
    'backbone',
    'views/Index'
],
function(Config, $, Backbone, Index) {
    
    var v = Backbone.View.extend({
        tagName: 'div',
        id: Config.homeEl,
        //
        categories: [],
        //
        initialize: function(attrs) {
            _.bindAll(this, 'render');
            this.categories = attrs.categories||[];
            this.children = [];
        },
        //
        render: function() {
            var index = new Index({
                collection: this.collection
            }).render();

            this.children.push(index);

            var content = Blog.render('home', {
                latest: this.collection.sortBy(function(p) {
                    return p.get('date').valueOf();
                }).reverse().slice(0, 2).map(function(p){
                    p.set('link', Blog.wp.createPermalink(p, 'post'));
                    return p;
                }),
                categories: this.categories
            });

            this.$el.html(content);
            this.$el.find('#index-cont').html(index.el);

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