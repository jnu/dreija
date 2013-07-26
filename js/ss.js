/**
 * ss.js
 * Render pages server side very primitively for SEO purposes.
 */

var express = require('express'),
    app = express(),
    couchdb = require('felix-couchdb'),
    client = couchdb.createClient(5984, 'localhost'),
    db = client.db('joenoodles'),
    //
    posts = [],
    categories = [],
    //
    _getter = (function(k, d) { return this[k] || d; });
    //


function wrap(res, content, post) {
    post = post || {};
    post.get = post.get || _getter.bind(post);

    title = post.get('title', 'JoeNoodles')

    html = "<html><head><title>" + title + "</title>";
    html += "<link rel='image_src' href='/img/jnlogo.png'/>";
    html += "<meta property='og:image' content='http://joenoodles.com/img/jnlogo.png' />";
    html += "<meta property='og:title' content='"+title+"' />";
    html += "</head>";
    html += "<body>";
    html += content;
    html += "</body></html>";

    res.send(html);
}



function cleanPostTitle(title) {
    // Make title into a url-friendly string in the style used by WP
    // Todo - test function, make sure it works in all cases
    if(title===undefined) return "";
    return title.toLowerCase()
                .replace(/<.*?>/g, '')
                .replace(/[^\w\d\s]/g, '')
                .replace(/\s+/g, '-');
}

function createPermalink(post) {
    var link = '/';
    link += post.get('date').getFullYear() + '/'
         +  (post.get('date').getMonth()+1) + '/'
         +  post.get('cleanTitle');

    return link;
}

function getLink(post) {
    var e = "<div><a href='"+createPermalink(post)+"'>"+ post.get('title','-') +"</a></div><br/>"
    return e;
}


function getPostByID(id, res) {
    db.getDoc(id, function(er, doc) {
        if(er) {
            res.send(JSON.stringify(er));
        }else{
            doc = doc || {};
            
            doc.get = _getter.bind(doc);

            var content = "<h1>"+ doc.get('title', '') +"</h1><div>"+ doc.get('content', '') +"</div><div class='author'>By "+ doc.get('author', '') +"</div><div class='linkback'><a href='/'>Home</a></div>";
            wrap(res, content, doc);
        }
    });
}


function getHomePage(res) {
    var content = "<div>Joe Nudell's blog about many things centered around humans, computers, and the way they interact with one another.</div>";
    posts.forEach(function(p) { content+=getLink(p); });
    content += "<div class='author'>By Joe Nudell</div>";

    wrap(res, content);
}


var posts = db.getDoc('_design/views/_view/index', function(er, doc) {
    if(er) {
        //throw new Error(JSON.stringify(er));
    }

    posts = doc.rows.map(function(d){
        var post = d.value;
        post.cleanTitle = cleanPostTitle(post.title);
        post.cleanCat = cleanPostTitle(post.category);
        post.date = new Date(post.created||0);
        post.id = d.id;
        //
        post.get = _getter.bind(post);
        return post;
    });

    posts.forEach(function(d) {
        var cat = d.category;
        if(categories.indexOf(cat)<0) {
            categories.push(cat);
        }
    });
});




//app.param('id', /^[\w\d]+$/);
//app.param('name', /^[\w\d\-]+$/);
//app.param('year', /^2\d\d\d$/);
//app.param('month', /^[0-1]?\d$/);




app.get('/', function(req, res) {
    getHomePage(res);
});



app.get('/category/:name', function(req, res) {
    var cat = req.params.name;

    // List posts in category
    var content = "<h2>"+cat+"</h2>";
    posts.forEach(function(p) {
        if(p.cleanCat==cat) {
            content += getLink(p);
        }
    });
    content += "<div class='author'>By Joe Nudell</div>";

    wrap(res, content, {title: cat});
});



app.get('/:year/:month/:name', function(req, res) {
    year = parseInt(req.params.year),
    month = parseInt(req.params.month),
    title = req.params.name.replace(/\/$/, '');

    var reqPost = posts.filter(function(p) {
        return p.get('date').getFullYear() == year
            && (p.get('date').getMonth()+1) == month
            && (p.get('cleanTitle')==title || p.get('oldUrl')==title);
    });

    if(reqPost.length) {
        getPostByID(reqPost[0].id, res);
    }else{
        getHomePage(res);
    }
});



app.get('/:name', function(req, res) {
    var t = req.params.name;
    if(t.length) {
        getPostByID(req.params.name, res);
    }else{
        getHomePage(res);
    }
});


               



app.listen(3000);