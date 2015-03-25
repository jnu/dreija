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
    canTransition: canUseDOM

};

module.exports = env;
