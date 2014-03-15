///<reference path='../imports.d.ts'/>

import DefaultTags = require('./DefaultTags');
import DefaultFunctions = require('./DefaultFunctions');
import DefaultFilters = require('./DefaultFilters');
import DefaultTests = require('./DefaultTests');
import LanguageContext = require('../LanguageContext');

/**
 *
 */
export function register(languageContext: LanguageContext): LanguageContext {
	languageContext.registerTags(DefaultTags);
	languageContext.registerFunctions(DefaultFunctions);
	languageContext.registerFilters(DefaultFilters);
    languageContext.registerTests(DefaultTests);
    return languageContext;
}
