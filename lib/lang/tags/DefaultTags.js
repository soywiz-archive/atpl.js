var ExpressionParser = require('../../parser/ExpressionParser')
var FlowException = require('../../parser/FlowException')
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
                        throw (new Error("Unexpected '" + e.blockType + "'"));

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
                        throw (new Error("Unexpected '" + e.blockType + "'"));

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
                        throw (new Error("Unexpected '" + e.blockType + "'"));

                    }
                }
            }
        });
        tokenParserContext.write('this.' + (blockName) + '(runtimeContext);');
    });
    templateParser.addBlockHandler('extends', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        tokenParserContext.parentName = expressionTokenReader.read().value;
    });
    templateParser.addBlockFlowExceptionHandler('endfor');
    templateParser.addBlockHandler('for', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var nodeId = expressionParser.parseIdentifier();
        expressionTokenReader.expectAndMoveNext('in');
        var nodeList = expressionParser.parseExpression();
        tokenParserContext.write('runtimeContext.createScope((function() { var k, list = ' + nodeList.generateCode() + '; for (k in list) { ' + nodeId.generateCode() + ' = list[k];');
        try  {
            templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
        } catch (e) {
            if(!(e instanceof FlowException.FlowException)) {
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
}
exports.register = register;
