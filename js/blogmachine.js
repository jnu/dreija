/**
 * blogmachine.js
 *
 * Copyright (c) 2013 Joe Nudell, except where otherwise noted
 */




 function BlogMachine(config) {
    // Blog is a singleton, enforce this by adding the first constructed
    // instance to the BlogMachine prototype and returning it on any
    // subsequent construction attempts.
    if(BlogMachine.prototype.__instance__) {
        return BlogMachine.prototype.__instance__;
    }
    var instance = this;
    BlogMachine.prototype.__instance__ = instance;

    // Define primary instance methods and attributes

    this.cache = {};

    this.vars = {
        // Server variables -- necessary for connecting 
        dbHost : "/db",
        dbName : "joenoodles",
        dbDesignDoc : "views",
        blogConfigDoc : "config",
        indexView : "index",
        spriteMap : "spriteMap",
    };

    // DEPENDENCIES: Load blog configuration and blog post index.
    // Dependency loading is concurrent and asynchronous, and each callback
    // will fire instance.init(); HOWEVER! instance.init() _will not execute_
    // unless BOTH of these dependencies are loaded.
    this.__configLoaded__ = false;
    this.__metaLoaded__ = false;

    instance.queryDB(this.vars.blogConfigDoc, function(data) {
        // Extend vars with loaded configuration
        $.extend(true, instance.vars, data);

        // Extend vars with custom configuration
        if(typeof config==='object') {
            $.extend(true, instance.vars, config);
        }

        // Release configLoaded lock and fire .init()
        instance.__configLoaded__ = true;
        instance.init();
    });

    instance.queryDB(instance.vars.spriteMap, function(metaData) {
        // Just save meta in cache
        instance.cache.spriteMap = metaData;

        // unlock metaLoaded
        instance.__metaLoaded__ = true;
        instance.init();
    });
}




BlogMachine.prototype.init = function() {
    // Setup Backbone MV/C
    var instance = this;
    if(!(   this.__configLoaded__
         && this.__metaLoaded__   )) {
        // Can't execute until all dependencies are met; make sure
        // index, meta, and config file have been successfully loaded from
        // the database and return false if they haven't.
        return false;
    }

    // MV/C containers
    this.Models = {};
    this.Collections = {};
    this.Views = {};
    this.Routers = {};

    // -- Models --
    this.Models.Page = Backbone.Model.extend({
        sync : function(method, model, options) {
            // Only implements "read" method! Aliases 'update' to identity.
            if(model.id===null) {
                options.error("Need to pass ID to fetch; got null.");
                return false;
            }

            switch(method) {
                case 'update':
                    options.success(model.attributes);
                    break;

                case 'read':
                    instance.queryDB(model.id,
                                     model.attributes.force||false,
                                     function(data) {
                        options.success(data); 
                        model.trigger('loaded');
                    });
                    break;

                default:
                    options.error("Illegal operation on model.sync: "+model);
                    return false;
            }
        },
        //
        initialize : function(attributes) {
            // `id` should be passed in attributes. Fetch the post on init.
            //if(attributes.id||attributes.force) this.fetch();
        }
    });

    // -- Collections --
    this.Collections.Pages = Backbone.Collection.extend({
        model: instance.Models.Page,
        url: instance.vars.dbName,
        dbView : 'index',
        _firstLoaded : false,
        //
        sync: function(method, collection, options) {
            // Only implements "read"! Overridden because collection accesses
            // CouchDB view running on port 5894 which Backbone assumes won't
            // work by default and so doesn't support (and it won't work,
            // without CORS.)
            if(method!='read') {
                options.error("Illegal operation on collection.sync "+method);
                return false;
            }

            instance.viewDB(collection.dbView, function(indexData) {

                options.success(indexData.rows.map(function(row) {
                    // Add retrieved indexes to collection, with slight
                    // addendums to the retrieved object.
                    // Note: this view doesn't load full text of any pages,
                    // just enough info to lay out the index of pages.
                    var rowData = row.value,
                        postDate = new Date(rowData.created),
                        categories = (rowData.category||'').split('>');

                    $.extend(rowData, {
                        id: row.id,
                        cleanTitle: wp_cleanPostTitle(rowData.title),
                        date: new Date(rowData.created||0),
                        categories: categories,
                        cleanCategories: categories.map(wp_cleanPostTitle),
                        template: 'post'
                    });

                    return rowData;
                }));

                if(!collection._firstLoaded) {
                    // Start router now that index is loaded
                    instance.router = new instance.Routers.Router;
                    collection._firstLoaded = true;
                }
            });
        }
    });

    // -- Views --
    this.Views.BlogView = Backbone.View.extend({
        el: 'body',
        //
        pEl: '#page-cont',
        $pEl: undefined,
        childViews : {},
        //
        initialize: function(attrs) {
            this.childViews.header = new instance.Views.Header;
            this.childViews.footer = new instance.Views.Footer;
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

            var content = instance.render('main', {});

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

    this.Views.Header = Backbone.View.extend({
        id: instance.vars.headerEl,
        className: "page-header text-center",
        events: {'click' : 'goHome'},
        //
        goHome: function() { 
            instance.router.navigate("/", {trigger: true});
        },
        //
        render: function() {
            var banner = instance.render('banner', {
                banner: {
                    img: instance.vars.banner,
                    alt: instance.vars.bannerAlt
                }
            });
            this.$el.html(banner);
            return this;
        }
    });

    this.Views.Footer = Backbone.View.extend({
        id: instance.vars.footerEl,
        className: "row-fluid text-center footer",
        render: function() {
            var footer = instance.render('footer', {
                copyright: instance.vars.copyright,
                navLinks : instance.vars.navLinks,
                badges : instance.vars.badges,
                footer : {
                    img: instance.vars.footer,
                    alt: instance.vars.footerAlt
                }
            });
            this.$el.html(footer);
            return this;
        }
    });

    this.Views.Social = Backbone.View.extend({
        tagName: 'div',
        id: 'social-links',
        //
        sites: ['facebook', 'twitter', 'googleplus', 'tumblr', 'reddit'],
        //
        _networks : {
            facebook : {
                url: "//www.facebook.com/sharer/sharer.php?u={url}&t={text}"
            },
            twitter : {
                url: "//twitter.com/intent/tweet?text={text}&url={url}"
            },
            tumblr : {
                url: "//www.tumblr.com/share?v=3&u={url}&t={text}&s="
            },
            googleplus : {
                url: "//plus.google.com/share?url={url}"
            },
            reddit : {
                url: "//www.reddit.com/submit?url={url}"
            }
        },
        //
        initialize : function(attrs) {
            var that = this;
            _.bindAll(this, 'render');

            if((attrs||{}).sites) this.sites = attrs.sites;

            this.render();
        },
        //
        render : function() {
            var that = this,
                links = "",
                url = encodeURIComponent(window.location),
                title = encodeURIComponent(document.title);

            _.forEach(this.sites, function(site) {
                var sobj = that._networks[site],
                    shareLink = sobj.url.replace('{url}', url)
                                        .replace('{text}', title);
                links += '<a href="'+ shareLink + '" class="social '+ site +'" target="_blank"></a>'; 
            });

            this.$el.html(links);

            return this;
        }
    })

    this.Views.Page = Backbone.View.extend({
        tagName: 'div',
        id: instance.vars.contentEl,
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
            var post = instance.render(this.model.get('template'),
                                       this.model.toJSON());

            this.$el.html(post);

            // Add share buttons
            var shareView = new instance.Views.Social;
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

    this.Views.Home = Backbone.View.extend({
        tagName: 'div',
        id: instance.vars.homeEl,
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
            var index = (new instance.Views.Index({
                collection: this.collection
            })).render();

            this.children.push(index);

            var content = instance.render('home', {
                latest: this.collection.sortBy(function(p) {
                    return p.get('date').valueOf();
                }).reverse().slice(0, 2).map(function(p){
                    p.set('link', instance.createWPPermalink(p, 'post'));
                    return p;
                }),
                categories: this.categories
            });

            this.$el.html(content);
            this.$el.find('#index-cont').html(index.el);

            this.trigger('rendered');

            return this;
        },
        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            _.each(this.children, function(v){ v.remove(); });
        }
    })


    this.Views.Index = Backbone.View.extend({
        tagName: 'div',
        id: instance.vars.contentEl,
        //
        initialize : function(attrs) {
            var that = this;
            _.bindAll(this, 'render');
            this.children = [];
        },
        //
        render: function() {
            var that = this,
                sortedPosts = this.collection.sortBy(function(p){
                // Sort posts by category. Since category hierarchies
                // are stored as a string delimited by '>' (e.g. "a>b>c>d")
                // an alphabetical sort will put everything in a desirable
                // order.
                return p.get('category');
            }),
                currentCategories = [],
                counters = [],
                pageCtr = 0,
                _formatter = new indexNumberFormatter(),
                _increment = function(depth) {
                    while(counters.length<=depth) {
                        // Make sure there are enough counters
                        counters.push(0);
                    }
                    for(var i=depth+1; i<counters.length; i++) {
                        // Reset counters above current one
                        counters[i] = 0;
                    }

                    // Increment and return
                    counters[depth]++;
                    return counters;
                };

            _.forEach(sortedPosts, function(currentPost, i) {
                // Iterate through sorted posts and create IndexLine views for
                // each post. Create IndexLines for category links on the way.
                var cleanCats = (currentPost.get('cleanCategories') || []),
                    cats = (currentPost.get('categories') || []),
                    collection = null,
                    j = 0,
                    path = '';

                if(currentPost.get('type')=='page') {
                    // Intercept pages: they don't get categorized
                    // and follow special layout rules
                    _increment(j);
                    var pfx = "Appendix "+ String.fromCharCode(64+(++pageCtr)),
                        newPageILV = new instance.Views.IndexLine({
                        properties: {
                            model: currentPost,
                            numId: ''+i+j+i,
                            fNum: _formatter(counters, j),
                            hDepth : j+3,
                            link: '/'+  (currentPost.id),
                            title: pfx + "&mdash;" + currentPost.get('title'),
                            sprite: currentPost.get('sprite')
                        }
                    });

                    that.children.push(newPageILV);

                    that.$el.append(newPageILV.render().el);

                    return;
                }

                for(j=0; j<cats.length; j++) {
                    // Make category links for any changed categories
                    if(cats[j] != currentCategories[j]) {

                        // Make path
                        path += '/' + cleanCats[j];

                        // Increment counter for categories
                        _increment(j);

                        // Add new category IndexLine
                        var newCategoryILV = new instance.Views.IndexLine({
                            properties: {
                                model: currentPost,
                                numId: '' + (j+1) + i,
                                fNum: _formatter(counters, j),
                                hDepth : j+3,
                                link : '/category'+ path,
                                title : cats[j],
                                sprite: ''
                            }
                        });

                        that.children.push(newCategoryILV);

                        that.$el.append(newCategoryILV.render().el);
                    }
                }
                
                currentCategories = cats;

                // Increment counter for post
                _increment(j);

                // Add a new IndexLine for the current post
                var newPostILV = new instance.Views.IndexLine({
                    properties: {
                        model: currentPost,
                        numId: i,
                        fNum: _formatter(counters, j),
                        hDepth : cats.length + 3,
                        link : instance.createWPPermalink(currentPost, 'post'),
                        date : currentPost.get('date'),
                        title : currentPost.get('title'),
                        sprite: currentPost.get('sprite')
                    }
                });

                that.children.push(newPostILV);

                that.$el.append(newPostILV.render().el);
            });
            
            return this;
        },
        //
        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            _.each(this.children, function(v){ v.remove(); });
        }
    });

    this.Views.IndexLine = Backbone.View.extend({
        tagName: 'div',
        className: 'indexline',
        //
        properties : {},
        //
        initialize: function(attrs) {
            _.bindAll(this, 'render');
            this.properties = attrs.properties;
        },
        //
        render: function() {
            var indexline = instance.render('indexline', this.properties)
            this.$el.html(indexline);
            return this;
        }
    });


    // -- Router --
    this.Routers.Router = Backbone.Router.extend({
        initialize : function(attr) {
            var router = this,
                routingTable = [
                // Opposite order of regular "routes" key: generic -> specific
                [ "*page",                            "getPostByID"  ],
                [ /([0-9]{4})\/([0-9]{1,2})\/(.*)/,   "wpRoute"      ],
                [ "posts/:id",                        "getPostByID"  ],
                [ "category/*category",               "listCategory" ],
                [ "",                                 "getHomePage"  ],
            ];
            
            // Apply each route from routing table. This roundabout approach is
            // needed to support RegEx routes. Otherwise the table woud be
            // defined as usual in the 'routes' key of the router.
            _.each(routingTable, function(route) {
                router.route.apply(router, route);
            });

            this.model = attr? attr.model : {};
            Backbone.history.start({ pushState: true });
            interceptClicks.call(this);
        },
        // 
        // Actions
        //
        getHomePage : function() {
            var hp = (new instance.Views.Home({
                collection: instance.pages
            }));

            instance.blogview.setPageView(hp);

            hp.render();
        },
        //
        getPostByID : function(id) {
            var m = instance.pages.get(id);

            instance.blogview.setPageView(new instance.Views.Page({model: m}));

            // Get the full page from the server / cache
            m.fetch();
        },
        //
        listCategory : function(category) {
            // like index, but only with given category
            category = category.replace(/^\/+/, '').replace(/\/+$/, '');

            var subset = instance.pages.filter(function(p){
                return p.get('cleanCategories').join('/')==category;
            })
                c = new Backbone.Collection(subset),
                cats = [];

            if(subset.length) {
                var clean = subset[0].get('cleanCategories'),
                    names = subset[0].get('categories');

                _.forEach(clean, function(c, i) {
                    cats.push({
                        clean: clean[i],
                        name: names[i]
                    });
                });
            }

            var cp = (new instance.Views.Home({
                collection: c,
                categories: cats
            }));

            instance.blogview.setPageView(cp);

            cp.render();
        },
        //
        wpRoute : function(year, month, title) {
            year = parseInt(year),
            month = parseInt(month),
            title = title.replace(/\/$/, '');

            var reqPost = instance.pages.filter(function(p) {
                return p.get('date').getFullYear() == year
                    && (p.get('date').getMonth()+1) == month
                    && (p.get('cleanTitle')==title || p.get('oldUrl')==title);
            });

            if(reqPost.length) {
                return this.getPostByID(reqPost[0].id);
            }else{
                return this.getHomePage();
            }
        }
    });

    // Create master blog view
    this.blogview = new this.Views.BlogView;

    // Make collection for posts and fetch an index of them from the server
    this.pages = new this.Collections.Pages;
    this.pages.fetch();
}



// Render Underscore templates
// Adapted version of koorchik's answer on SO found here: http://bit.ly/ynNBj5
// Used to cache templates as they're loaded
BlogMachine.prototype.render = function(tplName, tplData) {
    if(!this.cache.templates) {
        // Designate a place in the cache for templates
        this.cache.templates = {};
    }

    if(!this.cache.templates[tplName]) {
        // Template not cached yet. Load it from the server.
        var _tpl;

        $.ajax({
            url: this.vars.tplDir + '/' + tplName + '-tpl.html',
            method: 'GET',
            async: false,
            dataType: 'html',
            success: function(data) {
                // Load template into underscore
                _tpl = _.template(data);
            }
        });

        // Save underscore template in cache
        this.cache.templates[tplName] = _tpl;
    }

    // Fill out template with given data and return
    return this.cache.templates[tplName](tplData);
}




// Extension to connect to CouchDB. Implements query caching
// to limit requests made to server. 
// TODO : Override Backbone.Model.sync, not just particular instance
// syncs, implementing this method.
BlogMachine.prototype.queryDB = function(query, force, callback) {
    // Interacts with CouchDB's RESTful API
    // Use 'force=true' to bypass cache for given request
    var that = this,
        host = this.vars.dbHost + '/' + this.vars.dbName + '/' + query;

    // Normal calling scheme is just (query, callback)
    if(typeof force==='function') callback = force;

    // Designate cache for requests to DB
    if(!this.cache.db) this.cache.db = {};

    if(!this.cache.db[query] || force===true) {
        // Execute request if not already in cache or forced refresh
        $.ajax({
            url: host,
            method: 'GET',
            async: true,
            dataType: 'json',
            success: function(data) {
                // First save data in cache
                that.cache.db[query] = data;
                // execute callback
                if(callback) callback(data);
            },
        });
    }else{
        // Execute callback with cached response
        // (Redundant because AJAX call is asynchronous)
        if(callback) callback(this.cache.db[query]);
    }
}




BlogMachine.prototype.viewDB = function(view, force, callback) {
    // Convenience function for requesting a view by name
    var query = "_design/"+this.vars.dbDesignDoc+"/_view/"+view;
    this.queryDB(query, force, callback);
}





BlogMachine.prototype.createWPPermalink = function(post, type) {
    var link = '/';

    if(type==='post') {
        link += post.get('date').getFullYear() + '/'
             +  (post.get('date').getMonth()+1) + '/'
             +  post.get('cleanTitle');
    }else if(post.type==='category') {
        if((post.cleanCategories||[]).length) {
            link += "category/" + post.cleanCategories.join('/') + '/';
        }
    }

    return link;
}









// Helpers and utilities, not part of BlogMachine but used by it

function indexNumberFormatter() {
    var that = this,
        _rom = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L',
                'XL', 'X', 'IX', 'V', 'IV', 'I'],
        _dec = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];

    this.formats = {
        abc : function(n) {
            if(n>26 || n<1) throw new Error(n+" is out of format range.");
            return String.fromCharCode(96+n);
        },

        ABC : function(n) {
            return that.formats.abc(n).toUpperCase();
        },

        romnum : function(n) {
            return that.formats.ROMNUM(n).toLowerCase();
        },

        ROMNUM : function(n) {
            // Convert from decimal to roman numeral
            if(n<1 || n>=4000) throw new Error(n+" is out of format range.");
            var _r = "";
            for(var i=0; i<_rom.length; i++) {
                while(n>=_dec[i]) {
                    n -= _dec[i];
                    _r += _rom[i];
                }
            }

            return _r;
        },

        dotSub : function(n, depth, counters) {
            // Eg. 1.2 or 3.4. Uses previous level's counter
            if(depth<1) throw new Error("Can't dot-sub first level");
            return counters[depth-1] +"."+ n;
        }
    }

    // Define a few levels of formatting
    this.tiers = [
        this.formats.ROMNUM,
        this.formats.dotSub,
        this.formats.ABC,
        this.formats.romnum,
        this.formats.abc
    ];

    this.format = function(counters, depth) {
        return that.tiers[depth](counters[depth], depth, counters);
    }

    return this.format;
}




function interceptClicks() {
    // Intercept click events on links pointing to local paths and use
    // HTML5 pushState via Backbone router.
    // Call with `this` as the Backbone router
    // >> Function thanks to Gilbert Reimschüssel (http://bit.ly/16kP06e)
    var router = this;

    function _linkHandler(e, back) {

        function _interceptor(href) {
            // Function that redirects click action to Backbone router
            e.preventDefault();

            // Remove shebanged URLs, though hopefully there are none anyway
            var url = href.replace(/^\//, '').replace('\#\!\/', '');

            // Trigger Backbone routing event
            router.navigate(url, {trigger: true});
        }

        // Determine whether interceptor should be used:
        // Set passThrough to true in cases where clicks should use default
        // behavior.

        var href = back? window.location.path : $(e.currentTarget).attr('href'),
            passThrough = false,
            tests = [
            /^\/\/[\w]/,    // Links omitting http / https but are external
            /^\/static\//,  // static content on server
            /^\/sandbox\//, // real pages on the server
            ];
        
        for(var i=0; i<tests.length; i++) {
            passThrough = tests[i].test(href);
            if(passThrough) break;
        }

        if(!passThrough && !e.altKey&&!e.ctrlKey&&!e.MetaKey&&!e.shiftKey) {
            // Animation
            $.scrollTo(0, {
                duration: 300,
                onAfter: function() { _interceptor(href||""); }
            });

            // Prevent default action
            return false;
        }

        // Click passed through
        return true;
    }

    // Clicking on links
    $(document).on("click", "a[href^='/']", _linkHandler)

    // Back button handling
    window.addEventListener('popstate', function(e) {
        // Scroll to Top
        //e.preventDefault();
        //return _linkHandler(e, true);
        //$('#content').fadeOut('fast');
    });
}




function wp_cleanPostTitle(title) {
    // Make title into a url-friendly string in the style used by WordPress
    // Todo - test function, make sure it works in all cases
    return title.toLowerCase()
                .replace(/<.*?>/g, '')
                .replace(/[^\w\d\s]/g, '')
                .replace(/\s+/g, '-');
}



function encode(string, seed) {
    // Simple encoding of a string, for simple source obfuscation
    if(seed===undefined) seed = 1;
    var e = "",
        c = string.length,
        n = 0;
    for(var i=0; i<string.length; i++) {
        x = -(seed - i + c);
        n = string.charCodeAt(i) - x;
        while(n<0) n += 256;
        n %= 256;
        e += String.fromCharCode(n);
    }
    return e;
};

function decode(string, seed) {
    // Decoding of jn.encode
    if(seed===undefined) seed = 1;
    var d = "",
        c = string.length,
        n = 0;
    for(var i=0; i<string.length; i++) {
        x = -(seed - i + c);
        n = string.charCodeAt(i) + x;
        n %= 256;
        d += String.fromCharCode(n);
    }
    return d;
};




function clone(o, deep) {
    // Clone an object, by default clone deeply.
    return $.extend(deep===false? false : true, {}, o);
}




function Error(msg) {
    // ... TODO -- Error logging.
    // Should post errors to a log.
    this.msg = msg;
}