define(
function() {
    var c = {
        // Server variables -- necessary for connecting 
        dbHost : "/db",
        dbName : "joenoodles",
        dbDesignDoc : "views",
        blogConfigDoc : "config",
        indexView : "index",
        spriteMap : "spriteMap",
        "_id": "config",
        "_rev": "10-f96e924dbd61bcc67080eb2f4fb4698a",
        "contentEl": "#content",
        "tplDir": "/templates",
        "banner": "/img/banner.png",
        "bannerEl": "#banner",
        "bannerAlt": "",
        "headerEl": "#header",
        "footer": "/img/footer.png",
        "footerEl": "#footer",
        "footerAlt": "",
        "latestHeader": "Latest",
        "contentsHeader": "Contents",
        "dividerIconClass": "icon-leaf",
        "copyright": "\"This is all my fault!\" &mdash; Joe Nudell, 2013",
        "navLinks": [
            {
                "url": "/",
                "text": "home"
            },
            {
                "url": "/about",
                "text": "about"
            },
            {
                "url": "/contact",
                "text": "contact"
            }
        ],
        "badges": [
            {
                "url": "http://www.w3.org/html/wg/drafts/html/master/",
                "class": "html5"
            },
            {
                "url": "http://nodejs.org/",
                "class": "nodejs"
            },
            {
                "url": "http://www.python.org/",
                "class": "python"
            },
            {
                "url": "http://www.backbonejs.org/",
                "class": "backbonejs"
            },
            {
                "url": "http://couchdb.apache.org/",
                "class": "couchdb"
            }
        ],
        "homeEl": "#home",
        comparator: function(item) {
            var c = item.get('category') || 'zzzzzzzzzzzzz';
            return [c, item.get('created')];
        },
    };

    return c;
});