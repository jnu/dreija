;
define([
    'jquery',
    'backbone',
    'collections/Pages',
    'views/Home',
    'views/Page',
    'views/AdminBar',
    'views/Drafts',
    'views/EditPage',
    'views/Settings',
    'views/NotFound',
    'views/Alert',
    'config'
],
function($, Backbone, Pages, Home, Page,
    AdminBar, Drafts, EditPage, Settings,
    NotFound, Alert, Config) {
   
    var r = Backbone.Router.extend({
        initialize : function(attr) {
            var router = this,
                //
                routingTable = [
                // Opposite order of regular "routes" key: generic -> specific
                [ "*page",                           "getPostByID"      ],
                [ "_admin/*page",                    "adminStuff"       ],
                [ "_admin/_editPage/:id",            "adminEditStuff"   ],
                [ "_admin/_deletePage/:id",          "adminDeleteStuff" ],
                [ /([0-9]{4})\/([0-9]{1,2})\/(.*)/,  "wpRoute"          ],
                [ "posts/:id",                       "getPostByID"      ],
                [ "category/*category",              "listCategory"     ],
                [ "",                                "getHomePage"      ],
            ];
            //
            // Apply each route from routing table. This roundabout approach is
            // needed to support RegEx routes. Otherwise the table woud be
            // defined as usual in the 'routes' key of the router.
            _.each(routingTable, function(route) {
                router.route.apply(router, route);
            });

            this.model = attr? attr.model : {};

            Backbone.history.start({ pushState: true });

            Blog.interceptClicks.call(this);
        },
        // 
        // Actions
        //
        adminStuff : function(page, dir) {
            var that = this;

            if(!Blog.blogview.childViews.adminBar) {
                Blog.blogview.childViews.adminBar = new AdminBar;
            }
            Blog.blogview.childViews.adminBar.toggleEditButton(false);

            Blog.pages.refresh('all', function(c) {
                Blog.pages = c;

                if(dir=='edit') {
                    that.adminEditPage(page);
                }else if(dir=='delete') {
                    that.adminDeletePage(page);
                }else{
                    that._routeAdminReq(page);
                }
            });
        },
        //
        adminEditStuff : function(id) {
            this.adminStuff(id, 'edit');
        },
        //
        adminDeleteStuff : function(id) {
            this.adminStuff(id, 'delete');
        },
        //
        _routeAdminReq : function(page) {
            page = page || "";

            switch(page) {
                case "_newPost":
                    var np = new EditPage({});
                    Blog.blogview.setPageView(np);
                    np.render();
                    Blog.blogview.childViews.adminBar.setActive('newPost');
                    break;
                case "_drafts":
                    var dv = new Drafts({collection: Blog.pages.clone()});
                    Blog.blogview.setPageView(dv);
                    dv.render();
                    Blog.blogview.childViews.adminBar.setActive('drafts');
                    break;
                case "_settings":
                    var sv = new Settings;
                    Blog.blogview.setPageView(sv);
                    sv.render();
                    Blog.blogview.childViews.adminBar.setActive('settings');
                    break;
                default:
                    // Trigger route "page" in main router controller
                    this.navigate(page, {trigger: true, replace: true});
                    Blog.blogview.childViews.adminBar.toggleEditButton(true);
                    Blog.blogview.childViews.adminBar.setActive('/');
            }
        },
        //
        adminEditPage : function(id) {
            var m = Blog.pages.get(id, {});

            m.fetch({
                success: function() {
                    var ep = new EditPage({model:m});

                    Blog.blogview.setPageView(ep);
                    ep.render();
                }
            });
        },
        //
        adminDeletePage : function(id) {
            // Confirm deletion first
            var that = this,
                m = Blog.pages.get(id, {});

            m.fetch({
                success: function() {
                    var _confirm = new Alert({
                        type: 'confirm',
                        title: "Really?",
                        text: "Do you really want to delete post `"+ id +"`?",
                        ok: function(first) {
                            if(first!==true) { return; }

                            Blog.deleteFromDB(id, m.toJSON(), function(r) {
                                if(r.status>=300) {
                                    // Error
                                    var _err = new Alert({
                                        type: 'error',
                                        title: 'Error',
                                        text: "Couldn't delete: "+r.statusText,
                                        ok: function() {
                                            that.navigate('/_admin/_drafts',
                                                {trigger:true});
                                        }
                                    });
                                }else{
                                    // Success
                                    var _ok = new Alert({
                                        type: 'info',
                                        title: 'Deleted',
                                        text: "Post deleted.",
                                        ok: function() {
                                            Blog.pages.refresh(function() {
                                                that.navigate('/_admin/_drafts',
                                                    {
                                                        trigger:true
                                                    });
                                            });
                                        }
                                    });
                                }
                            });
                        },
                        cancel: function() {
                            that.navigate('/_admin/_drafts',
                                {trigger:true});
                        }
                    });
                }
            });
        },
        //
        _edit : function() {
            // Go to page for editing current page
            var id;
            if(Blog.blogview.childViews.page
                && Blog.blogview.childViews.page.model) {
                id = Blog.blogview.childViews.page.model.id;
            }

            if(id!==undefined) {
                this.navigate("_admin/_editPage/"+ id, {trigger: true});
            }else{
                return false;
            }
        },
        //
        //
        //
        getHomePage : function() {
            var hp = new Home({
                collection: Blog.pages.clone()
            });

            Blog.blogview.setPageView(hp);

            hp.render();
        },
        //
        getNotFound : function() {
            var nf = new NotFound;
            Blog.blogview.setPageView(nf);
            nf.render();
        },
        //
        getPostByID : function(id) {
            if(id.toLowerCase()=='_admin') {
                return this.adminStuff();
            }

            var m = Blog.pages.get(id, null);

            if(m==null) {
                return this.getNotFound();
            }

            Blog.blogview.setPageView(new Page({model: m}));

            // Get the full page from the server / cache
            m.fetch();
        },
        //
        listCategory : function(category) {
            // like index, but only with given category
            category = category.replace(/^\/+/, '').replace(/\/+$/, '');

            var subset = Blog.pages.clone().filter(function(p){
                return p.get('cleanCategories').join('/') == category;
            }),
                c = new Backbone.Collection(subset),
                cats = [];

            // Inherit comparator
            c.comparator = Config.comparator;

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

            var cp = new Home({
                collection: c,
                categories: cats
            });

            Blog.blogview.setPageView(cp);

            cp.render();
        },
        //
        wpRoute : function(year, month, title) {
            var reqPost = this._resolveWPRoute(year, month, title);

            if(reqPost) {
                return this.getPostByID(reqPost.id);
            }else{
                return this.getHomePage();
            }
        },
        //
        _resolveWPRoute : function(year, month, title) {
            // Find post in index by year-month-title. Return null on fail.
            year = parseInt(year),
            month = parseInt(month),
            title = title.replace(/\/$/, '');

            var rp = Blog.pages.filter(function(p) {
                var date = (p.get('date')
                    ||
                    (p.get('created')? new Date(p.get('created')) : null));

                if(date
                    && date.getFullYear() == year
                    && (date.getMonth()+1) == month
                    && (p.get('cleanTitle')==title || p.get('oldUrl')==title))
                {
                    return true;
                }
                return false;
            });

            if(rp.length) {
                return rp[0];
            }else{
                return null;
            }
        }
    });

   return r; 
});