var DefaultTags = require('./DefaultTags')
var DefaultFunctions = require('./DefaultFunctions')

var DefaultTests = require('./DefaultTests')

function register(languageContext) {
    languageContext.registerTags(DefaultTags.DefaultTags);
    languageContext.registerFunctions(DefaultFunctions.DefaultFunctions);
    languageContext.registerFilters(DefaultFilters.DefaultFilters);
    languageContext.registerTests(DefaultTests.DefaultTests);
    return languageContext;
}
exports.register = register;
