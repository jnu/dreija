;
define([
    'config',
    'jquery',
    'backbone',
],
function(Config, $, Backbone) {
    var v = Backbone.View.extend({
        tagName: 'div',
        id: 'alert',
        attributes: {
            type: 'error',
            title: 'Alert',
            text: 'Something went wrong!',
            ok: function(){},
            cancel: function(){}
        },
        //
        initialize : function(attrs) {
            var that = this;
            _.bindAll(this, 'render', 'destroy');

            if(typeof attrs!='object') {
                attrs = {text: attrs};
            }

            $.extend(this.attributes, attrs);
            this.render();
        },
        //
        destroy : function() {
            this.$el.find('.modal').modal('hide');
            this.$el.remove();
            this.remove();
        },
        //
        render : function() {
            var that = this,
                alert = Blog.render('alert', this.attributes);

            this.$el.html(alert);
            
            this.$el.appendTo('body');
            this.$el.find('.exiter').click(this.destroy);

            this.$el.find('#ok').click(function(e){
                that.attributes.ok(true);
                that.destroy();
                return false;
            });

            if(this.attributes.type=='confirm') {
                this.$el.find('#cancel').click(function(e) {
                    that.attributes.cancel(e);
                    that.destroy();
                    return false;
                });
            }

            this.$el.find('.modal').modal('show');

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