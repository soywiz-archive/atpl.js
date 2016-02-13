///<reference path='../imports.d.ts'/>

import { StringReader } from './StringReader';

export interface ITokenizer {
	hasMore(): boolean;
	readNext(): any;
	tokenizeAll(): void;
	stringReader: StringReader;
}
