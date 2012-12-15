var TokenReader = require('../lexer/TokenReader')
var _TemplateTokenizer = require('../lexer/TemplateTokenizer')
var _RuntimeContext = require('../runtime/RuntimeContext')
var _FlowException = require('./FlowException')
var _TokenParserContext = require('./TokenParserContext')
var _ExpressionParser = require('./ExpressionParser')
var DefaultTags = require('../lang/tags/DefaultTags')
var TemplateTokenizer = _TemplateTokenizer.TemplateTokenizer;
var TokenParserContext = _TokenParserContext.TokenParserContext;
var RuntimeContext = _RuntimeContext.RuntimeContext;
var ExpressionParser = _ExpressionParser.ExpressionParser;
var FlowException = _FlowException.FlowException;
function debug(data) {
}
var TemplateParser = (function () {
    function TemplateParser(templateProvider) {
        this.templateProvider = templateProvider;
        this.registry = {
        };
        this.blockHandlers = {
        };
        DefaultTags.register(this);
    }
    TemplateParser.prototype.addStandardBlockHandlers = function () {
    };
    TemplateParser.prototype.addBlockFlowExceptionHandler = function (blockType) {
        this.addBlockHandler(blockType, function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
            throw (new FlowException(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader));
        });
    };
    TemplateParser.prototype.addBlockHandler = function (blockType, callback) {
        this.blockHandlers[blockType] = callback;
    };
    TemplateParser.prototype.compileAndRenderToString = function (path, scope) {
        if(scope === undefined) {
            scope = {
            };
        }
        var runtimeContext = new RuntimeContext(this, scope);
        this.compileAndRender(path, runtimeContext);
        return runtimeContext.output;
    };
    TemplateParser.prototype.compileAndRender = function (path, runtimeContext) {
        var template = new (this.compile(path).class)();
        template.render(runtimeContext);
        return template;
    };
    TemplateParser.prototype.getEvalCode = function (path) {
        if(this.registry[path] !== undefined) {
            return this.registry[path];
        }
        var content = this.templateProvider.getSync(path);
        var templateTokenizer = new TemplateTokenizer(content);
        var templateTokens = templateTokenizer.tokenize();
        var tokenParserContext = new TokenParserContext();
        try  {
            this.parseTemplateSync(tokenParserContext, new TokenReader.TokenReader(templateTokens));
        } catch (e) {
            if(e instanceof FlowException) {
                throw (new Error("Unexpected tag '" + e.blockType + "'"));
            }
            throw (e);
        }
        var blocks = tokenParserContext.blocksOutput;
        var output = '';
        output += 'CurrentTemplate = function() { };\n';
        output += 'CurrentTemplate.prototype.render = function(runtimeContext) { runtimeContext.setTemplate(this); this.__main(runtimeContext); };\n';
        for(var blockName in blocks) {
            var block = blocks[blockName];
            output += 'CurrentTemplate.prototype.' + blockName + ' = function(runtimeContext) {\n';
            output += 'var that = this;\n';
            output += block + "\n";
            output += '};\n';
        }
        debug(output);
        return {
            output: output,
            tokenParserContext: tokenParserContext
        };
    };
    TemplateParser.prototype.compile = function (path) {
        if(this.registry[path] === undefined) {
            var info = this.getEvalCode(path);
            var output = info.output;
            var tokenParserContext = info.tokenParserContext;
            var CurrentTemplate = undefined;
            eval(output);
            this.registry[path] = {
                output: output,
                class: CurrentTemplate
            };
        }
        return this.registry[path];
    };
    TemplateParser.prototype.parseTemplateSync = function (tokenParserContext, tokenReader) {
        while(tokenReader.hasMore) {
            var item = tokenReader.peek();
            debug('parseTemplateSync: ' + item.type);
            switch(item.type) {
                case 'text': {
                    item = tokenReader.read();
                    tokenParserContext.write('runtimeContext.write(' + JSON.stringify(String(item.value)) + ');');
                    break;

                }
                case 'expression': {
                    item = tokenReader.read();
                    this.parseTemplateExpressionSync(tokenParserContext, tokenReader, new TokenReader.TokenReader(item.value));
                    break;

                }
                case 'block': {
                    item = tokenReader.read();
                    this.parseTemplateBlockSync(tokenParserContext, tokenReader, new TokenReader.TokenReader(item.value));
                    break;

                }
                default: {
                    throw (new Error("Invalid item.type == '" + item.type + "'"));

                }
            }
        }
        return;
    };
    TemplateParser.prototype.parseTemplateExpressionSync = function (tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser(expressionTokenReader);
        tokenParserContext.write('runtimeContext.writeExpression(' + expressionParser.parseExpression().generateCode() + ');');
    };
    TemplateParser.prototype.parseTemplateBlockSync = function (tokenParserContext, templateTokenReader, expressionTokenReader) {
        var that = this;
        var blockTypeToken = expressionTokenReader.read();
        var blockType = blockTypeToken.value;
        if(blockTypeToken.type != 'id') {
            throw (new Error("Block expected a type as first token but found : " + JSON.stringify(blockTypeToken)));
        }
        debug('BLOCK: ' + blockType);
        var blockHandler = this.blockHandlers[blockType];
        if(blockHandler !== undefined) {
            return blockHandler(blockType, this, tokenParserContext, templateTokenReader, expressionTokenReader);
        }
        throw (new Error("Invalid block type '" + blockTypeToken.value + "'"));
    };
    return TemplateParser;
})();
exports.TemplateParser = TemplateParser;
