///<reference path='../imports.d.ts'/>

export class TokenReader {
	length: number;
	position: number;

	constructor(public tokens) {
		this.length = this.tokens.length;
		this.position = 0;
	}

	hasMore() {
		return this.getLeftCount() > 0;
	}

	getLeftCount() {
		return this.tokens.length - this.position;
	}

	peek() {
		if (this.position >= this.length) {
			return { type: 'eof', value: null };
		}
		return this.tokens[this.position];
	}

	skip(count) {
		if (count === undefined) count = 1;
		this.position += count;
	}

	read() {
		var item = this.peek();
		this.skip(1);
		return item;
	}

	checkAndMoveNext(value) {
		if (this.peek().value == value) {
			this.skip(1);
			return true;
		}
		return false;
	}

	expectAndMoveNext(value) {
		if (!this.checkAndMoveNext(value)) throw(new Error("Expected '" + value + "' but get '" + this.peek().value + "'"));
	}
}