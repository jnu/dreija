define([
    'config',
    'jquery',
    'backbone'
],
function(Config, $, Backbone) {

    var v = Backbone.View.extend({
        id: Config.footerEl,
        className: "row-fluid text-center footer",
        render: function() {
            var footer = Blog.render('footer', {
                copyright: Config.copyright,
                navLinks : Config.navLinks,
                badges : Config.badges,
                footer : {
                    img: Config.footer,
                    alt: Config.footerAlt
                }
            });
            this.$el.html(footer);
            return this;
        }
    });

    return v;
});