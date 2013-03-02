///<reference path='../imports.d.ts'/>

import ExpressionTokenizer = module('./ExpressionTokenizer');

export class TokenReader {
	length: number;
	position: number;

	constructor(public tokens: ExpressionTokenizer.Token[]) {
		this.length = this.tokens.length;
		this.position = 0;
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

	hasMore(): bool {
		return this.getLeftCount() > 0;
	}

	getLeftCount(): number {
		return this.tokens.length - this.position;
	}

	peek(offset: number = 0): ExpressionTokenizer.Token {
		if (this.position + offset >= this.length) {
			return { type: 'eof', value: null, rawValue: null, stringOffset: this.length };
		}
		return this.tokens[this.position + offset];
	}

	skip(count: number = 1): void {
		this.position += count;
	}

	read(): ExpressionTokenizer.Token {
		var item = this.peek();
		this.skip(1);
		return item;
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
