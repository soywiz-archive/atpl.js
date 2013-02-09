///<reference path='../imports.d.ts'/>

import StringReader = module('./StringReader');
import utils = module('../utils');

export interface Token {
	type: string;
	value: any;
	rawValue: any;
}

export class ExpressionTokenizer {
	constructor(public stringReader: StringReader.StringReader) {
	}

	static operators3 = [
		'===', '!==',
	];

	static operators2 = [
		'++', '--', '&&', '||', '..', '//', '**',
		'==', '>=', '<=', '!=', '?:',
	];

	static operators1 = [
		'+', '-', '*', '/', '%', '|', '(', ')',
		'{', '}', '[', ']', '.', ':', ',', '<', '>', '?', '=', '~',
	];

	tokenize() {
		var tokens = [];
	
		function emitToken(type, value, rawValue?) {
			if (rawValue === undefined) rawValue = value;
			tokens.push({
				type     : type,
				value    : value,
				rawValue : rawValue,
			});
		};
	
		var end = false;

		while (!end && this.stringReader.hasMore()) {
			switch (this.stringReader.peekChars(2)) {
				case '%}':
				case '}}':
					end = true;
					continue;
			}
			var currentChar = this.stringReader.peekChars(1);
			//console.log(currentChar);
		
			switch (currentChar) {
				// Spaces: ignore.
				case ' ': case '\t': case '\r': case '\n': case '\v':
					this.stringReader.skipChars(1);
				break;
				// String:
				case '\'': case '"':
					//throw(new Error("Strings not implemented"));
					var result = this.stringReader.findRegexp(/^(["'])(?:(?=(\\?))\2.)*?\1/);
					if (result.position !== 0) throw(new Error("Invalid string"));
					var value = this.stringReader.readChars(result.length);
					try {
						if (value.charAt(0) == "'") {
							// @TODO: fix ' escape characters
							emitToken('string', value.substr(1, value.length - 2), value);
						} else {
							emitToken('string', JSON.parse(value), value);
						}
					} catch (e) {
						throw (new Error("Can't parse [" + value + "]"));
					}
				break;
				default:
					// Numbers
					if (currentChar.match(/^\d$/)) {
						var result = this.stringReader.findRegexp(/^(0b[0-1]+|0x[0-9A-F]+|0[0-7]*|[1-9]\d*(\.\d+)?)/i);
						if (result.position !== 0) throw(new Error("Invalid numeric"));
						var value = this.stringReader.readChars(result.length);
						emitToken('number', utils.interpretNumber(value), value);
					}
					else {
						var operatorIndex = -1;
						var current3Chars = this.stringReader.peekChars(3);
						var current2Chars = this.stringReader.peekChars(2);
						
						// Found a 3 character operator.
						if (-1 != (operatorIndex = ExpressionTokenizer.operators3.indexOf(current2Chars))) {
							emitToken('operator', current3Chars);
							this.stringReader.skipChars(3);
						}
						// Found a 2 character operator.
						else if (-1 != (operatorIndex = ExpressionTokenizer.operators2.indexOf(current2Chars))) {
							emitToken('operator', current2Chars);
							this.stringReader.skipChars(2);
						}
						// Found a 1 character operator.
						else if (-1 != (operatorIndex = ExpressionTokenizer.operators1.indexOf(currentChar))) {
							emitToken('operator', currentChar);
							this.stringReader.skipChars(1);
						}
						// An ID
						else if (currentChar.match(/^[a-z_\$]$/i)) {
							var result = this.stringReader.findRegexp(/^[a-z_\$]\w*/i);
							if (result.position !== 0) throw(new Error("Assertion failed! Not expected!"));
							var value = this.stringReader.readChars(result.length);
							emitToken('id', value);
						} else {
							this.stringReader.skipChars(1);
							throw(new Error("Unknown token '" + currentChar + "' in '" + this.stringReader.peekChars(10) + "'"));
						}
					}
				break;
			}
		}
	
		//console.log(tokens);
	
		return tokens;
	}
}
