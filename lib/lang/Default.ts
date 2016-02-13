///<reference path='../imports.d.ts'/>

import { DefaultTags } from './DefaultTags';
import { DefaultFunctions } from './DefaultFunctions';
import { DefaultFilters } from './DefaultFilters';
import { DefaultTests } from './DefaultTests';
import { LanguageContext } from '../LanguageContext';

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
