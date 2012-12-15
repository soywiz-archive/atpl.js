var ExpressionParser = require('../../parser/ExpressionParser')
var FlowException = require('../../parser/FlowException')
var ParserNode = require('../../parser/ParserNode')
function register(templateParser) {
    templateParser.addBlockFlowExceptionHandler('endautoescape');
    templateParser.addBlockHandler('autoescape', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        tokenParserContext.write('runtimeContext.autoescape(' + expressionNode.generateCode() + ', function() {');
        while(true) {
            try  {
                templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
            } catch (e) {
                if(!(e instanceof FlowException.FlowException)) {
                    throw (e);
                }
                switch(e.blockType) {
                    case 'endautoescape': {
                        tokenParserContext.write('});');
                        return;

                    }
                    default: {
                        throw (new Error("Unexpected '" + e.blockType + "' for 'autoescape'"));

                    }
                }
            }
        }
    });
    templateParser.addBlockFlowExceptionHandler('else');
    templateParser.addBlockFlowExceptionHandler('elseif');
    templateParser.addBlockFlowExceptionHandler('endif');
    templateParser.addBlockHandler('if', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var didElse = false;
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        tokenParserContext.write('if (' + expressionNode.generateCode() + ') {');
        while(true) {
            try  {
                templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
            } catch (e) {
                if(!(e instanceof FlowException.FlowException)) {
                    throw (e);
                }
                switch(e.blockType) {
                    case 'elseif': {
                        if(didElse) {
                            throw (new Error("Can't put 'elseif' after the 'else'"));
                        }
                        var expressionNode = (new ExpressionParser.ExpressionParser(e.expressionTokenReader)).parseExpression();
                        tokenParserContext.write('} else if (' + expressionNode.generateCode() + ') {');
                        break;

                    }
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
                        return;

                    }
                    default: {
                        throw (new Error("Unexpected '" + e.blockType + "' for 'if'"));

                    }
                }
            }
        }
    });
    templateParser.addBlockFlowExceptionHandler('endblock');
    templateParser.addBlockHandler('block', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var blockName = 'block_' + expressionTokenReader.read().value;
        tokenParserContext.setBlock(blockName, function () {
            try  {
                templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
            } catch (e) {
                if(!(e instanceof FlowException.FlowException)) {
                    throw (e);
                }
                switch(e.blockType) {
                    case 'endblock': {
                        break;

                    }
                    default: {
                        throw (new Error("Unexpected '" + e.blockType + "' for 'block'"));

                    }
                }
            }
        });
        tokenParserContext.write('runtimeContext.putBlock(' + JSON.stringify(blockName) + ');');
    });
    templateParser.addBlockHandler('extends', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        tokenParserContext.write('return runtimeContext.extends(' + expressionNode.generateCode() + ');');
    });
    templateParser.addBlockFlowExceptionHandler('endfor');
    templateParser.addBlockHandler('for', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var didElse = false;
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var nodeId = expressionParser.parseIdentifier();
        expressionTokenReader.expectAndMoveNext('in');
        var nodeList = expressionParser.parseExpression();
        tokenParserContext.write('runtimeContext.createScope((function() { ');
        tokenParserContext.write('var k, list = ' + nodeList.generateCode() + ';');
        tokenParserContext.write('if (!runtimeContext.emptyList(list)) {');
        tokenParserContext.write('for (k in list) { ' + (new ParserNode.ParserNodeAssignment(nodeId, new ParserNode.ParserNodeRaw("list[k]"))).generateCode() + ';');
        while(true) {
            try  {
                templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
            } catch (e) {
                if(!(e instanceof FlowException.FlowException)) {
                    throw (e);
                }
                switch(e.blockType) {
                    case 'else': {
                        if(didElse) {
                            throw (new Error("Can't have two 'else'"));
                        }
                        tokenParserContext.write('} } else {');
                        didElse = true;
                        continue;

                    }
                    case 'endfor': {
                        if(!didElse) {
                            tokenParserContext.write('} ');
                        }
                        tokenParserContext.write('} }));');
                        return;

                    }
                    default: {
                        throw (new Error("Unexpected '" + e.blockType + "' for 'for'"));

                    }
                }
            }
        }
    });
}
exports.register = register;
