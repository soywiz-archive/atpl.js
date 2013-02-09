///<reference path='../imports.d.ts'/>

export class StringReader {
	position: number = 0;
	currentLine: number = 1;

	constructor(public string: string) {
	}

	hasMore() {
		return this.getLeftCount() > 0;
	}

	getLeftCount() {
		return this.string.length - this.position;
	}

	skipChars(count) {
		this.currentLine += this.string.substr(this.position, count).split("\n").length - 1;
		this.position    += count;
	}

	readLeft() {
		return this.readChars(this.getLeftCount());
	}

	peekChars(count) {
		return this.string.substr(this.position, count);
	}

	readChars(count) {
		var str = this.peekChars(count);
		this.skipChars(count);
		return str;
	}

	readChar() {
		return this.readChars(1);
	}

	findRegexp(regexp) {
		var match = this.string.substr(this.position).match(regexp);
		if (match === null) {
			return {
				position : null,
				length   : null,
			}
		} else {
			return {
				position : match['index'],
				length   : match[0].length,
			}
		}
	}
}
