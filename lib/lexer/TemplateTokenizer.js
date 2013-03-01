var StringReader = require('./StringReader')
var ExpressionTokenizer = require('./ExpressionTokenizer')
var TemplateTokenizer = (function () {
    function TemplateTokenizer(string) {
        this.string = string;
    }
    TemplateTokenizer.prototype.tokenize = function () {
        var _this = this;
        this.stringReader = new StringReader.StringReader(this.string);
        var tokens = [];
        var regExp = /\{[\{%#]-?/;
        var stringOffsetStart = 0;
        var stringOffsetEnd = 0;
        var emitToken = function (type, value, params) {
            if(type == 'text' && value == '') {
                return;
            }
            stringOffsetEnd = _this.stringReader.getOffset();
            tokens.push({
                type: type,
                value: value,
                params: params,
                offsetStart: stringOffsetStart,
                offsetEnd: stringOffsetEnd,
                rawText: _this.stringReader.getSlice(stringOffsetStart, stringOffsetEnd)
            });
            stringOffsetStart = stringOffsetEnd;
        };
        while(this.stringReader.hasMore()) {
            stringOffsetStart = this.stringReader.getOffset();
            var openMatch = this.stringReader.findRegexp(regExp);
            if(openMatch.position === null) {
                emitToken('text', this.stringReader.readLeft());
            } else {
                emitToken('text', this.stringReader.readChars(openMatch.position));
                var openChars3 = this.stringReader.readChars(openMatch.length);
                var openChars = openChars3.substr(0, 2);
                var removeSpacesBefore = (openChars3.substr(2, 1) == '-');
                var removeSpacesAfter;
                if(removeSpacesBefore) {
                    emitToken('trimSpacesBefore');
                }
                switch(openChars) {
                    case '{#':
                        var closeMatch = this.stringReader.findRegexp(/\-?#}/);
                        if(closeMatch.position === null) {
                            throw (new Error("Comment not closed!"));
                        }
                        this.stringReader.skipChars(closeMatch.position + closeMatch.length);
                        removeSpacesAfter = (closeMatch.length == 3);
                        break;
                    case '{{':
                    case '{%':
                        var expressionTokens = (new ExpressionTokenizer.ExpressionTokenizer(this.stringReader)).tokenize();
                        var peekMinus = this.stringReader.peekChars(1);
                        if(peekMinus == '-') {
                            this.stringReader.skipChars(1);
                        }
                        removeSpacesAfter = (peekMinus == '-');
                        var closeChars = this.stringReader.readChars(2);
                        if((openChars == '{{' && closeChars != '}}') || (openChars == '{%' && closeChars != '%}') || 0) {
                            throw (new Error('Open type was "' + openChars + '" but close type was "' + closeChars + '"'));
                        }
                        if(openChars == '{{') {
                            emitToken('expression', expressionTokens);
                        } else {
                            emitToken('block', expressionTokens);
                        }
                        break;
                    default:
                        throw (new Error('Unknown open type "' + openChars + '"!'));
                }
                if(removeSpacesAfter) {
                    emitToken('trimSpacesAfter');
                }
            }
        }
        return tokens;
    };
    return TemplateTokenizer;
})();
exports.TemplateTokenizer = TemplateTokenizer;
