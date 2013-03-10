///<reference path='../imports.d.ts'/>

import StringReader        = module('./StringReader');
import ExpressionTokenizer = module('./ExpressionTokenizer');
import ITokenizer = module('./ITokenizer');

/*
export interface TemplateToken {
	type: string;
	value: string;
	params: any;
	offsetStart: number;
	offsetEnd: number;
	rawText: string;
}
*/

export class TemplateTokenizer implements ITokenizer {
	private stringReader: StringReader.StringReader;

	constructor(public string: string) {
		this.stringReader = new StringReader.StringReader(this.string);
	}

	hasMore(): bool {
		return this.stringReader.hasMore();
	}

	/**
	 * Return a list of tokens.
	 *
	 * @return list of tokenized tokens.
	 */
	tokenizeAll(): any[] {
		var tokens = [];
		while (this.hasMore()) {
			var token = this.readNext();
			//console.log(token);
			if (token === null) break;
			tokens.push(token);
		}
		return tokens;
	}

	tokens = <any[]>[];
	regExp = /\{[\{%#]-?/;
	stringOffsetStart = 0;
	stringOffsetEnd = 0;
	openMatch;
	openChars3;
	openChars;
	removeSpacesBefore;
	removeSpacesAfter;
	state = 0;

	private emitToken(type, value?, params?) {
		if (type == 'text' && value == '') return undefined;

		this.stringOffsetEnd = this.stringReader.getOffset();

		var token = {
			type: type,
			value: value,
			params: params,
			offsetStart: this.stringOffsetStart,
			offsetEnd: this.stringOffsetEnd,
			rawText: this.stringReader.getSlice(this.stringOffsetStart, this.stringOffsetEnd),
		};

		this.stringOffsetStart = this.stringOffsetEnd;

		return token;
	}

	readNext() {
		var token = undefined;
		while (true) {
			if (token !== undefined) return token;
			switch (this.state) {
				case 0:
					if (!this.stringReader.hasMore()) return null;

					this.stringOffsetStart = this.stringReader.getOffset();

					this.openMatch = this.stringReader.findRegexp(this.regExp);
					// No more tags.
					if (this.openMatch.position === null) {
						this.state = 0;
						token = this.emitToken('text', this.stringReader.readLeft());
					}
						// At least one more tag.
					else {
						this.state = 1;
						token = this.emitToken('text', this.stringReader.readChars(this.openMatch.position));
					}
					break;
				case 1:
					this.openChars3 = this.stringReader.readChars(this.openMatch.length);
					this.openChars = this.openChars3.substr(0, 2);
					this.removeSpacesBefore = (this.openChars3.substr(2, 1) == '-');
					this.removeSpacesAfter = undefined;

					this.state = 2;
					if (this.removeSpacesBefore) token = this.emitToken('trimSpacesBefore');
					break;
				case 2:
					this.state = 3;
					//if (openChars.length == 3)
					switch (this.openChars) {
						// A comment.
						case '{#':
							var closeMatch = this.stringReader.findRegexp(/\-?#}/);
							if (closeMatch.position === null) throw (new Error("Comment not closed!"));
							this.stringReader.skipChars(closeMatch.position + closeMatch.length);
							this.removeSpacesAfter = (closeMatch.length == 3);
							break;
						case '{{':
						case '{%':
							var expressionTokenizer = new ExpressionTokenizer.ExpressionTokenizer(new StringReader.StringReader(
								this.stringReader.getSliceWithCallback(() => {
									(new ExpressionTokenizer.ExpressionTokenizer(this.stringReader)).tokenizeAll();
								})
							));
							var peekMinus = this.stringReader.peekChars(1);
							if (peekMinus == '-') this.stringReader.skipChars(1);
							this.removeSpacesAfter = (peekMinus == '-');
							var closeChars = this.stringReader.readChars(2);
							if (
								(this.openChars == '{{' && closeChars != '}}') ||
								(this.openChars == '{%' && closeChars != '%}') ||
							0) {
								throw (new Error('Open type was "' + this.openChars + '" but close type was "' + closeChars + '"'));
							}
							if (this.openChars == '{{') {
								token = this.emitToken('expression', expressionTokenizer);
							} else {
								token = this.emitToken('block', expressionTokenizer);
							}
							break;
						default:
							throw (new Error('Unknown open type "' + this.openChars + '"!'));
					}
					break;
				case 3:
					if (this.removeSpacesAfter) token = this.emitToken('trimSpacesAfter');
					this.state = 0;
					break;
				default:
					throw (new Error("Invalid state"));
			}
		}

		return null;
	}
}
