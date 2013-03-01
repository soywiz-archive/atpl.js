///<reference path='../imports.d.ts'/>

import StringReader        = module('./StringReader');
import ExpressionTokenizer = module('./ExpressionTokenizer');

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

export class TemplateTokenizer {
	private stringReader: StringReader.StringReader;

	constructor(public string: string) {
	}

	tokenize() {
		this.stringReader = new StringReader.StringReader(this.string);

		var tokens = <any[]>[];
		var regExp = /\{[\{%#]-?/;
		var stringOffsetStart = 0;
		var stringOffsetEnd = 0;

		var emitToken = (type, value?, params?) => {
			if (type == 'text' && value == '') return;

			stringOffsetEnd = this.stringReader.getOffset();

			tokens.push({
				type  : type,
				value: value,
				params: params,
				offsetStart: stringOffsetStart,
				offsetEnd: stringOffsetEnd,
				rawText: this.stringReader.getSlice(stringOffsetStart, stringOffsetEnd),
			});

			stringOffsetStart = stringOffsetEnd;
		};
	
		while (this.stringReader.hasMore()) {
			stringOffsetStart = this.stringReader.getOffset();

			var openMatch = this.stringReader.findRegexp(regExp);
			// No more tags.
			if (openMatch.position === null) {
				emitToken('text', this.stringReader.readLeft());
			}
			// At least one more tag.
			else {
				emitToken('text', this.stringReader.readChars(openMatch.position));
				var openChars3 = this.stringReader.readChars(openMatch.length);
				var openChars = openChars3.substr(0, 2);
				var removeSpacesBefore = (openChars3.substr(2, 1) == '-');
				var removeSpacesAfter;

				if (removeSpacesBefore) emitToken('trimSpacesBefore');

				//if (openChars.length == 3)
				switch (openChars) {
					// A comment.
					case '{#':
						var closeMatch = this.stringReader.findRegexp(/\-?#}/);
						if (closeMatch.position === null) throw(new Error("Comment not closed!"));
						this.stringReader.skipChars(closeMatch.position + closeMatch.length);
						removeSpacesAfter = (closeMatch.length == 3);
					break;
					case '{{':
					case '{%':
						var expressionTokens = (new ExpressionTokenizer.ExpressionTokenizer(this.stringReader)).tokenize();
						var peekMinus = this.stringReader.peekChars(1);
						if (peekMinus == '-') this.stringReader.skipChars(1);
						removeSpacesAfter = (peekMinus == '-');
						var closeChars = this.stringReader.readChars(2);
						if (
							(openChars == '{{' && closeChars != '}}') ||
							(openChars == '{%' && closeChars != '%}') ||
						0) {
							throw(new Error('Open type was "' + openChars +'" but close type was "' + closeChars + '"'));
						}
						if (openChars == '{{') {
							emitToken('expression', expressionTokens);
						} else {
							emitToken('block', expressionTokens);
						}
					break;
					default:
						throw(new Error('Unknown open type "' + openChars + '"!'));
				}

				if (removeSpacesAfter) emitToken('trimSpacesAfter');
			}
		}
		//console.log(tokens);
		return tokens;
	};
}
