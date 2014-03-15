///<reference path='../imports.d.ts'/>

import ExpressionTokenizer = require('./ExpressionTokenizer');
import ITokenizer = require('./ITokenizer');

class TokenReader {
	//private length: number;
	private position: number;
	private tokens: ExpressionTokenizer.Token[] = [];
	private eof: boolean = false;

	constructor(public tokenizer: ITokenizer) {
		//this.tokens = tokenizer.tokenizeAll();
		//this.length = this.tokens.length;
		this.position = 0;
	}

	private readToken() {
		//if (!this.hasMore()) return false;
		if (!this.tokenizer.hasMore()) return false;
		this.tokens.push(this.tokenizer.readNext());
		return true;
	}

	getOffset(): number {
		return this.position;
	}

	getSlice(start: number, end: number): ExpressionTokenizer.Token[] {
		return this.tokens.slice(start, end);
	}

	getSliceWithCallback(readCallback: () => void ): ExpressionTokenizer.Token[] {
		var start = this.getOffset();
		readCallback();
		var end = this.getOffset();
		return this.getSlice(start, end);
	}

	hasMore(): boolean {
		if (this.position < this.tokens.length) return true;
		return this.tokenizer.hasMore();
	}

	peek(offset: number = 0): ExpressionTokenizer.Token {
		while (this.tokens.length <= this.position + offset) {
			if (!this.readToken()) return { type: 'eof', value: null, rawValue: null, stringOffset: -1 };
		}
		return this.tokens[this.position + offset];
	}

	skip(count: number = 1): void {
		this.position += count;
	}

	read(): ExpressionTokenizer.Token {
		try {
			return this.peek();
		} finally {
			this.skip(1);
		}
	}

	checkAndMoveNext(values: string[]): string {
		var peekValue = this.peek().value;
		if (values.indexOf(peekValue) != -1) {
			this.skip(1);
			return peekValue;
		}
		return undefined;
	}

	checkAndMoveNextMultiToken(values: string[]): string {
		var peekValue1 = this.peek(0).value;
		var peekValue2 = peekValue1 + ' ' + this.peek(1).value;

		if (values.indexOf(peekValue2) != -1) {
			this.skip(2);
			return peekValue2;
		}

		if (values.indexOf(peekValue1) != -1) {
			this.skip(1);
			return peekValue1;
		}

		return undefined;
	}

	expectAndMoveNext(values: string[]): string {
		var ret = this.checkAndMoveNext(values);
		//var hasNull = values.indexOf(null) != -1;
		if (ret === undefined) throw(new Error("Expected one of " + JSON.stringify(values) + " but get '" + this.peek().value + "'"));
		return ret;
	}
}

export = TokenReader;