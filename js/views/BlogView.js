define([
    'jquery',
    'backbone',
    'views/Header',
    'views/Footer',
],
function($, Backbone, Header, Footer) {

    var v = Backbone.View.extend({
        el: 'body',
        //
        pEl: '#page-cont',
        $pEl: undefined,
        childViews : {},
        //
        initialize: function(attrs) {
            this.childViews.header = new Header;
            this.childViews.footer = new Footer;
            this.childViews.page = null;

            this.renderStatic();

            this.$pEl = $(this.pEl);

            _.bindAll(this, 'render');
        },
        //
        setPageView: function(newPageView) {
            var that = this,
                oldView = this.childViews.page;

            this.childViews.page = newPageView;

            this.listenToOnce(this.childViews.page, 'rendered', function() {
                if(oldView) {
                    oldView.$el.fadeOut('fast', function(){
                        that.render();
                        oldView.remove();
                    });
                }else{
                    that.render();
                }
            });

        },
        //
        renderStatic: function() {
            // Render parts of the page that stay static
            this.childViews.header.render();
            this.childViews.footer.render();

            var content = Blog.render('main', {});

            this.$el.html(content);

            $('#header-cont').html(this.childViews.header.el);
            $('#footer-cont').html(this.childViews.footer.el);

            return this;
        },
        //
        render: function(){
            // Render main page
            this.childViews.page.$el.hide();

            this.$pEl.html(this.childViews.page.el);

            this.childViews.page.$el.fadeIn('slow');

            // Scroll to top of view
            $.scrollTo(this.pEl, 800);
            return this;
        }
    });

    return v;

});