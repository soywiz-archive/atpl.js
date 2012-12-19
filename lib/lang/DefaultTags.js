var ExpressionParser = require('../parser/ExpressionParser')
var FlowException = require('../parser/FlowException')
var ParserNode = require('../parser/ParserNode')

function checkNoMoreTokens(expressionTokenReader) {
    if(expressionTokenReader.hasMore()) {
        throw (new Error("Unexpected token '" + JSON.stringify(expressionTokenReader.peek()) + "'"));
    }
    return expressionTokenReader;
}
function _flowexception(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
    throw (new FlowException.FlowException(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader));
}
function handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, handlers) {
    while(true) {
        try  {
            var keys = [];
            for(var key in handlers) {
                keys.push(key);
            }
            if(!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
                throw (new Error("Unexpected end of '" + blockType + "' no any of [" + keys.map(function (key) {
                    return "'" + key + "'";
                }).join(', ') + "]"));
            }
        } catch (e) {
            if(!(e instanceof FlowException.FlowException)) {
                throw (e);
            }
            var handler = handlers[e.blockType];
            if(handler !== undefined) {
                if(handler(e)) {
                    return;
                }
            } else {
                throw (new Error("Unexpected '" + e.blockType + "' for '" + blockType + "'"));
            }
        }
    }
}
var DefaultTags = (function () {
    function DefaultTags() { }
    DefaultTags.endautoescape = _flowexception;
    DefaultTags.autoescape = function autoescape(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('runtimeContext.autoescape(' + expressionNode.generateCode() + ', function() {');
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'endautoescape': function (e) {
                tokenParserContext.write('});');
                return true;
            }
        });
    }
    DefaultTags.set = function set(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var nodeId = expressionParser.parseIdentifier();
        expressionTokenReader.expectAndMoveNext('=');
        var nodeValue = expressionParser.parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('runtimeContext.scope.set(' + JSON.stringify(nodeId.value) + ', ' + nodeValue.generateCode() + ');');
    }
    DefaultTags.$do = function $do(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [do]"));
    }
    DefaultTags.embed = function embed(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [embed]"));
    }
    DefaultTags.filter = function filter(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [filter]"));
    }
    DefaultTags.flush = function flush(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
    }
    DefaultTags.use = function use(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [use]"));
    }
    DefaultTags.endmacro = _flowexception;
    DefaultTags.macro = function macro(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var macroName = expressionTokenReader.read().value;
        var paramNames = [];
        expressionTokenReader.expectAndMoveNext([
            '('
        ]);
        if(expressionTokenReader.peek().value != ")") {
            while(true) {
                paramNames.push(expressionParser.parseIdentifier());
                if(expressionTokenReader.expectAndMoveNext([
                    ')', 
                    ','
                ]) == ')') {
                    break;
                }
            }
        } else {
            expressionTokenReader.expectAndMoveNext([
                ')'
            ]);
        }
        checkNoMoreTokens(expressionTokenReader);
        var macroCode = tokenParserContext.setMacro(macroName, function () {
            tokenParserContext.write('var _arguments = arguments;');
            tokenParserContext.write('return runtimeContext.captureOutput(function() { ');
            tokenParserContext.write('return runtimeContext.autoescape(false, function() { ');
            tokenParserContext.write('runtimeContext.createScope(function() { ');
            paramNames.forEach(function (paramName, index) {
                var assign = new ParserNode.ParserNodeAssignment(paramName, new ParserNode.ParserNodeRaw('_arguments[' + index + ']'));
                tokenParserContext.write(assign.generateCode() + ';');
            });
            handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
                'endmacro': function (e) {
                    return true;
                }
            });
            tokenParserContext.write('});');
            tokenParserContext.write('});');
            tokenParserContext.write('});');
        });
    }
    DefaultTags.from = function from(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var fileNameNode = expressionParser.parseExpression();
        expressionTokenReader.expectAndMoveNext([
            'import'
        ]);
        var pairs = [];
        while(expressionTokenReader.peek().value != null) {
            var fromNode = expressionTokenReader.read().value;
            var toNode = fromNode;
            var token = expressionTokenReader.expectAndMoveNext([
                'as', 
                ',', 
                null
            ]);
            if(token == 'as') {
                toNode = expressionTokenReader.read().value;
                expressionTokenReader.expectAndMoveNext([
                    ',', 
                    null
                ]);
            }
            pairs.push([
                fromNode, 
                toNode
            ]);
        }
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('runtimeContext.fromImport(' + fileNameNode.generateCode() + ', ' + JSON.stringify(pairs) + ');');
    }
    DefaultTags.$import = function $import(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var fileNameNode = expressionParser.parseExpression();
        expressionTokenReader.expectAndMoveNext([
            'as'
        ]);
        var aliasNode = expressionParser.parseIdentifier();
        checkNoMoreTokens(expressionTokenReader);
        var assign = new ParserNode.ParserNodeAssignment(aliasNode, new ParserNode.ParserNodeRaw('runtimeContext.import(' + fileNameNode.generateCode() + ')'));
        tokenParserContext.write(assign.generateCode() + ";");
    }
    DefaultTags.include = function include(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('runtimeContext.include(' + expressionNode.generateCode() + ');');
    }
    DefaultTags.raw = function raw(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [raw]"));
    }
    DefaultTags.sandbox = function sandbox(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [sandbox]"));
    }
    DefaultTags.spaceless = function spaceless(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [spaceless]"));
    }
    DefaultTags.$else = _flowexception;
    DefaultTags.$elseif = _flowexception;
    DefaultTags.$endif = _flowexception;
    DefaultTags.$if = function $if(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var didElse = false;
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('if (' + expressionNode.generateCode() + ') {');
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'elseif': function (e) {
                if(didElse) {
                    throw (new Error("Can't put 'elseif' after the 'else'"));
                }
                var expressionNode = (new ExpressionParser.ExpressionParser(e.expressionTokenReader)).parseExpression();
                checkNoMoreTokens(expressionTokenReader);
                tokenParserContext.write('} else if (' + expressionNode.generateCode() + ') {');
            },
            'else': function (e) {
                if(didElse) {
                    throw (new Error("Can't have two 'else'"));
                }
                tokenParserContext.write('} else {');
                didElse = true;
            },
            'endif': function (e) {
                tokenParserContext.write('}');
                return true;
            }
        });
    }
    DefaultTags.endblock = _flowexception;
    DefaultTags.block = function block(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var blockName = 'block_' + expressionTokenReader.read().value;
        tokenParserContext.setBlock(blockName, function () {
            handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
                'endblock': function (e) {
                    return true;
                }
            });
        });
        tokenParserContext.write('runtimeContext.putBlock(' + JSON.stringify(blockName) + ');');
    }
    DefaultTags.$extends = function $extends(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        tokenParserContext.write('return runtimeContext.extends(' + expressionNode.generateCode() + ');');
    }
    DefaultTags.$endfor = _flowexception;
    DefaultTags.$for = function $for(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
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
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'else': function (e) {
                if(didElse) {
                    throw (new Error("Can't have two 'else'"));
                }
                tokenParserContext.write('}); } else {');
                didElse = true;
            },
            'endfor': function (e) {
                if(condId) {
                    tokenParserContext.write('} ');
                }
                if(!didElse) {
                    tokenParserContext.write('}); ');
                }
                tokenParserContext.write('} }));');
                return true;
            }
        });
    }
    return DefaultTags;
})();
exports.DefaultTags = DefaultTags;
