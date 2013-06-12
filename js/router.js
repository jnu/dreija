define([
    'jquery',
    'backbone',
    'views/Home',
    'views/Page'
],
function($, Backbone, Home, Page) {
   
   var r = Backbone.Router.extend({
        initialize : function(attr) {
            var router = this,
                //
                routingTable = [
                // Opposite order of regular "routes" key: generic -> specific
                [ "*page",                            "getPostByID"  ],
                [ /([0-9]{4})\/([0-9]{1,2})\/(.*)/,   "wpRoute"      ],
                [ "posts/:id",                        "getPostByID"  ],
                [ "category/*category",               "listCategory" ],
                [ "",                                 "getHomePage"  ],
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
        getHomePage : function() {
            var hp = new Home({
                collection: Blog.pages
            });

            Blog.blogview.setPageView(hp);

            hp.render();
        },
        //
        getPostByID : function(id) {
            var m = Blog.pages.get(id);

            Blog.blogview.setPageView(new Page({model: m}));

            // Get the full page from the server / cache
            m.fetch();
        },
        //
        listCategory : function(category) {
            // like index, but only with given category
            category = category.replace(/^\/+/, '').replace(/\/+$/, '');

            var subset = Blog.pages.filter(function(p){
                return p.get('cleanCategories').join('/') == category;
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

            var cp = new Home({
                collection: c,
                categories: cats
            });

            Blog.blogview.setPageView(cp);

            cp.render();
        },
        //
        wpRoute : function(year, month, title) {
            year = parseInt(year),
            month = parseInt(month),
            title = title.replace(/\/$/, '');

            var reqPost = Blog.pages.filter(function(p) {
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

   return r; 
});