define([
    'config',
    'jquery',
    'backbone',
    'views/IndexLine'
],
function(Config, $, Backbone, IndexLine) {

    var v = Backbone.View.extend({
        tagName: 'div',
        id: Config.contentEl,
        //
        initialize : function(attrs) {
            var that = this;
            _.bindAll(this, 'render');
            this.children = [];
        },
        //
        render: function() {
            var that = this,
                sortedPosts = this.collection.sort(),
                pageCtr = 0;

            sortedPosts.forEach(function(currentPost, i) {
                if(currentPost.get('type')=='progress') {
                    return;
                }

                // Add a new IndexLine for the current post
                var date = currentPost.get('date', null);
                if(date && !(date instanceof Date)) {
                    date = new Date(date);
                }

                var newPostILV = new IndexLine({
                    properties: {
                        model: currentPost,
                        numId: i,
                        fNum: i+1,
                        link : Blog.wp.createPermalink(currentPost, 'post'),
                        date : date,
                        category: currentPost.get('category', 'Uncategorized'),
                        snippet: currentPost.get('snippet')||Config.Lorem(500),
                        title : currentPost.get('title'),
                        sprite: currentPost.get('sprite', "0 0"),
                        type: 'post'
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
    
    return v;
});