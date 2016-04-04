///<reference path='../imports.d.ts'/>
"use strict";
var DefaultTags_1 = require('./DefaultTags');
var DefaultFunctions_1 = require('./DefaultFunctions');
var DefaultFilters_1 = require('./DefaultFilters');
var DefaultTests_1 = require('./DefaultTests');
/**
 *
 */
function register(languageContext) {
    languageContext.registerTags(DefaultTags_1.DefaultTags);
    languageContext.registerFunctions(DefaultFunctions_1.DefaultFunctions);
    languageContext.registerFilters(DefaultFilters_1.DefaultFilters);
    languageContext.registerTests(DefaultTests_1.DefaultTests);
    return languageContext;
}
exports.register = register;
