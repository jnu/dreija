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
        _rendered : false,
        //
        initialize : function(attrs) {
            var that = this;

            _.bindAll(this,
                'render', 'loginHandler', 'loginSuccess',
                'destroy', 'setError', 'noError');

            if(attrs.onLogin) {
                this.loginCallback = attrs.onLogin;
            }
            if(attrs.noLogin) {
                this.cancelCallback = attrs.noLogin;
            }

            Blog.checkAuth({
                success: function(userCtx) {
                    // Currently logged in: execute loginHandler
                    that.loginSuccess(userCtx.name, true);
                },
                error: function(d) {
                    // Not currently logged in
                    that.render();
                }
            });
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
                    that.loginSuccess(username);
                },
                fail : function(r, user) {
                    that.setError("Can't log in: "+ r.statusText);
                }
            })
        },
        //
        loginSuccess : function(username, continuation) {
            if(!continuation) {
                // Continuation means that the login was verified from
                // a cookie rather than being verified with a username and 
                // password verified by the server.
                // Don't fire new login events when verifying with a cookie.
                $('body').trigger('login', {
                    type: 'login',
                    name: username
                });
            }

            // Return
            this.loginCallback(username);

            if(this._rendered) {
                this.$el.find('.modal').modal('hide');
                this.$el.remove();
            }
            this.remove();
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

            this._rendered = true;
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