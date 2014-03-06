///<reference path='../imports.d.ts'/>

import DefaultTags = require('./DefaultTags');
import DefaultFunctions = require('./DefaultFunctions');
import DefaultFilters = require('./DefaultFilters');
import DefaultTests = require('./DefaultTests');
import LanguageContext = require('../LanguageContext');

/**
 *
 */
export function register(languageContext: LanguageContext.LanguageContext): LanguageContext.LanguageContext {
	languageContext.registerTags(DefaultTags.DefaultTags);
	languageContext.registerFunctions(DefaultFunctions.DefaultFunctions);
	languageContext.registerFilters(DefaultFilters.DefaultFilters);
	languageContext.registerTests(DefaultTests.DefaultTests);
	return languageContext;
}
