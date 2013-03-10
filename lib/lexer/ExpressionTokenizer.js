
var ITokenizer = require('./ITokenizer')
var RuntimeUtils = require('../runtime/RuntimeUtils')
var ExpressionTokenizer = (function () {
    function ExpressionTokenizer(stringReader) {
        this.stringReader = stringReader;
        this.eof = false;
        this.end = false;
        this.stringOffset = 0;
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
            if(token.type == 'eof') {
                break;
            }
            tokens.push(token);
        }
        return tokens;
    };
    ExpressionTokenizer.prototype.hasMore = function () {
        if(this.end) {
            return false;
        }
        return this.stringReader.hasMore() && (this.stringReader.findRegexp(/^(\s*$|\-?[%\}]\})/).position != 0);
    };
    ExpressionTokenizer.prototype.emitToken = function (type, rawValue, value) {
        if(value === undefined) {
            value = rawValue;
        }
        return {
            type: type,
            value: value,
            rawValue: rawValue,
            stringOffset: this.stringOffset
        };
    };
    ExpressionTokenizer.prototype.readNext = function () {
        while(!this.end && this.stringReader.hasMore()) {
            if(this.stringReader.findRegexp(/^\-?[%\}]\}/).position == 0) {
                this.end = true;
                continue;
            }
            this.stringOffset = this.stringReader.getOffset();
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
                            return this.emitToken('string', value, value.substr(1, value.length - 2));
                        } else {
                            return this.emitToken('string', value, JSON.parse(value));
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
                        return this.emitToken('number', value, RuntimeUtils.interpretNumber(value));
                    } else {
                        var operatorIndex = -1;
                        var _parts;
                        var currentChars = this.stringReader.peekChars(5);
                        if(_parts = currentChars.match(/^(b-and|b-or|b-xor)/)) {
                            var operator = _parts[0];
                            try  {
                                return this.emitToken('operator', operator);
                            }finally {
                                this.stringReader.skipChars(operator.length);
                            }
                        } else if(-1 != (operatorIndex = ExpressionTokenizer.operators3.indexOf(currentChars.substr(0, 3)))) {
                            try  {
                                return this.emitToken('operator', currentChars.substr(0, 3));
                            }finally {
                                this.stringReader.skipChars(3);
                            }
                        } else if(-1 != (operatorIndex = ExpressionTokenizer.operators2.indexOf(currentChars.substr(0, 2)))) {
                            try  {
                                return this.emitToken('operator', currentChars.substr(0, 2));
                            }finally {
                                this.stringReader.skipChars(2);
                            }
                        } else if(-1 != (operatorIndex = ExpressionTokenizer.operators1.indexOf(currentChar))) {
                            try  {
                                return this.emitToken('operator', currentChar);
                            }finally {
                                this.stringReader.skipChars(1);
                            }
                        } else if(currentChar.match(/^[a-z_\$]$/i)) {
                            var result = this.stringReader.findRegexp(/^[a-z_\$]\w*/i);
                            if(result.position !== 0) {
                                throw (new Error("Assertion failed! Not expected!"));
                            }
                            var value = this.stringReader.readChars(result.length);
                            return this.emitToken('id', value);
                        } else {
                            this.stringReader.skipChars(1);
                            throw (new Error("Unknown token '" + currentChar + "' in '" + this.stringReader.peekChars(10) + "'"));
                            return this.emitToken('unknown', currentChar);
                        }
                    }
                    break;
            }
        }
        return this.emitToken('eof', null);
    };
    return ExpressionTokenizer;
})();
exports.ExpressionTokenizer = ExpressionTokenizer;
