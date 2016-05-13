///<reference path='../imports.d.ts'/>
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TokenParserContext_1 = require('./TokenParserContext');
var RuntimeContext_1 = require('../runtime/RuntimeContext');
var TokenReader_1 = require('../lexer/TokenReader');
var ExpressionParser_1 = require('./ExpressionParser');
var SandboxPolicy_1 = require('../SandboxPolicy');
var TemplateTokenizer_1 = require('../lexer/TemplateTokenizer');
var ParserNode = require('./ParserNode');
var FlowException = (function (_super) {
    __extends(FlowException, _super);
    function FlowException(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
        _super.call(this);
        this.blockType = blockType;
        this.templateParser = templateParser;
        this.tokenParserContext = tokenParserContext;
        this.templateTokenReader = templateTokenReader;
        this.expressionTokenReader = expressionTokenReader;
    }
    return FlowException;
}(Error));
exports.FlowException = FlowException;
function debug(data) {
    //console.log(data);
}
var TemplateParser = (function () {
    function TemplateParser(templateProvider, languageContext) {
        this.templateProvider = templateProvider;
        this.languageContext = languageContext;
        this.registry = {};
        this.registryString = {};
        this.sandboxPolicy = new SandboxPolicy_1.SandboxPolicy();
    }
    TemplateParser.prototype.getCache = function () {
        return this.languageContext.templateConfig.getCache();
    };
    TemplateParser.prototype.compileAndRenderStringToString = function (content, scope, tokenParserContextCommon) {
        if (scope === undefined)
            scope = {};
        var runtimeContext = new RuntimeContext_1.RuntimeContext(this, scope, this.languageContext);
        this.compileAndRenderString(content, runtimeContext, tokenParserContextCommon);
        return runtimeContext.output;
    };
    TemplateParser.prototype.compileAndRenderToString = function (path, scope, tokenParserContextCommon) {
        if (scope === undefined)
            scope = {};
        var runtimeContext = new RuntimeContext_1.RuntimeContext(this, scope, this.languageContext);
        this.compileAndRender(path, runtimeContext, tokenParserContextCommon);
        return runtimeContext.output;
    };
    TemplateParser.prototype.compileAndRenderString = function (content, runtimeContext, tokenParserContextCommon) {
        var template = new (this.compileString(content, runtimeContext, tokenParserContextCommon).class)();
        template.render(runtimeContext);
        return template;
    };
    TemplateParser.prototype.compileAndRender = function (path, runtimeContext, tokenParserContextCommon) {
        var template = new (this.compile(path, runtimeContext, tokenParserContextCommon).class)();
        template.render(runtimeContext);
        return template;
    };
    TemplateParser.prototype.getEvalCodeString = function (content, path, tokenParserContextCommon) {
        this.path = path;
        var templateTokenizer = new TemplateTokenizer_1.TemplateTokenizer(content);
        var tokenParserContext = new TokenParserContext_1.TokenParserContext(tokenParserContextCommon || new TokenParserContext_1.TokenParserContextCommon(), this.sandboxPolicy);
        try {
            var tokenReader = new TokenReader_1.TokenReader(templateTokenizer);
            tokenParserContext.setBlock('__main', this.parseTemplateSync(tokenParserContext, tokenReader));
        }
        catch (e) {
            if (e instanceof FlowException) {
                //console.log(e);
                throw (new Error("Unexpected tag '" + e.blockType + "' on template root"));
            }
            throw (e);
        }
        var output = '';
        output += 'CurrentTemplate = function() { this.name = ' + JSON.stringify(path) + '; };\n';
        output += 'CurrentTemplate.prototype.render = function(runtimeContext) { runtimeContext.setTemplate(this); this.__main(runtimeContext); };\n';
        tokenParserContext.iterateBlocks(function (blockNode, blockName) {
            output += 'CurrentTemplate.prototype.' + blockName + ' = function(runtimeContext) {\n';
            {
                var avoidOutput = ((blockName == "__main") && (tokenParserContext.afterMainNodes.length > 0));
                output += 'var that = this;\n';
                output += 'runtimeContext.setCurrentBlock(that, ' + JSON.stringify(blockName) + ', function() {';
                {
                    output += blockNode.generateCode({ doWrite: !avoidOutput }) + "\n";
                }
                if (avoidOutput) {
                    tokenParserContext.iterateAfterMainNodes(function (blockNode2) {
                        output += blockNode2.generateCode({ doWrite: false }) + "\n";
                    });
                }
                output += '});';
            }
            output += '};\n';
        });
        output += 'CurrentTemplate.prototype.macros = {};\n';
        output += 'CurrentTemplate.prototype.macros.$runtimeContext = runtimeContext;\n';
        tokenParserContext.iterateMacros(function (macroNode, macroName) {
            output += 'CurrentTemplate.prototype.macros.' + macroName + ' = function() {\n';
            //output += 'console.log(this);\n';
            output += 'var runtimeContext = this.$runtimeContext || this;\n';
            //output += 'console.log("<<<<<<<<<<<<<<<<<<<<<<");console.log(this);\n';
            output += macroNode.generateCode({ doWrite: true });
            output += '};\n';
        });
        debug(output);
        return { output: output, tokenParserContext: tokenParserContext };
    };
    TemplateParser.prototype.getEvalCode = function (path, tokenParserContextCommon) {
        if (!this.getCache())
            delete this.registry[path];
        if (this.registry[path] !== undefined) {
            return this.registry[path];
        }
        //console.log("TemplateParser.prototype.compile: " + path);
        var content = this.templateProvider.getSync(path, this.getCache());
        return this.getEvalCodeString(content, path, tokenParserContextCommon);
    };
    TemplateParser.prototype.compileString = function (content, runtimeContext, tokenParserContextCommon) {
        runtimeContext.sandboxPolicy = this.sandboxPolicy;
        if (!this.getCache())
            delete this.registryString[content];
        if (this.registryString[content] === undefined) {
            var info = this.getEvalCodeString(content, 'inline', tokenParserContextCommon);
            var output = info.output;
            var tokenParserContext = info.tokenParserContext;
            var CurrentTemplate = undefined;
            //console.log(runtimeContext);
            try {
                eval(output);
            }
            catch (e) {
                console.log('----------------------------');
                console.log('Exception in eval: ' + output);
                console.log('----------------------------');
                throw (e);
            }
            //console.log(output);
            //console.log(content);
            this.registryString[content] = { output: output, class: CurrentTemplate };
        }
        return this.registryString[content];
    };
    TemplateParser.prototype.compile = function (path, runtimeContext, tokenParserContextCommon) {
        runtimeContext.sandboxPolicy = this.sandboxPolicy;
        if (!this.getCache())
            delete this.registry[path];
        if (this.registry[path] === undefined) {
            var info = this.getEvalCode(path, tokenParserContextCommon);
            var output = info.output;
            var tokenParserContext = info.tokenParserContext;
            var CurrentTemplate = undefined;
            try {
                eval(output);
            }
            catch (e) {
                console.log('----------------------------');
                console.log('Exception in eval: ' + output);
                console.log('----------------------------');
                throw (e);
            }
            //console.log(output);
            this.registry[path] = { output: output, class: CurrentTemplate };
        }
        return this.registry[path];
    };
    TemplateParser.prototype.parseTemplateSyncOne = function (tokenParserContext, tokenReader) {
        if (!tokenReader.hasMore())
            return null;
        var item = tokenReader.peek();
        debug('parseTemplateSync: ' + item.type);
        switch (item.type) {
            case 'text':
                item = tokenReader.read();
                return new ParserNode.ParserNodeOutputText(String(item.value));
            case 'trimSpacesAfter':
            case 'trimSpacesBefore':
                item = tokenReader.read();
                return new ParserNode.ParserNodeRaw('runtimeContext.trimSpaces();');
            case 'expression':
                item = tokenReader.read();
                // Propagate the "not done".
                return new ParserNode.ParserNodeRaw(this.parseTemplateExpressionSync(tokenParserContext, tokenReader, new TokenReader_1.TokenReader(item.value)).generateCode({ doWrite: true }));
            case 'block':
                item = tokenReader.read();
                // Propagate the "not done".
                return this.parseTemplateBlockSync(tokenParserContext, tokenReader, new TokenReader_1.TokenReader(item.value));
        }
        throw new Error("Invalid item.type == '" + item.type + "'");
    };
    TemplateParser.prototype.parseTemplateSync = function (tokenParserContext, tokenReader) {
        var nodes = new ParserNode.ParserNodeContainer([]);
        while (tokenReader.hasMore()) {
            nodes.add(this.parseTemplateSyncOne(tokenParserContext, tokenReader));
        }
        return nodes;
    };
    TemplateParser.prototype.parseTemplateExpressionSync = function (tokenParserContext, templateTokenReader, expressionTokenReader) {
        return new ParserNode.ParserNodeStatementExpression(new ParserNode.ParserNodeWriteExpression((new ExpressionParser_1.ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression()));
    };
    TemplateParser.prototype.parseTemplateBlockSync = function (tokenParserContext, templateTokenReader, expressionTokenReader) {
        var that = this;
        var blockTypeToken = expressionTokenReader.read();
        var blockType = blockTypeToken.value;
        if (blockTypeToken.type != 'id') {
            throw new Error("Block expected a type as first token but found : " + JSON.stringify(blockTypeToken));
        }
        debug('BLOCK: ' + blockType);
        var blockHandler = this.languageContext.tags[blockType];
        if (blockHandler !== undefined) {
            //console.log("blockHandler: " + blockType + " | " + tokenParserContext.common.sandbox);
            if (tokenParserContext.common.sandbox) {
                if (this.sandboxPolicy.allowedTags.indexOf(blockType) == -1) {
                    throw new Error("Sandbox policy disallows block '" + blockType + "'");
                }
            }
            return blockHandler(blockType, this, tokenParserContext, templateTokenReader, expressionTokenReader);
        }
        //throw new Error("Invalid block type '" + blockTypeToken.value + "' just can handle " + JSON.stringify(Object.keys(this.languageContext.tags)));
        throw new Error("Invalid block type '" + blockTypeToken.value + "'");
    };
    return TemplateParser;
}());
exports.TemplateParser = TemplateParser;
