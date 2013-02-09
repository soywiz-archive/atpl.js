///<reference path='../imports.d.ts'/>
var StringReader = require('./StringReader')
var ExpressionTokenizer = require('./ExpressionTokenizer')
var TemplateTokenizer = (function () {
    function TemplateTokenizer(string) {
        this.string = string;
    }
    TemplateTokenizer.prototype.tokenize = function () {
        this.stringReader = new StringReader.StringReader(this.string);
        var tokens = [];
        var regExp = /\{[\{%#]/;
        var emitToken = function (type, value) {
            if(type == 'text' && value == '') {
                return;
            }
            tokens.push({
                type: type,
                value: value
            });
        };
        while(this.stringReader.hasMore()) {
            var openMatch = this.stringReader.findRegexp(regExp);
            // No more tags.
            if(openMatch.position === null) {
                emitToken('text', this.stringReader.readLeft());
            } else// At least one more tag.
             {
                emitToken('text', this.stringReader.readChars(openMatch.position));
                var openChars = this.stringReader.readChars(openMatch.length);
                switch(openChars) {
                    case // A comment.
                    '{#':
                        var closeMatch = this.stringReader.findRegexp(/#}/);
                        if(closeMatch.position === null) {
                            throw (new Error("Comment not closed!"));
                        }
                        this.stringReader.skipChars(closeMatch.position + closeMatch.length);
                        break;
                    case '{{':
                    case '{%':
                        var expressionTokens = (new ExpressionTokenizer.ExpressionTokenizer(this.stringReader)).tokenize();
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
            }
        }
        //console.log(tokens);
        return tokens;
    };
    return TemplateTokenizer;
})();
exports.TemplateTokenizer = TemplateTokenizer;
//@ sourceMappingURL=TemplateTokenizer.js.map
