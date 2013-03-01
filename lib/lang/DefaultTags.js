var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
function handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, handlers, innerNodeHandler) {
    while(true) {
        try  {
            var keys = [];
            for(var key in handlers) {
                keys.push(key);
            }
            var node = templateParser.parseTemplateSyncOne(tokenParserContext, templateTokenReader);
            if(node == null) {
                throw (new Error("Unexpected end of '" + blockType + "' no any of [" + keys.map(function (key) {
                    return "'" + key + "'";
                }).join(', ') + "]"));
            }
            innerNodeHandler(node);
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
var ParserNodeAutoescape = (function (_super) {
    __extends(ParserNodeAutoescape, _super);
    function ParserNodeAutoescape(expression, inner) {
        _super.call(this);
        this.expression = expression;
        this.inner = inner;
    }
    ParserNodeAutoescape.prototype.generateCode = function () {
        return ('runtimeContext.autoescape(' + this.expression.generateCode() + ', function() {' + this.inner.generateCode() + '}, true);');
    };
    return ParserNodeAutoescape;
})(ParserNode.ParserNodeStatement);
exports.ParserNodeAutoescape = ParserNodeAutoescape;
var ParserNodeStatementFilter = (function (_super) {
    __extends(ParserNodeStatementFilter, _super);
    function ParserNodeStatementFilter(filterName, inner) {
        _super.call(this);
        this.filterName = filterName;
        this.inner = inner;
    }
    ParserNodeStatementFilter.prototype.generateCode = function () {
        return ('runtimeContext.write(runtimeContext.filter(' + JSON.stringify(this.filterName) + ', [runtimeContext.captureOutput(function() { ' + this.inner.generateCode() + '})]));');
    };
    return ParserNodeStatementFilter;
})(ParserNode.ParserNodeStatement);
exports.ParserNodeStatementFilter = ParserNodeStatementFilter;
var ParserNodeScopeSet = (function (_super) {
    __extends(ParserNodeScopeSet, _super);
    function ParserNodeScopeSet(key, value) {
        _super.call(this);
        this.key = key;
        this.value = value;
    }
    ParserNodeScopeSet.prototype.generateCode = function () {
        return 'runtimeContext.scope.set(' + JSON.stringify(this.key) + ', ' + this.value.generateCode() + ');';
    };
    return ParserNodeScopeSet;
})(ParserNode.ParserNodeStatement);
exports.ParserNodeScopeSet = ParserNodeScopeSet;
var ParserNodeIf = (function (_super) {
    __extends(ParserNodeIf, _super);
    function ParserNodeIf() {
        _super.apply(this, arguments);

        this.conditions = [];
    }
    ParserNodeIf.prototype.addCaseCondition = function (expression) {
        this.conditions.push({
            expression: expression,
            code: new ParserNode.ParserNodeContainer()
        });
    };
    ParserNodeIf.prototype.addElseCondition = function () {
        this.conditions.push({
            expression: null,
            code: new ParserNode.ParserNodeContainer()
        });
    };
    ParserNodeIf.prototype.addCodeToCondition = function (node) {
        this.conditions[this.conditions.length - 1].code.add(node);
    };
    ParserNodeIf.prototype.generateCode = function () {
        var out = '';
        for(var n = 0; n < this.conditions.length; n++) {
            var condition = this.conditions[n];
            if(out != '') {
                out += 'else ';
            }
            if(condition.expression != null) {
                out += 'if (' + condition.expression.generateCode() + ')';
            }
            out += '{ ';
            out += condition.code.generateCode();
            out += '}';
        }
        return out;
    };
    return ParserNodeIf;
})(ParserNode.ParserNodeStatement);
exports.ParserNodeIf = ParserNodeIf;
var ParserNodeFor = (function (_super) {
    __extends(ParserNodeFor, _super);
    function ParserNodeFor(keyId, condId, valueId, nodeList, forCode, elseCode) {
        _super.call(this);
        this.keyId = keyId;
        this.condId = condId;
        this.valueId = valueId;
        this.nodeList = nodeList;
        this.forCode = forCode;
        this.elseCode = elseCode;
    }
    ParserNodeFor.prototype.generateCode = function () {
        var out = '';
        out += ('runtimeContext.createScope((function() { ');
        out += (' var list = ' + this.nodeList.generateCode() + ';');
        out += (' if (!runtimeContext.emptyList(list)) {');
        out += ('  runtimeContext.each(list, function(k, v) { ');
        out += ('   ' + (new ParserNode.ParserNodeAssignment(this.valueId, new ParserNode.ParserNodeRaw("v"))).generateCode() + ';');
        if(this.keyId !== undefined) {
            out += ('   ' + (new ParserNode.ParserNodeAssignment(this.keyId, new ParserNode.ParserNodeRaw("k"))).generateCode() + ';');
        }
        if(this.condId) {
            out += ('   if (' + this.condId.generateCode() + ') { ');
        } else {
            out += ('   if (true) { ');
        }
        out += this.forCode.generateCode();
        out += ('}');
        out += ('  });');
        out += ('} else {');
 {
            out += this.elseCode.generateCode();
        }
        out += ('} ');
        out += ('}));');
        return out;
    };
    return ParserNodeFor;
})(ParserNode.ParserNodeStatement);
exports.ParserNodeFor = ParserNodeFor;
var DefaultTags = (function () {
    function DefaultTags() { }
    DefaultTags.endautoescape = _flowexception;
    DefaultTags.autoescape = function autoescape(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        var innerNode = new ParserNode.ParserNodeContainer();
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'endautoescape': function (e) {
                return true;
            }
        }, function (node) {
            innerNode.add(node);
        });
        return new ParserNodeAutoescape(expressionNode, innerNode);
    };
    DefaultTags.set = function set(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var nodeId = expressionParser.parseIdentifier();
        expressionTokenReader.expectAndMoveNext('=');
        var nodeValue = expressionParser.parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        return new ParserNodeScopeSet(String(nodeId.value), nodeValue);
    };
    DefaultTags.$do = function $do(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        return new ParserNode.ParserNodeStatementExpression(expressionNode);
    };
    DefaultTags.embed = function embed(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [embed]"));
    };
    DefaultTags.endfilter = _flowexception;
    DefaultTags.filter = function filter(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var filterName = expressionTokenReader.read().value;
        var innerNode = new ParserNode.ParserNodeContainer();
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'endfilter': function (e) {
                return true;
            }
        }, function (node) {
            innerNode.add(node);
        });
        return new ParserNodeStatementFilter(filterName, innerNode);
    };
    DefaultTags.flush = function flush(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
    };
    DefaultTags.use = function use(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [use]"));
    };
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
        var macroNode = new ParserNode.ParserNodeContainer();
        macroNode.add(new ParserNode.ParserNodeRaw('var _arguments = arguments;'));
        macroNode.add(new ParserNode.ParserNodeRaw('return runtimeContext.captureOutput(function() { '));
        macroNode.add(new ParserNode.ParserNodeRaw('return runtimeContext.autoescape(false, function() { '));
        macroNode.add(new ParserNode.ParserNodeRaw('runtimeContext.createScope(function() { '));
        paramNames.forEach(function (paramName, index) {
            var assign = new ParserNode.ParserNodeAssignment(paramName, new ParserNode.ParserNodeRaw('_arguments[' + index + ']'));
            macroNode.add(new ParserNode.ParserNodeStatementExpression(assign));
        });
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'endmacro': function (e) {
                return true;
            }
        }, function (node) {
            macroNode.add(node);
        });
        macroNode.add(new ParserNode.ParserNodeRaw('});'));
        macroNode.add(new ParserNode.ParserNodeRaw('});'));
        macroNode.add(new ParserNode.ParserNodeRaw('});'));
        var macroCode = tokenParserContext.setMacro(macroName, macroNode);
        return new ParserNode.ParserNodeRaw('');
    };
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
        return new ParserNode.ParserNodeContainer([
            new ParserNode.ParserNodeRaw('runtimeContext.fromImport('), 
            fileNameNode, 
            new ParserNode.ParserNodeRaw(', ' + JSON.stringify(pairs) + ');')
        ]);
    };
    DefaultTags.$import = function $import(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
        var fileNameNode = expressionParser.parseExpression();
        expressionTokenReader.expectAndMoveNext([
            'as'
        ]);
        var aliasNode = expressionParser.parseIdentifier();
        checkNoMoreTokens(expressionTokenReader);
        return new ParserNode.ParserNodeStatementExpression(new ParserNode.ParserNodeAssignment(aliasNode, new ParserNode.ParserNodeRaw('runtimeContext.import(' + fileNameNode.generateCode() + ')')));
    };
    DefaultTags.include = function include(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        return new ParserNode.ParserNodeContainer([
            new ParserNode.ParserNodeRaw('runtimeContext.include('), 
            expressionNode, 
            new ParserNode.ParserNodeRaw(');')
        ]);
    };
    DefaultTags.endraw = _flowexception;
    DefaultTags.endverbatim = _flowexception;
    DefaultTags.raw = function raw(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        checkNoMoreTokens(expressionTokenReader);
        var offsetStart = templateTokenReader.getOffset();
        var offsetEnd = offsetStart;
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'endverbatim': function (e) {
                offsetEnd = templateTokenReader.getOffset() - 1;
                return true;
            },
            'endraw': function (e) {
                offsetEnd = templateTokenReader.getOffset() - 1;
                return true;
            }
        }, function (node) {
        });
        var rawText = templateTokenReader.getSlice(offsetStart, offsetEnd).map(function (item) {
            return (item).rawText;
        }).join('');
        return new ParserNode.ParserNodeOutputText(rawText);
    };
    DefaultTags.verbatim = DefaultTags.raw;
    DefaultTags.sandbox = function sandbox(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        throw (new Error("Not implemented tag [sandbox]"));
    };
    DefaultTags.endspaceless = _flowexception;
    DefaultTags.spaceless = function spaceless(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        checkNoMoreTokens(expressionTokenReader);
        var innerNode = new ParserNode.ParserNodeContainer();
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'endspaceless': function (e) {
                return true;
            }
        }, function (node) {
            innerNode.add(node);
        });
        return new ParserNode.ParserNodeContainer([
            new ParserNode.ParserNodeRaw('runtimeContext.write(runtimeContext.filter("spaceless", [runtimeContext.captureOutput(function() { '), 
            innerNode, 
            new ParserNode.ParserNodeRaw('})]));')
        ]);
    };
    DefaultTags.$else = _flowexception;
    DefaultTags.$elseif = _flowexception;
    DefaultTags.$endif = _flowexception;
    DefaultTags.$if = function $if(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var didElse = false;
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        var parserNodeIf = new ParserNodeIf();
        parserNodeIf.addCaseCondition(expressionNode);
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'elseif': function (e) {
                if(didElse) {
                    throw (new Error("Can't put 'elseif' after the 'else'"));
                }
                var expressionNode = (new ExpressionParser.ExpressionParser(e.expressionTokenReader)).parseExpression();
                checkNoMoreTokens(expressionTokenReader);
                parserNodeIf.addCaseCondition(expressionNode);
            },
            'else': function (e) {
                if(didElse) {
                    throw (new Error("Can't have two 'else'"));
                }
                parserNodeIf.addElseCondition();
                didElse = true;
            },
            'endif': function (e) {
                return true;
            }
        }, function (node) {
            parserNodeIf.addCodeToCondition(node);
        });
        return parserNodeIf;
    };
    DefaultTags.endblock = _flowexception;
    DefaultTags.block = function block(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var blockName = 'block_' + expressionTokenReader.read().value;
        var innerNode = new ParserNode.ParserNodeContainer();
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'endblock': function (e) {
                return true;
            }
        }, function (node) {
            innerNode.add(node);
        });
        tokenParserContext.setBlock(blockName, innerNode);
        return new ParserNode.ParserNodeRaw('runtimeContext.putBlock(' + JSON.stringify(blockName) + ');');
    };
    DefaultTags.$extends = function $extends(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        return new ParserNode.ParserNodeContainer([
            new ParserNode.ParserNodeRaw('return runtimeContext.extends('), 
            expressionNode, 
            new ParserNode.ParserNodeRaw(');')
        ]);
    };
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
        var forCode = new ParserNode.ParserNodeContainer();
        var elseCode = new ParserNode.ParserNodeContainer();
        handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
            'else': function (e) {
                if(didElse) {
                    throw (new Error("Can't have two 'else'"));
                }
                didElse = true;
            },
            'endfor': function (e) {
                return true;
            }
        }, function (node) {
            if(!didElse) {
                forCode.add(node);
            } else {
                elseCode.add(node);
            }
        });
        return new ParserNodeFor(keyId, condId, valueId, nodeList, forCode, elseCode);
    };
    return DefaultTags;
})();
exports.DefaultTags = DefaultTags;
