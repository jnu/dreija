define([
    'config',
    'jquery',
    'backbone'
],
function(Config, $, Backbone) {

    var v = Backbone.View.extend({
        id: Config.sideBarEl.replace('#', ''),
        className: "tabbable tabs-left",
        contentId: undefined,
        //
        events: {
            'click li>a' : 'setActive'
        },
        //
        setActive : function(e) {
            // Need to set active tabs manually since content is all dynamic
            var target = e.currentTarget;
            this.$el.find('li').removeClass('active');
            $(target).parent().addClass('active');
        },
        //
        handleExternalNav : function(route) {
            // Make sure correct tab is currently activated
            var r = route || window.location.pathname,
                _l = this.$el.find('a[href="'+ r +'"]');
            if(_l.length) {
                this.setActive({currentTarget: _l[0]});
            }

            return this;
        },
        //
        absorbContent: function() { 
            // If a contentId was passed on init, absorb it into the
            // .tab-content selector
            if(this.contentId) {
                $(this.contentId).appendTo(this.$el.find('.tab-content'));
            }
        },
        //
        initialize : function(attrs) {
            var that = this;

            if(attrs) {
                this.contentId = attrs.contentId;
            }

            _.bindAll(this, 'render', 'absorbContent', 'handleExternalNav');

            // Absorb content as soon as this View gets inserted into the DOM.
            this.on('insert', that.absorbContent);

            this.on('router:on', function() {
                that.listenTo(Blog.router, 'route', function(r, route, p) {
                    // Just take path from window.location.pathname,
                    // not what the router's returning.
                    that.handleExternalNav();
                });
            });
        },
        //
        render: function() {
            var sideBar = Blog.render('sideBar', {}),
                that = this;
            this.$el.html(sideBar);



            function _resize(){
                // Handle window resize so that tabs go on top, instead of left
                if($(window).width()<760) {
                    that.$el.toggleClass('tabs-top', true);
                    that.$el.toggleClass('tabs-left', false);
                }else{
                    that.$el.toggleClass('tabs-top', false);
                    that.$el.toggleClass('tabs-left', true);
                }
            }

            $(window).resize(_resize);
            // And once on render for posterity
            _resize();

            this.handleExternalNav();
            return this;
        }
    });

    return v;

});