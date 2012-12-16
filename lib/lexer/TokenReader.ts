///<reference path='../imports.d.ts'/>

export import ExpressionTokenizer = module('./ExpressionTokenizer');

export class TokenReader {
	length: number;
	position: number;

	constructor(public tokens: ExpressionTokenizer.Token[]) {
		this.length = this.tokens.length;
		this.position = 0;
	}

	hasMore(): bool {
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

	checkAndMoveNext(values: string[]): string {
		var peekValue = this.peek().value;
		if (values.indexOf(peekValue) != -1) {
			this.skip(1);
			return peekValue;
		}
		return null;
	}

	expectAndMoveNext(values: string[]): string {
		var ret = this.checkAndMoveNext(values);
		if (ret === null) throw(new Error("Expected one of " + JSON.stringify(values) + " but get '" + this.peek().value + "'"));
		return ret;
	}
}