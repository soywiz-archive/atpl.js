///<reference path='../imports.d.ts'/>

export import ExpressionTokenizer = module('./ExpressionTokenizer');

export class TokenReader {
	length: number;
	position: number;

	constructor(public tokens: ExpressionTokenizer.Token[]) {
		this.length = this.tokens.length;
		this.position = 0;
	}

	get hasMore(): bool {
		return this.getLeftCount() > 0;
	}

	getLeftCount(): number {
		return this.tokens.length - this.position;
	}

	peek(): ExpressionTokenizer.Token {
		if (this.position >= this.length) {
			return { type: 'eof', value: null, rawValue: null };
		}
		return this.tokens[this.position];
	}

	skip(count: number = 1): void {
		this.position += count;
	}

	read(): ExpressionTokenizer.Token {
		var item = this.peek();
		this.skip(1);
		return item;
	}

	checkAndMoveNext(value): bool {
		if (this.peek().value == value) {
			this.skip(1);
			return true;
		}
		return false;
	}

	expectAndMoveNext(value): void {
		if (!this.checkAndMoveNext(value)) throw(new Error("Expected '" + value + "' but get '" + this.peek().value + "'"));
	}
}