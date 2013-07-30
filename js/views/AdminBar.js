define([
    'config',
    'views/Login',
    'jquery',
    'backbone',
],
function(Config, Login, $, Backbone) {
    var v = Backbone.View.extend({
        tagName: 'div',
        id: 'admin-bar',
        //
        children: [],
        //
        initialize : function(attrs) {
            var that = this;
            _.bindAll(this, 'render');

            // Add login logic
            var _login = new Login({
                onLogin: function(u) {
                    that.render();
                    that.$el.find('#login')
                        .html("Logged in as <strong>"+ u +"</strong>").show();
                },
                noLogin: function() {
                    that.remove();
                }
            });
        },
        //
        render : function() {
            var that=this,
                bar = Blog.render('adminbar', {});

            this.$el.html(bar);
            this.$el.appendTo('body');

            this.trigger('rendered');

            return this;
        },
        //
        toggleEditButton : function(show) {
            if(show) {
                this.$el.find('button#edit').show();
            }else{
                this.$el.find('button#edit').hide();
            }
        },
        //
        setActive : function(s) {
            this.$el
                .find("li>a")
                .parent()
                .toggleClass('active', false);

            this.$el
                .find("a[href*='"+s+"']:first")
                .parent()
                .toggleClass('active', true);
        },
        //
        remove: function() {
            // Reset the pages

            // Standard View.remove() stuff
            Backbone.View.prototype.remove.apply(this, arguments);
            _.each(this.children, function(v){ v.remove(); });
        }
    });

    return v; 
});