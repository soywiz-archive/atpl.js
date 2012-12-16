var ExpressionParser = require('../parser/ExpressionParser')
var FlowException = require('../parser/FlowException')
var ParserNode = require('../parser/ParserNode')
function checkNoMoreTokens(expressionTokenReader) {
    if(expressionTokenReader.hasMore) {
        throw (new Error("Unexpected token '" + JSON.stringify(expressionTokenReader.peek()) + "'"));
    }
    return expressionTokenReader;
}
function register(templateParser) {
    templateParser.addBlockFlowExceptionHandler('endautoescape');
    templateParser.addBlockHandler('autoescape', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('runtimeContext.autoescape(' + expressionNode.generateCode() + ', function() {');
        while(true) {
            try  {
                if(!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
                    throw (new Error("Unexpected end of 'autoescape' no closing 'endautoescape'"));
                }
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
    templateParser.addBlockHandler('set', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var nodeId = expressionParser.parseIdentifier();
        expressionTokenReader.expectAndMoveNext('=');
        var nodeValue = expressionParser.parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('runtimeContext.scope.set(' + JSON.stringify(nodeId.value) + ', ' + nodeValue.generateCode() + ');');
    });
    templateParser.addBlockHandler('do', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [do]"));
    });
    templateParser.addBlockHandler('embed', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [embed]"));
    });
    templateParser.addBlockHandler('filter', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [filter]"));
    });
    templateParser.addBlockHandler('flush', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [flush]"));
    });
    templateParser.addBlockHandler('use', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [use]"));
    });
    templateParser.addBlockHandler('macro', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [macro]"));
    });
    templateParser.addBlockHandler('from', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [from]"));
    });
    templateParser.addBlockHandler('import', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [import]"));
    });
    templateParser.addBlockHandler('include', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('runtimeContext.include(' + expressionNode.generateCode() + ');');
    });
    templateParser.addBlockHandler('raw', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [raw]"));
    });
    templateParser.addBlockHandler('sandbox', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [sandbox]"));
    });
    templateParser.addBlockHandler('raw', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [raw]"));
    });
    templateParser.addBlockHandler('spaceless', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [spaceless]"));
    });
    templateParser.addBlockFlowExceptionHandler('else');
    templateParser.addBlockFlowExceptionHandler('elseif');
    templateParser.addBlockFlowExceptionHandler('endif');
    templateParser.addBlockHandler('if', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var didElse = false;
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('if (' + expressionNode.generateCode() + ') {');
        while(true) {
            try  {
                if(!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
                    throw (new Error("Unexpected end of 'if' no closing 'endif'"));
                }
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
                        checkNoMoreTokens(expressionTokenReader);
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
                if(!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
                    throw (new Error("Unexpected end of 'block' no closing 'endblock'"));
                }
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
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('return runtimeContext.extends(' + expressionNode.generateCode() + ');');
    });
    templateParser.addBlockFlowExceptionHandler('endfor');
    templateParser.addBlockHandler('for', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var didElse = false;
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var valueId = expressionParser.parseIdentifier();
        var keyId = undefined;
        var condId = undefined;
        var res = expressionTokenReader.expectAndMoveNext([
            ',', 
            'in'
        ]);
        if(res == ',') {
            keyId = valueId;
            valueId = expressionParser.parseIdentifier();
            expressionTokenReader.expectAndMoveNext([
                'in'
            ]);
        }
        var nodeList = expressionParser.parseExpression();
        if(expressionTokenReader.checkAndMoveNext([
            'if'
        ])) {
            condId = expressionParser.parseExpression();
        }
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('runtimeContext.createScope((function() { ');
        tokenParserContext.write(' var list = ' + nodeList.generateCode() + ';');
        tokenParserContext.write(' if (!runtimeContext.emptyList(list)) {');
        tokenParserContext.write('  runtimeContext.each(list, function(k, v) { ');
        tokenParserContext.write('   ' + (new ParserNode.ParserNodeAssignment(valueId, new ParserNode.ParserNodeRaw("v"))).generateCode() + ';');
        if(keyId !== undefined) {
            tokenParserContext.write('   ' + (new ParserNode.ParserNodeAssignment(keyId, new ParserNode.ParserNodeRaw("k"))).generateCode() + ';');
        }
        if(condId) {
            tokenParserContext.write('   if (' + condId.generateCode() + ') { ');
        }
        while(true) {
            try  {
                if(!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
                    throw (new Error("Unexpected end of 'for' no closing 'endfor'"));
                }
            } catch (e) {
                if(!(e instanceof FlowException.FlowException)) {
                    throw (e);
                }
                switch(e.blockType) {
                    case 'else': {
                        if(didElse) {
                            throw (new Error("Can't have two 'else'"));
                        }
                        tokenParserContext.write('}); } else {');
                        didElse = true;
                        continue;

                    }
                    case 'endfor': {
                        if(condId) {
                            tokenParserContext.write('} ');
                        }
                        if(!didElse) {
                            tokenParserContext.write('}); ');
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
