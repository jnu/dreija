/**
 * ContentActionsMixin
 */

'use strict';

var React = require('react');
var BlogActions = require('../actions/BlogActions');
var BlogConstants = require('../constants/BlogConstants');

// Create a mapping TYPE -> ACTION
var type = {
    STATIC: BlogConstants.resource.STATIC,
    POST: BlogConstants.resource.POST
};

var typeMethods = Object.create(null);

typeMethods[type.STATIC] = BlogConstants.actions.LOAD_STATIC_PAGE;
typeMethods[type.POST] = BlogConstants.actions.LOAD_POST;


var ContentActionsMixin = {

    loadContentFromDescriptor: function(contentDescriptor) {
        var type = typeMethods[contentDescriptor.type];
        BlogActions[type](contentDescriptor.id);
    }

};

module.exports = ContentActionsMixin;
