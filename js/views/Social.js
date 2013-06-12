define([
    'jquery',
    'backbone'
],
function($, Backbone) {
    
    var v = Backbone.View.extend({
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
    });

    return v;
});