var StringReader = require('./StringReader')
var ExpressionTokenizer = require('./ExpressionTokenizer')

var TemplateTokenizer = (function () {
    function TemplateTokenizer(string) {
        this.string = string;
        this.tokens = [];
        this.regExp = /\{[\{%#]-?/;
        this.stringOffsetStart = 0;
        this.stringOffsetEnd = 0;
        this.state = 0;
        this.stringReader = new StringReader.StringReader(this.string);
    }
    TemplateTokenizer.prototype.hasMore = function () {
        return this.stringReader.hasMore();
    };
    TemplateTokenizer.prototype.tokenize = function () {
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
    TemplateTokenizer.prototype.emitToken = function (type, value, params) {
        if(type == 'text' && value == '') {
            return undefined;
        }
        this.stringOffsetEnd = this.stringReader.getOffset();
        var token = {
            type: type,
            value: value,
            params: params,
            offsetStart: this.stringOffsetStart,
            offsetEnd: this.stringOffsetEnd,
            rawText: this.stringReader.getSlice(this.stringOffsetStart, this.stringOffsetEnd)
        };
        this.stringOffsetStart = this.stringOffsetEnd;
        return token;
    };
    TemplateTokenizer.prototype.readNext = function () {
        var token = undefined;
        while(true) {
            if(token !== undefined) {
                return token;
            }
            switch(this.state) {
                case 0:
                    if(!this.stringReader.hasMore()) {
                        return null;
                    }
                    this.stringOffsetStart = this.stringReader.getOffset();
                    this.openMatch = this.stringReader.findRegexp(this.regExp);
                    if(this.openMatch.position === null) {
                        this.state = 0;
                        token = this.emitToken('text', this.stringReader.readLeft());
                    } else {
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
                    if(this.removeSpacesBefore) {
                        token = this.emitToken('trimSpacesBefore');
                    }
                    break;
                case 2:
                    this.state = 3;
                    switch(this.openChars) {
                        case '{#':
                            var closeMatch = this.stringReader.findRegexp(/\-?#}/);
                            if(closeMatch.position === null) {
                                throw (new Error("Comment not closed!"));
                            }
                            this.stringReader.skipChars(closeMatch.position + closeMatch.length);
                            this.removeSpacesAfter = (closeMatch.length == 3);
                            break;
                        case '{{':
                        case '{%':
                            var expressionTokens = (new ExpressionTokenizer.ExpressionTokenizer(this.stringReader)).tokenize();
                            var peekMinus = this.stringReader.peekChars(1);
                            if(peekMinus == '-') {
                                this.stringReader.skipChars(1);
                            }
                            this.removeSpacesAfter = (peekMinus == '-');
                            var closeChars = this.stringReader.readChars(2);
                            if((this.openChars == '{{' && closeChars != '}}') || (this.openChars == '{%' && closeChars != '%}') || 0) {
                                throw (new Error('Open type was "' + this.openChars + '" but close type was "' + closeChars + '"'));
                            }
                            if(this.openChars == '{{') {
                                token = this.emitToken('expression', expressionTokens);
                            } else {
                                token = this.emitToken('block', expressionTokens);
                            }
                            break;
                        default:
                            throw (new Error('Unknown open type "' + this.openChars + '"!'));
                    }
                    break;
                case 3:
                    if(this.removeSpacesAfter) {
                        token = this.emitToken('trimSpacesAfter');
                    }
                    this.state = 0;
                    break;
                default:
                    throw (new Error("Invalid state"));
            }
        }
        return null;
    };
    return TemplateTokenizer;
})();
exports.TemplateTokenizer = TemplateTokenizer;
