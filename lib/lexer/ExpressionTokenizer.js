
var ITokenizer = require('./ITokenizer')
var RuntimeUtils = require('../runtime/RuntimeUtils')
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
    ExpressionTokenizer.prototype.tokenizeAll = function () {
        var tokens = [];
        while(this.hasMore()) {
            var token = this.readNext();
            if(token === null) {
                break;
            }
            tokens.push(token);
        }
        return tokens;
    };
    ExpressionTokenizer.prototype.hasMore = function () {
        return this.stringReader.hasMore() && (this.stringReader.findRegexp(/^\-?[%\}]\}/).position != 0);
    };
    ExpressionTokenizer.prototype.readNext = function () {
        var stringOffset = 0;
        function emitToken(type, rawValue, value) {
            if(value === undefined) {
                value = rawValue;
            }
            return {
                type: type,
                value: value,
                rawValue: rawValue,
                stringOffset: stringOffset
            };
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
            var token;
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
                            return emitToken('string', value, value.substr(1, value.length - 2));
                        } else {
                            return emitToken('string', value, JSON.parse(value));
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
                        return emitToken('number', value, RuntimeUtils.interpretNumber(value));
                    } else {
                        var operatorIndex = -1;
                        var _parts;
                        var currentChars = this.stringReader.peekChars(5);
                        if(_parts = currentChars.match(/^(b-and|b-or|b-xor)/)) {
                            token = emitToken('operator', _parts[0]);
                            this.stringReader.skipChars(_parts[0].length);
                            return token;
                        } else if(-1 != (operatorIndex = ExpressionTokenizer.operators3.indexOf(currentChars.substr(0, 3)))) {
                            token = emitToken('operator', currentChars.substr(0, 3));
                            this.stringReader.skipChars(3);
                            return token;
                        } else if(-1 != (operatorIndex = ExpressionTokenizer.operators2.indexOf(currentChars.substr(0, 2)))) {
                            token = emitToken('operator', currentChars.substr(0, 2));
                            this.stringReader.skipChars(2);
                            return token;
                        } else if(-1 != (operatorIndex = ExpressionTokenizer.operators1.indexOf(currentChar))) {
                            token = emitToken('operator', currentChar);
                            this.stringReader.skipChars(1);
                            return token;
                        } else if(currentChar.match(/^[a-z_\$]$/i)) {
                            var result = this.stringReader.findRegexp(/^[a-z_\$]\w*/i);
                            if(result.position !== 0) {
                                throw (new Error("Assertion failed! Not expected!"));
                            }
                            var value = this.stringReader.readChars(result.length);
                            return emitToken('id', value);
                        } else {
                            this.stringReader.skipChars(1);
                            throw (new Error("Unknown token '" + currentChar + "' in '" + this.stringReader.peekChars(10) + "'"));
                            return emitToken('unknown', currentChar);
                        }
                    }
                    break;
            }
        }
        return null;
    };
    return ExpressionTokenizer;
})();
exports.ExpressionTokenizer = ExpressionTokenizer;
