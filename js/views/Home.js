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
                    
                    var date = (p.get('date') 
                        ||
                        (p.get('created')? new Date(p.get('created')) : null));

                    if(date) {
                        return p.get('date').valueOf();
                    }else{
                        return 0;
                    }

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