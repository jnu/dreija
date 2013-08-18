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
            'click a' : 'setActive'
        },
        //
        modules: {},
        //
        addModule : function(v, id) {
            // Add a module (view) to the sidebar. Give it an id or one will be
            // assigned for it. Ids must be unique, so be sure to check what
            // the return value is for the actual id used.
            if(id===undefined) {
                id = v.cid||'view'+~~(100*Math.random());
            }

            var uid = id,
                i = 1;

            while(uid in this.modules) {
                // Make sure id is unique
                uid = id+i++;
            }

            // Add the ul to the bar
            var $ul = this.$el.find('ul');
            v.id = uid;
            v.render();
            v.$el.appendTo($ul[0]);

            this.modules[uid] = v;

            return uid;
        },
        //
        removeModule : function(id) {
            var m = this.modules[id];
            if(m) {
                m.remove();
                return true;
            }else{
                return false;
            }
        },
        //
        setActive : function(e) {
            // Need to set active tabs manually since content is all dynamic
            var target = e.currentTarget;
            $(target).parent().parent().find('li').removeClass('active');
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

            _.bindAll(this, 'render',
                'absorbContent', 'handleExternalNav', '_resizeHandler',
                'addModule', 'removeModule');

            // Absorb content as soon as this View gets inserted into the DOM.
            this.on('insert', that.absorbContent);
//that.makeCategoriesList();
            this.on('router:on', function() {
                that.listenTo(Blog.router, 'route', function(r, route, p) {
                    // Just take path from window.location.pathname,
                    // not what the router's returning.
                    that.handleExternalNav();
                });
            });


            $(window).resize(this._resizeHandler);
        },
        //
        _resizeHandler : function() {
            // Handle window resize so that tabs go on top, instead of left
            if($(window).width()<760) {
                this.$el.toggleClass('tabs-top', true);
                this.$el.toggleClass('tabs-left', false);
            }else{
                this.$el.toggleClass('tabs-top', false);
                this.$el.toggleClass('tabs-left', true);
            }
        },
        //
        render: function() {
            var sideBar = Blog.render('sideBar', {
                categories: this.categories
            });
            this.$el.html(sideBar);

            var $row = $("<div class='row-fluid'></div>")
                .insertAfter(this.$el),
                $c1 = $('<div class="span2"></div>').appendTo($row),
                $c2 = $('<div class="span10"></div>').appendTo($row);

            //$c2.append(this.$el);

            //this.$el.stickTo({
            //    target: '#sidebar',
            //    align: 'outside-left',
            //    margin: '5'
            //});



            // Resize once on render for posterity
            this._resizeHandler();

            this.handleExternalNav();
            return this;
        }
    });

    return v;

});