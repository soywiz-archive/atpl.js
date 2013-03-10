///<reference path='../imports.d.ts'/>

export interface ITokenizer {
	hasMore(): bool;
	readNext(): any;
	tokenizeAll();
}
