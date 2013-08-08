define([
    'config',
    'jquery',
    'backbone'
],
function(Config, $, Backbone) {

    var v = Backbone.View.extend({
        id: 'module', // note -- modules are given UID when attached to SideBar
        tagName: 'li',
        className: "pull-left cleared hidden-phone module",
        //
        categories: [],
        //
        initialize : function(attrs) {
            var that = this;

            _.bindAll(this, 'render', 'makeCategoriesList');

            this.makeCategoriesList();
        },
        //
        makeCategoriesList : function() {
            var c = _.uniq(this.collection.pluck('category')).sort();

            this.categories = _.map(c, function(cat) {
                var cats = cat.split(">"),
                    subPath = _.map(cats, Blog.wp.cleanPostTitle).join("/");
                cat = cats[cats.length-1];

                return {
                    depth: cats.length-1,
                    label: cat,
                    link: '/category/'+ subPath
                }
            });
        },
        //
        render: function() {
            var module = Blog.render('categories', {
                categories: this.categories
            });
            this.$el.html(module);

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