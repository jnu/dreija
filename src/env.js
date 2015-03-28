/**
 * Environment information
 */

'use strict';

var ExecutionEnvironment  = require('react/lib/ExecutionEnvironment');

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Elementals
//
// Use the following checks as axioms of more complicated checks
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var canUseDOM = ExecutionEnvironment.canUseDOM;
var canUseWindow = typeof window !== 'undefined';

// Composite checks
var canUseConsole = canUseWindow && !!window.console;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Exports
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Environment contents
 * @type {Object}
 */
var env = {

    /**
     * Whether transitions work in this environment / make sense.
     * @type {Boolean}
     */
    canTransition: canUseDOM,

    /**
     * Whether console is available
     * XXX might rather have isomorphic logger
     * @type {Boolean}
     */
    hasNativeConsole: canUseConsole

};

module.exports = env;
