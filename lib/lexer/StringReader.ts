///<reference path='../imports.d.ts'/>

/**
 * StringReader
 */
export class StringReader {
	position: number = 0;
	currentLine: number = 1;

	/**
	 * Creates a StringReader with a string.
	 *
	 * @param string String to read.
	 */
	constructor(public string: string) {
	}

	/**
	 * Gets the position.
	 */
	getOffset() {
		return this.position;
	}

	getSlice(start, end) {
		return this.string.substr(start, end - start);
	}

	getSliceWithCallback(callback: () => void) {
		var start = this.getOffset();
		callback();
		var end = this.getOffset();
		return this.getSlice(start, end);
	}

	/**
	 * Determines if the stream has more characters to read.
	 */
	hasMore() {
		return this.getLeftCount() > 0;
	}

	/**
	 * Obtains the number of characters remaining in the stream.
	 */
	getLeftCount() {
		return this.string.length - this.position;
	}

	/**
	 * Skips reading some characters.
	 *
	 * @param count Number of characters to skip
	 */
	skipChars(count) {
		this.currentLine += this.string.substr(this.position, count).split("\n").length - 1;
		this.position    += count;
	}

	/**
	 * Read all the remaining characters as a string.
	 */
	readLeft() {
		return this.readChars(this.getLeftCount());
	}

	/**
	 * Peeks a number of characters allowing them to be readed after.
	 *
	 * @param count Number of characters to peek.
	 */
	peekChars(count) {
		return this.string.substr(this.position, count);
	}

	/**
	 * Reads a number of characters as a string.
	 *
	 * @param count Number of characters to read.
	 */
	readChars(count) {
		var str = this.peekChars(count);
		this.skipChars(count);
		return str;
	}

	/**
	 * Reads a single character as a string.
	 */
	readChar() {
		return this.readChars(1);
	}

	/**
	 * Locates a regular expression in the remaining characters.
	 * Returns the position and length of the match.
	 *
	 * @param regexp Regular expression to find
	 */
	findRegexp(regexp: RegExp) {
		var match = this.string.substr(this.position).match(regexp);
		if (match === null) {
			return {
				position : null,
				length   : null
			}
		} else {
			return {
				position : match['index'],
				length   : match[0].length
			}
		}
	}
}
