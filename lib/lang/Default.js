///<reference path='../imports.d.ts'/>
var DefaultTags = require('./DefaultTags');
var DefaultFunctions = require('./DefaultFunctions');
var DefaultFilters = require('./DefaultFilters');
var DefaultTests = require('./DefaultTests');
/**
 *
 */
function register(languageContext) {
    languageContext.registerTags(DefaultTags);
    languageContext.registerFunctions(DefaultFunctions);
    languageContext.registerFilters(DefaultFilters);
    languageContext.registerTests(DefaultTests);
    return languageContext;
}
exports.register = register;
