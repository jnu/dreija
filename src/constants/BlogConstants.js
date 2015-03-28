/**
 * Blog Constants
 */

'use strict';

var BlogConstants = {
    LOAD_PAGE: 'LOAD_PAGE',
    LOAD_PAGE_SUCCESS: 'LOAD_PAGE:success',
    LOAD_PAGE_FAIL: 'LOAD_PAGE:fail',
    actions: {
        PRELOAD_POST: 'preloadPost',
        LOAD_POST: 'loadPost',
        PRELOAD_STATIC_PAGE: 'preloadStaticPage',
        LOAD_STATIC_PAGE: 'loadStaticPage'
    },
    resource: {
        STATIC: 'static',
        POST: 'post'
    }
};

module.exports = BlogConstants;
