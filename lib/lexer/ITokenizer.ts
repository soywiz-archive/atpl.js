///<reference path='../imports.d.ts'/>

import StringReader = module('./StringReader');

export interface ITokenizer {
	hasMore(): bool;
	readNext(): any;
	tokenizeAll();
	stringReader: StringReader.StringReader;
}
