define([
    'jquery',
    'backbone',
    'views/Header',
    'views/Footer',
    'views/SideBar',
    'views/Categories'
],
function($, Backbone, Header, Footer, SideBar, Categories) {

    var v = Backbone.View.extend({
        el: 'body',
        //
        pEl: '#page-cont',
        $pEl: undefined,
        childViews : {},
        _onPageChange: {
            'in'  : [],
            'out' : []
        },
        //
        initialize: function(attrs) {
            var that = this;

            this.childViews.header = new Header;
            this.childViews.footer = new Footer;
            this.childViews.sideBar = new SideBar({
                contentId: this.pEl
            });
            this.childViews.page = null;

            this.renderStatic();

            this.on('router:on', function() {
                // Tell everyone that the router has been turned on
                _.each(that.childViews, function(me) {
                    me.trigger('router:on');
                });

                // Add the sidebar modules
                this.childViews.sideBar.addModule(new Categories({
                    collection: Blog.pages 
                }));
            });

            this.$pEl = $(this.pEl);

            _.bindAll(this, 'render', 'onPageChange', 'renderStatic');
        },
        //
        onPageChange: function(when, f) {
            // Note: these events only last for one event!
            if(when=='in') {
                this._onPageChange['in'].push(f);
            }else if(when=='out') {
                this._onPageChange['out'].push(f);
            }else{
                return false;
            }
            return true;
        },
        //
        setPageView: function(newPageView) {
            var that = this,
                oldView = this.childViews.page;


            if(oldView
                && oldView.constructor.type=="Home"
                && oldView.constructor.type==newPageView.constructor.type
                && oldView.$el.find('#posts').length){
                // Two Home views are being exchanged. In this case set only
                // the content part of the page for a more nuanced effect. Any
                // animations etc will not fade out with the content.
                newPageView.render();
                var $op = oldView.$el.find('#posts'),
                    $np = newPageView.$el.find('#posts');

                $op.fadeOut('fast', function() {
                    // Transfer content from new view to old view
                    $op.html($np.html());
                    $op.fadeIn('slow');
                    oldView.collection = newPageView.collection;

                    // Destroy the new view lest stray views accumulate
                    newPageView.remove();
                });
                
            }else{
                // The normal case--swap out old view, swap in new one

                while(this._onPageChange['out'].length) {
                    // Unload events
                    var f = this._onPageChange['out'].pop();
                    f();
                }

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

                while(this._onPageChange['in'].length) {
                    // page in events
                    var f = this._onPageChange['in'].pop();
                    f();
                }
            }

        },
        //
        renderStatic: function() {
            // Render parts of the page that stay static
            this.childViews.header.render();
            this.childViews.footer.render();
            this.childViews.sideBar.render();

            var content = Blog.render('main', {});

            this.$el.html(content);

            this.insertView(this.childViews.header, '#header-cont');
            this.insertView(this.childViews.sideBar, '#sidebar-cont');
            this.insertView(this.childViews.footer, '#footer-cont');

            return this;
        },
        //
        insertView: function(view, selector) {
            // Add the given View to the provided selector and fire event
            // telling the view that this has been done.
            $(selector).html(view.el);
            view.trigger('insert');
        },
        //
        render: function(){
            // Render main page
            this.childViews.page.$el.hide();

            this.$pEl.html(this.childViews.page.el);

            this.childViews.page.$el.fadeIn('slow');

            // Scroll to top of view
            if($(window).scrollTop()
                    > this.childViews.sideBar.$el.position().top) {
                // Only scroll when user is scrolled down past target element.
                $.scrollTo(this.childViews.sideBar.el, 300);
            }
            return this;
        }
    });

    return v;

});