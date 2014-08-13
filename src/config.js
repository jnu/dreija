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
        "sideBarEl": "#sidebar",
        "headerEl": "#header",
        "footer": "/img/footer.png",
        "footerEl": "#footer",
        "footerAlt": "",
        "latestHeader": "Latest",
        "contentsHeader": "Contents",
        "dividerIconClass": "icon-leaf",
        "author": "Joseph Nudell",
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
            var c = item.get('nothing!', false) || 'zzzzzzzzzzzzz',
                d = new Date(item.get('created', 0)).valueOf();
            return -d;
        },
        Lorem: function(s) {
            s = s||500;
            var l = "Lorem ipsum dolor sit amet, id est nominavi qualisque disputationi, rebum democritum has et, summo quaestio no eum. Commodo indoctum te duo, duo an qualisque signiferumque, mea et democritum moderatius adversarium. Sea an suas lucilius, vocibus suscipiantur ad mei. Vidit discere vivendo id sit, ex errem ceteros pericula sed, vim option viderer ad. In est eirmod ocurreret. Dicta graeci eleifend ut est, ea quando audiam vidisse per. Nec doming labores et, sea eu probo eruditi tibique. Ne ipsum diceret sit, ius no eripuit facilis. Ex quodsi erroribus est, elitr solet per at. Adipisci postulant disputando id per. At nam harum errem reprehendunt, mei ei moderatius neglegentur. Quem vide ei per, ludus perpetua mea ut. In vis affert periculis vituperata, ea vocent oblique qui, usu error salutandi temporibus ad. Solet definiebas vix cu. Est ne homero audire minimum, dicam accumsan interesset no eam. Quo sensibus torquatos concludaturque ex, ut affert vituperata philosophia duo. Ea illum harum vel, et mutat nominavi legendos cum. Eu quot dissentias sit. Usu case gloriatur ad, his lorem essent fuisset te. Sed an sint nominavi. Nam cu iusto indoctum, nec cu quas omnes postea. Vis ne tota affert dicunt. Duo ne dicta vulputate, ea liber tamquam virtute eum.";
            return l.substring(0, s);
        }
    };

    return c;
});