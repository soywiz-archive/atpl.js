import DefaultTags = module('./DefaultTags');
import DefaultFunctions = module('./DefaultFunctions');
import DefaultFilters = module('./DefaultFilters');
import DefaultTests = module('./DefaultTests');
export import LanguageContext = module('../LanguageContext');

export function register(languageContext: LanguageContext.LanguageContext): LanguageContext.LanguageContext {
	languageContext.registerTags(DefaultTags.DefaultTags);
	languageContext.registerFunctions(DefaultFunctions.DefaultFunctions);
	languageContext.registerFilters(DefaultFilters.DefaultFilters);
	languageContext.registerTests(DefaultTests.DefaultTests);
	return languageContext;
}