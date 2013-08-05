define([
    'config',
    'jquery',
    'models/Page',
    'views/Login',
    'views/Alert',
    'backbone',
],
function(Config, $, Page, Login, Alert, Backbone) {
    var v = Backbone.View.extend({
        tagName: 'div',
        id: Config.contentEl,
        //
        children: [],
        //
        initialize : function(attrs) {
            _.bindAll(this, 'render');

            if(!this.model) {
                // model wasn't provided, so create a blank one
                this.model = new Page({
                    date: (new Date).toISOString(),
                    author: Config.author,
                    title: "[Post Title]",
                    content: "[Post Content]",
                    whichiwrote: "...",
                    id: Blog.getUUID(false)
                });
            }

            this.model.on('change', this.render);

            this.render();
        },
        //
        render: function() {
            var that=this,
                newPage = Blog.render('editPage', this.model.toJSON());

            this.$el.html(newPage);

            this.$el.find('[contenteditable="true"]').blur(function(){
                that.model.set($(this).attr('id'), $(this).html());
            });

            // Retry Saving the alert
            function _trySave(e) {
                var status = e.status || e.attributes.status || 200,
                    msg = e.statusText || e.attributes.statusText || "OK";

                if(status>=400 && status<404) {
                    var t = new Login({});
                    t.setError("Error: "+msg+". Log in and try again.");
                    that.children.push(t);
                }else if(status>=300) {
                    that.children.push(new Alert({
                        title: "Error!",
                        type: "error",
                        text: 'Error saving model: '+ msg
                    }));
                }else{
                    // refresh pages collection
                    Blog.pages.refresh();

                    // Make an alert
                    that.children.push(new Alert({
                        title: "Success!",
                        type: "success",
                        text: "Post saved!"
                    }));
                }
            }

            this.$el.find('#save').click(function() {
                that.model.save(null, {
                    success: _trySave
                });
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