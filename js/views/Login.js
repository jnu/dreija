define([
    'config',
    'jquery',
    'backbone',
],
function(Config, $, Backbone) {
    var v = Backbone.View.extend({
        tagName: 'div',
        id: 'login-modal',
        //
        children: [],
        loginCallback: function(){},
        cancelCallback: function(){},
        //
        initialize : function(attrs) {
            _.bindAll(this,
                'render', 'loginHandler', 'destroy', 'setError', 'noError');

            if(attrs.onLogin) {
                this.loginCallback = attrs.onLogin;
            }
            if(attrs.noLogin) {
                this.cancelCallback = attrs.noLogin;
            }

            this.render();
        },
        //
        loginHandler : function() {
            // Verify login with Couch
            var that = this,
                username = $('#username').val(),
                password = $('#password').val();

            
            Blog.auth(username, password, {
                success: function() {
                    // Fire logged-in event
                    $('body').trigger('login', {
                        type: 'login',
                        name: username
                    });

                    // Return
                    that.loginCallback(username);
                    that.$el.find('.modal').modal('hide');
                    that.$el.remove();
                    that.remove();
                },
                fail : function(r, user) {
                    that.setError("Can't log in: "+ r.statusText);
                }
            })
        },
        //
        destroy : function() {
            this.$el.find('.modal').modal('hide');
            this.$el.remove();
            this.remove();
            this.cancelCallback();
        },
        //
        setError : function(err) {
            this.$el.find('#err').html(err).show();
        },
        //
        noError : function() {
            this.$el.find('#err').html("").hide();
        },
        //
        render : function() {
            var that = this,
                scr = Blog.render('login', {});

            this.$el.html(scr);
            this.$el.appendTo('body');

            this.$el.find('#submit').click(function(){
                that.loginHandler();
            });

            this.$el.find('.exiter').click(function(){
                that.destroy()
            });

            this.$el.find('#err').hide();

            this.$el.find('.modal').modal({
                backdrop: 'static',
                show: true
            });

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