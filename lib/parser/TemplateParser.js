var _TemplateTokenizer = require('../lexer/TemplateTokenizer')
var _TokenReader = require('../lexer/TokenReader')
var _RuntimeContext = require('../runtime/RuntimeContext')
var _FlowException = require('./FlowException')
var _TokenParserContext = require('./TokenParserContext')
var _ExpressionParser = require('./ExpressionParser')
var TemplateTokenizer = _TemplateTokenizer.TemplateTokenizer;
var TokenReader = _TokenReader.TokenReader;
var TokenParserContext = _TokenParserContext.TokenParserContext;
var RuntimeContext = _RuntimeContext.RuntimeContext;
var ExpressionParser = _ExpressionParser.ExpressionParser;
var FlowException = _FlowException.FlowException;
function debug(data) {
}
var TemplateParser = (function () {
    function TemplateParser(templateProvider) {
        this.templateProvider = templateProvider;
        this.addStandardBlockHandlers();
    }
    TemplateParser.prototype.addStandardBlockHandlers = function () {
        this.addBlockFlowExceptionHandler('else');
        this.addBlockFlowExceptionHandler('elseif');
        this.addBlockFlowExceptionHandler('endif');
        this.addBlockHandler('if', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
            var didElse = false;
            var done = false;
            var expressionParser = new ExpressionParser(expressionTokenReader);
            var expressionNode = expressionParser.parseExpression();
            tokenParserContext.write('if (' + expressionNode.generateCode() + ') {');
            while(!done) {
                try  {
                    templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
                } catch (e) {
                    if(!(e instanceof FlowException)) {
                        throw (e);
                    }
                    switch(e.blockType) {
                        case 'else': {
                            if(didElse) {
                                throw (new Error("Can't have two 'else'"));
                            }
                            tokenParserContext.write('} else {');
                            didElse = true;
                            break;

                        }
                        case 'endif': {
                            tokenParserContext.write('}');
                            done = true;
                            break;

                        }
                        default: {
                            throw (new Error("Unexpected '" + e.blockType + "'"));

                        }
                    }
                }
            }
        });
        this.addBlockFlowExceptionHandler('endblock');
        this.addBlockHandler('block', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
            var blockName = 'block_' + expressionTokenReader.read().value;
            tokenParserContext.setBlock(blockName, function () {
                try  {
                    templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
                } catch (e) {
                    if(!(e instanceof FlowException)) {
                        throw (e);
                    }
                    switch(e.blockType) {
                        case 'endblock': {
                            break;

                        }
                        default: {
                            throw (new Error("Unexpected '" + e.blockType + "'"));

                        }
                    }
                }
            });
            tokenParserContext.write('this.' + (blockName) + '(runtimeContext);');
        });
        this.addBlockHandler('extends', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
            tokenParserContext.parentName = expressionTokenReader.read().value;
        });
        this.addBlockFlowExceptionHandler('endfor');
        this.addBlockHandler('for', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
            var expressionParser = new ExpressionParser(expressionTokenReader);
            var nodeId = expressionParser.parseIdentifier();
            expressionTokenReader.expectAndMoveNext('in');
            var nodeList = expressionParser.parseExpression();
            tokenParserContext.write('runtimeContext.createScope((function() { var k, list = ' + nodeList.generateCode() + '; for (k in list) { ' + nodeId.generateCode() + ' = list[k];');
            try  {
                templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
            } catch (e) {
                if(!(e instanceof FlowException)) {
                    throw (e);
                }
                switch(e.blockType) {
                    case 'endfor': {
                        tokenParserContext.write('} }));');
                        break;

                    }
                    default: {
                        throw (new Error("Unexpected '" + e.blockType + "'"));

                    }
                }
            }
        });
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
        var runtimeContext = new RuntimeContext();
        runtimeContext.scope = scope;
        this.compileAndRender(path, runtimeContext);
        return runtimeContext.output;
    };
    TemplateParser.prototype.compileAndRender = function (path, runtimeContext) {
        var Template = this.compile(path);
        var template = new Template();
        template.render(runtimeContext);
        return template;
    };
    TemplateParser.prototype.compile = function (path) {
        if(this.registry[path] !== undefined) {
            return this.registry[path];
        }
        var content = this.templateProvider.getSync(path);
        var templateTokenizer = new TemplateTokenizer(content);
        var templateTokens = templateTokenizer.tokenize();
        var tokenParserContext = new TokenParserContext();
        try  {
            this.parseTemplateSync(tokenParserContext, new TokenReader(templateTokens));
        } catch (e) {
            if(!(e instanceof FlowException)) {
                throw (e);
            }
            throw (e);
        }
        var blocks = tokenParserContext.blocksOutput;
        var output = '';
        var CurrentTemplate = undefined;
        output += 'CurrentTemplate = function() { };';
        output += 'CurrentTemplate.parentName = ' + JSON.stringify(tokenParserContext.parentName) + ';';
        output += 'CurrentTemplate.prototype.render = function(runtimeContext) { this.__main(runtimeContext); };';
        for(var blockName in blocks) {
            var block = blocks[blockName];
            output += 'CurrentTemplate.prototype.' + blockName + ' = function(runtimeContext) {';
            output += block;
            output += '}; ';
        }
        debug(output);
        eval(output);
        if(tokenParserContext.parentName != '') {
            var ParentTemplate = this.compile(tokenParserContext.parentName);
            CurrentTemplate.prototype.__proto__ = ParentTemplate.prototype;
            CurrentTemplate.prototype.__main = ParentTemplate.prototype.__main;
        }
        this.registry[path] = CurrentTemplate;
        return this.registry[path];
    };
    TemplateParser.prototype.parseTemplateSync = function (tokenParserContext, tokenReader) {
        while(tokenReader.hasMore()) {
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
                    this.parseTemplateExpressionSync(tokenParserContext, tokenReader, new TokenReader(item.value));
                    break;

                }
                case 'block': {
                    item = tokenReader.read();
                    this.parseTemplateBlockSync(tokenParserContext, tokenReader, new TokenReader(item.value));
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
