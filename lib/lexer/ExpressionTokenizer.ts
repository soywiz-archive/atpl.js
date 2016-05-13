///<reference path='../imports.d.ts'/>

import { StringReader } from './StringReader';
import { ITokenizer } from './ITokenizer';
import RuntimeUtils = require('../runtime/RuntimeUtils');

export interface Token {
	type: string;
	value: any;
	rawValue: any;
	stringOffset: any;
}

/**
 * ExpressionTokenizer
 */
export class ExpressionTokenizer implements ITokenizer {
	/**
	 * Creates a new ExpressionTokenizer.
	 */
	constructor(public stringReader: StringReader) {
	}

	private static operators3 = [
		'===', '!=='
	];

	private static operators2 = [
		'++', '--', '&&', '||', '..', '//', '**',
		'==', '>=', '<=', '!=', '?:'
	];

	private static operators1 = [
		'+', '-', '*', '/', '%', '|', '(', ')',
		'{', '}', '[', ']', '.', ':', ',', '<', '>', '?', '=', '~'
	];

	//static tokenizeString(string: string) {
	//	return tokenizeStringReader(new StringReader.StringReader(string));
	//}
	//
	//static tokenizeStringReader(stringReader: StringReader.StringReader) {
	//	return new ExpressionTokenizer(stringReader).tokenizeAll();
	//}

	/**
	 * Return a list of tokens.
	 *
	 * @return list of tokenized tokens.
	 */
	tokenizeAll(): Token[]{
		var tokens:Token[] = [];
		while (this.hasMore()) {
			var token = this.readNext();
			
			if (token.type == 'eof') break;

			//console.log(token);
			//if (token == null) break;
			tokens.push(token);
		}
		return tokens;
	}

	private eof = false;

	/**
	 *
	 */
	hasMore(): boolean {
		if (this.end) return false;
		//console.log(this.stringReader);
		//console.log(this.stringReader.hasMore());
		//console.log('[' + this.stringReader.peekChars(100) + ']');
		//console.log(this.stringReader.findRegexp(/^(\s*$|\-?[%\}]\})/));
		return this.stringReader.hasMore() && (this.stringReader.findRegexp(/^(\s*$|\-?[%\}]\})/).position != 0);
		//try {
		//	return this.eof;
		//} finally {
		//	if (this.stringReader.hasMore() && (this.stringReader.findRegexp(/^(\s*$|\-?[%\}]\})/).position != 0)) this.eof = true;
		//}
	}

	end = false;
	stringOffset: number = 0;

	private emitToken(type:any, rawValue:any, value?:any) {
		if (value === undefined) value = rawValue;
		//console.log("emitToken('" + type + "', '" + value + "')");
		return {
			type: type,
			value: value,
			rawValue: rawValue,
			stringOffset: this.stringOffset
		};
	}

	/**
	 *
	 */
	readNext(): Token {
		//this.end = false;
		while (!this.end && this.stringReader.hasMore()) {
			if (this.stringReader.findRegexp(/^\-?[%\}]\}/).position == 0) {
				this.end = true;
				continue;
			}

			this.stringOffset = this.stringReader.getOffset();
			var currentChar = this.stringReader.peekChars(1);
			//var token;
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
							return this.emitToken('string', value, value.substr(1, value.length - 2));
						} else {
							return this.emitToken('string', value, JSON.parse(value));
						}
					} catch (e) {
						throw (new Error("Can't parse [" + value + "]"));
					}
				default:
					// Numbers
					if (currentChar.match(/^\d$/)) {
						var result = this.stringReader.findRegexp(/^(0b[0-1]+|0x[0-9A-Fa-f]+|0[0-7]*|[1-9]\d*(\.\d+)?)/);
						if (result.position !== 0) throw (new Error("Invalid numeric"));
						var value = this.stringReader.readChars(result.length);
						return this.emitToken('number', value, RuntimeUtils.interpretNumber(value));
					}
					else {
						var operatorIndex = -1;
						var _parts: RegExpMatchArray;
						var currentChars = this.stringReader.peekChars(5);

						// Found a bit operator
						if (_parts = currentChars.match(/^(b-and|b-or|b-xor)/)) {
							var operator = _parts[0];
							try { return this.emitToken('operator', operator); } finally { this.stringReader.skipChars(operator.length); }
						}
						// Found a 3 character operator.
						else if (-1 != (operatorIndex = ExpressionTokenizer.operators3.indexOf(currentChars.substr(0, 3)))) {
							try { return this.emitToken('operator', currentChars.substr(0, 3)); } finally { this.stringReader.skipChars(3); }
						}
						// Found a 2 character operator.
						else if (-1 != (operatorIndex = ExpressionTokenizer.operators2.indexOf(currentChars.substr(0, 2)))) {
							try { return this.emitToken('operator', currentChars.substr(0, 2)); } finally { this.stringReader.skipChars(2); }
						}
							// Found a 1 character operator.
						else if (-1 != (operatorIndex = ExpressionTokenizer.operators1.indexOf(currentChar))) {
							try { return this.emitToken('operator', currentChar); } finally { this.stringReader.skipChars(1); }
						}
							// An ID
						else if (currentChar.match(/^[a-z_\$]$/i)) {
							var result = this.stringReader.findRegexp(/^[a-z_\$]\w*/i);
							if (result.position !== 0) throw (new Error("Assertion failed! Not expected!"));
							var value = this.stringReader.readChars(result.length);
							return this.emitToken('id', value);
						} else {
							this.stringReader.skipChars(1);
							throw (new Error("Unknown token '" + currentChar + "' in '" + this.stringReader.peekChars(10) + "'"));
						}
					}
				break;
			}
		}
	
		//console.log(tokens);
	
		return this.emitToken('eof', null);
		//return null;
	}
}
