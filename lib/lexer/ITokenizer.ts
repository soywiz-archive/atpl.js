///<reference path='../imports.d.ts'/>

import StringReader = require('./StringReader');

export interface ITokenizer {
	hasMore(): boolean;
	readNext(): any;
	tokenizeAll();
	stringReader: StringReader.StringReader;
}
