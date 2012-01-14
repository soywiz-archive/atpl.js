var StringReader = require('./StringReader.js').StringReader;
var Utils = require('./../Utils.js');

var ExpressionTokenizer = function(stringReader) {
	this.stringReader = stringReader;
};

ExpressionTokenizer.operators2 = [
	'++', '--', '&&', '||', '..', '//', '**',
];

ExpressionTokenizer.operators1 = [
	'+', '-', '*', '/', '%', '|', '(', ')',
	'{', '}', '[', ']', '.', ':', ',', '<', '>', '?',
];

ExpressionTokenizer.prototype.tokenize = function() {
	var tokens = [];
	
	function emitToken(type, value, rawValue) {
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
				emitToken('string', JSON.parse(value), value);
			break;
			default:
				// Numbers
				if (currentChar.match(/^\d$/)) {
					var result = this.stringReader.findRegexp(/^(0b[0-1]+|0x[0-9A-F]+|0[0-7]*|[1-9]\d*(\.\d+)?)/i);
					if (result.position !== 0) throw(new Error("Invalid numeric"));
					var value = this.stringReader.readChars(result.length);
					emitToken('number', Utils.interpretNumber(value), value);
				}
				else {
					var operatorIndex = -1;
					var current2Chars = this.stringReader.peekChars(2);
					// Found a 2 character operator.
					if (-1 != (operatorIndex = ExpressionTokenizer.operators2.indexOf(current2Chars))) {
						emitToken('operator', current2Chars);
						this.stringReader.skipChars(2);
					}
					// Found a 1 character operator.
					else if (-1 != (operatorIndex = ExpressionTokenizer.operators1.indexOf(currentChar))) {
						emitToken('operator', currentChar);
						this.stringReader.skipChars(1);
					}
					// An ID
					else if (currentChar.match(/^[a-z]$/i)) {
						var result = this.stringReader.findRegexp(/^[a-z]\w*/i);
						if (result.position !== 0) throw(new Error("Assertion failed! Not expected!"));
						var value = this.stringReader.readChars(result.length);
						emitToken('id', value);
					} else {
						this.stringReader.skipChars(1);
						throw(new Error("Unknown token '" + currentChar + "'"));
					}
				}
			break;
		}
	}
	
	//console.log(tokens);
	
	return tokens;
};

exports.ExpressionTokenizer = ExpressionTokenizer;
