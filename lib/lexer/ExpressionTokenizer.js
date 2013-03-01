var StringReader = require('./StringReader')
var utils = require('../utils')
var ExpressionTokenizer = (function () {
    function ExpressionTokenizer(stringReader) {
        this.stringReader = stringReader;
    }
    ExpressionTokenizer.operators3 = [
        '===', 
        '!==', 
        
    ];
    ExpressionTokenizer.operators2 = [
        '++', 
        '--', 
        '&&', 
        '||', 
        '..', 
        '//', 
        '**', 
        '==', 
        '>=', 
        '<=', 
        '!=', 
        '?:', 
        
    ];
    ExpressionTokenizer.operators1 = [
        '+', 
        '-', 
        '*', 
        '/', 
        '%', 
        '|', 
        '(', 
        ')', 
        '{', 
        '}', 
        '[', 
        ']', 
        '.', 
        ':', 
        ',', 
        '<', 
        '>', 
        '?', 
        '=', 
        '~', 
        
    ];
    ExpressionTokenizer.tokenizeString = function tokenizeString(string) {
        return ExpressionTokenizer.tokenizeStringReader(new StringReader.StringReader(string));
    };
    ExpressionTokenizer.tokenizeStringReader = function tokenizeStringReader(stringReader) {
        return new ExpressionTokenizer(stringReader).tokenize();
    };
    ExpressionTokenizer.prototype.tokenize = function () {
        var tokens = [];
        var stringOffset = 0;
        function emitToken(type, rawValue, value) {
            if(value === undefined) {
                value = rawValue;
            }
            tokens.push({
                type: type,
                value: value,
                rawValue: rawValue,
                stringOffset: stringOffset
            });
        }
        ;
        var end = false;
        while(!end && this.stringReader.hasMore()) {
            if(this.stringReader.findRegexp(/^\-?[%\}]\}/).position == 0) {
                end = true;
                continue;
            }
            stringOffset = this.stringReader.getOffset();
            var currentChar = this.stringReader.peekChars(1);
            switch(currentChar) {
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                case '\v':
                    this.stringReader.skipChars(1);
                    break;
                case '\'':
                case '"':
                    var result = this.stringReader.findRegexp(/^(["'])(?:(?=(\\?))\2.)*?\1/);
                    if(result.position !== 0) {
                        throw (new Error("Invalid string"));
                    }
                    var value = this.stringReader.readChars(result.length);
                    try  {
                        if(value.charAt(0) == "'") {
                            emitToken('string', value, value.substr(1, value.length - 2));
                        } else {
                            emitToken('string', value, JSON.parse(value));
                        }
                    } catch (e) {
                        throw (new Error("Can't parse [" + value + "]"));
                    }
                    break;
                default:
                    if(currentChar.match(/^\d$/)) {
                        var result = this.stringReader.findRegexp(/^(0b[0-1]+|0x[0-9A-Fa-f]+|0[0-7]*|[1-9]\d*(\.\d+)?)/);
                        if(result.position !== 0) {
                            throw (new Error("Invalid numeric"));
                        }
                        var value = this.stringReader.readChars(result.length);
                        emitToken('number', value, utils.interpretNumber(value));
                    } else {
                        var operatorIndex = -1;
                        var current3Chars = this.stringReader.peekChars(3);
                        var current2Chars = this.stringReader.peekChars(2);
                        if(-1 != (operatorIndex = ExpressionTokenizer.operators3.indexOf(current2Chars))) {
                            emitToken('operator', current3Chars);
                            this.stringReader.skipChars(3);
                        } else if(-1 != (operatorIndex = ExpressionTokenizer.operators2.indexOf(current2Chars))) {
                            emitToken('operator', current2Chars);
                            this.stringReader.skipChars(2);
                        } else if(-1 != (operatorIndex = ExpressionTokenizer.operators1.indexOf(currentChar))) {
                            emitToken('operator', currentChar);
                            this.stringReader.skipChars(1);
                        } else if(currentChar.match(/^[a-z_\$]$/i)) {
                            var result = this.stringReader.findRegexp(/^[a-z_\$]\w*/i);
                            if(result.position !== 0) {
                                throw (new Error("Assertion failed! Not expected!"));
                            }
                            var value = this.stringReader.readChars(result.length);
                            emitToken('id', value);
                        } else {
                            this.stringReader.skipChars(1);
                            throw (new Error("Unknown token '" + currentChar + "' in '" + this.stringReader.peekChars(10) + "'"));
                        }
                    }
                    break;
            }
        }
        return tokens;
    };
    return ExpressionTokenizer;
})();
exports.ExpressionTokenizer = ExpressionTokenizer;
