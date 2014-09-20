define([
    'config',
    'jquery',
    'backbone'
],
function(Config, $, Backbone) {

    var v = Backbone.View.extend({
        id: Config.headerEl.replace('#',''),
        className: "page-header text-center",
        events: {'click' : 'goHome'},
        //
        goHome: function() { 
            Blog.router.navigate("/", {trigger: true});
        },
        //
        render: function() {
            var banner = Blog.render('banner', {
                banner: {
                    img: Config.banner,
                    alt: Config.bannerAlt
                }
            });
            this.$el.html(banner);
            return this;
        }
    });

    return v;

});