define([
    'config',
    'jquery',
    'views/BareIndexLine',
    'backbone',
],
function(Config, $, IndexLine, Backbone) {
    var v = Backbone.View.extend({
        tagName: 'div',
        id: Config.contentEl,
        //
        children: [],
        //
        initialize : function(attrs) {
            _.bindAll(this, 'render');

            this.collection.comparator = function(m) {
                return ~~(m.get('status')=='published');
            }

            this.render();
        },
        //
        render: function() {
            var that = this,
                newPage = Blog.render('drafts', {
                    header : (function(){
                        var h = new IndexLine({
                            model: that.collection.first(),
                            header: true
                        });
                        that.children.push(h);
                        return h.el.innerHTML;
                    })(),
                    entries: this.collection
                        .sort()
                        .map(function(m) {
                            var t = new IndexLine({model: m});
                            that.children.push(t);
                            return t.el.innerHTML;
                    })
                });

            this.$el.html(newPage);

            this.trigger('rendered');

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