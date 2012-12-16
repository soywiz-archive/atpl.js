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
var DefaultTags = (function () {
    function DefaultTags() { }
    DefaultTags.endautoescape = _flowexception;
    DefaultTags.autoescape = function autoescape(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
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
        throw (new Error("Not implemented tag [flush]"));
    }
    DefaultTags.use = function use(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [use]"));
    }
    DefaultTags.macro = function macro(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [macro]"));
    }
    DefaultTags.from = function from(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [from]"));
    }
    DefaultTags.$import = function $import(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [import]"));
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
    }
    DefaultTags.endblock = _flowexception;
    DefaultTags.block = function block(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
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
                        return;

                    }
                    default: {
                        throw (new Error("Unexpected '" + e.blockType + "' for 'block'"));

                    }
                }
            }
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
    }
    return DefaultTags;
})();
exports.DefaultTags = DefaultTags;
