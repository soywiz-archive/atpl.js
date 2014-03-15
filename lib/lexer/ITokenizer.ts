///<reference path='../imports.d.ts'/>

import StringReader = require('./StringReader');

interface ITokenizer {
	hasMore(): boolean;
	readNext(): any;
	tokenizeAll();
	stringReader: StringReader;
}

export = ITokenizer;