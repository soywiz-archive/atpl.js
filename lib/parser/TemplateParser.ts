///<reference path='../imports.d.ts'/>

import ParserNode = module('./ParserNode');
import TokenReader = module('../lexer/TokenReader');
import _TemplateTokenizer = module('../lexer/TemplateTokenizer');
import TemplateProvider   = module('../TemplateProvider');
import RuntimeContext  = module('../runtime/RuntimeContext');
import TokenParserContext = module('./TokenParserContext');
import ExpressionParser    = module('./ExpressionParser');
import LanguageContext = module('../LanguageContext');
import SandboxPolicy = module('../SandboxPolicy');

var TemplateTokenizer = _TemplateTokenizer.TemplateTokenizer;

export var FlowException = function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
	this.blockType = blockType;
	this.templateParser = templateParser;
	this.tokenParserContext = tokenParserContext;
	this.templateTokenReader = templateTokenReader;
	this.expressionTokenReader = expressionTokenReader;
};

FlowException.prototype['__proto__'] = Error.prototype;

function debug(data) {
	//console.log(data);
}

export interface CompiledTemplate {
	ouput: string;
	class: any;
}

export class TemplateParser {
	registry: any = {};
	registryString: any = {};
	sandboxPolicy: SandboxPolicy.SandboxPolicy = new SandboxPolicy.SandboxPolicy();

	constructor(public templateProvider: TemplateProvider.TemplateProvider, public languageContext: LanguageContext.LanguageContext) {
	}

	private getCache(): bool {
		return this.languageContext.templateConfig.getCache();
	}

	compileAndRenderStringToString(content: string, scope: any, tokenParserContextCommon?: TokenParserContext.TokenParserContextCommon): string {
		if (scope === undefined) scope = {};
		var runtimeContext = new RuntimeContext.RuntimeContext(this, scope, this.languageContext);
		this.compileAndRenderString(content, runtimeContext, tokenParserContextCommon);
		return runtimeContext.output;
	}

	compileAndRenderToString(path: string, scope: any, tokenParserContextCommon?: TokenParserContext.TokenParserContextCommon): string {
		if (scope === undefined) scope = {};
		var runtimeContext = new RuntimeContext.RuntimeContext(this, scope, this.languageContext);
		this.compileAndRender(path, runtimeContext, tokenParserContextCommon);
		return runtimeContext.output;
	}

	compileAndRenderString(content: string, runtimeContext: RuntimeContext.RuntimeContext, tokenParserContextCommon?: TokenParserContext.TokenParserContextCommon) {
		var template = new (this.compileString(content, runtimeContext, tokenParserContextCommon).class)();
		template.render(runtimeContext);
		return template;
	}

	compileAndRender(path: string, runtimeContext: RuntimeContext.RuntimeContext, tokenParserContextCommon?: TokenParserContext.TokenParserContextCommon) {
		var template = new (this.compile(path, runtimeContext, tokenParserContextCommon).class)();
		template.render(runtimeContext);
		return template;
	}

	getEvalCodeString(content: string, path: string, tokenParserContextCommon?: TokenParserContext.TokenParserContextCommon) {
		var templateTokenizer  = new TemplateTokenizer(content);
		var templateTokens     = templateTokenizer.tokenize();
		var tokenParserContext = new TokenParserContext.TokenParserContext(tokenParserContextCommon || new TokenParserContext.TokenParserContextCommon(), this.sandboxPolicy);
	
		try {
			tokenParserContext.setBlock('__main', this.parseTemplateSync(tokenParserContext, new TokenReader.TokenReader(templateTokens)));
		} catch (e) {
			if (e instanceof FlowException) {
				//console.log(e);
				throw(new Error("Unexpected tag '" + e.blockType + "' on template root"));
			}
			throw(e);
		}
		var output = '';
		output += 'CurrentTemplate = function() { this.name = ' + JSON.stringify(path) + '; };\n';
		output += 'CurrentTemplate.prototype.render = function(runtimeContext) { runtimeContext.setTemplate(this); this.__main(runtimeContext); };\n';

		tokenParserContext.iterateBlocks((blockNode, blockName) => {
			output += 'CurrentTemplate.prototype.' + blockName + ' = function(runtimeContext) {\n';
			{
				output += 'var that = this;\n';
				output += 'runtimeContext.setCurrentBlock(that, ' + JSON.stringify(blockName) + ', function() {';
				{
					output += blockNode.generateCode() + "\n";
				}
				output += '});';
			}
			output += '};\n';
		});

		output += 'CurrentTemplate.prototype.macros = {};\n';
		output += 'CurrentTemplate.prototype.macros.$runtimeContext = runtimeContext;\n';
		
		tokenParserContext.iterateMacros((macroNode, macroName) => {
			output += 'CurrentTemplate.prototype.macros.' + macroName + ' = function() {\n';
			output += 'var runtimeContext = this.$runtimeContext || this;\n';
			//output += 'console.log("<<<<<<<<<<<<<<<<<<<<<<");console.log(this);\n';
			output += macroNode.generateCode();
			output += '};\n';
		});

		debug(output);
		return { output: output, tokenParserContext: tokenParserContext };
	}

	getEvalCode(path: string, tokenParserContextCommon?: TokenParserContext.TokenParserContextCommon) {
		if (!this.getCache()) delete this.registry[path];

		if (this.registry[path] !== undefined) {
			return this.registry[path];
		}
	
		//console.log("TemplateParser.prototype.compile: " + path);

		var content = this.templateProvider.getSync(path, this.getCache());
	
		return this.getEvalCodeString(content, path, tokenParserContextCommon);
	}

	compileString(content: string, runtimeContext: RuntimeContext.RuntimeContext, tokenParserContextCommon?: TokenParserContext.TokenParserContextCommon) {
		runtimeContext.sandboxPolicy = this.sandboxPolicy;
		if (!this.getCache()) delete this.registryString[content];

		if (this.registryString[content] === undefined) {
			var info = this.getEvalCodeString(content, 'inline', tokenParserContextCommon);
			var output = info.output;
			var tokenParserContext = info.tokenParserContext;
			var CurrentTemplate = undefined;

			//console.log(runtimeContext);

			try {
				eval(output);
				//console.log(CurrentTemplate.prototype.macros);
			} catch (e) {
				console.log('----------------------------');
				console.log('Exception in eval: ' + output);
				console.log('----------------------------');
				throw (e);
			}

			//console.log(output);
			//console.log(content);

			this.registryString[content] = { output : output, class : CurrentTemplate };
		}
	
		return <CompiledTemplate>this.registryString[content];
	}

	compile(path: string, runtimeContext: RuntimeContext.RuntimeContext, tokenParserContextCommon?: TokenParserContext.TokenParserContextCommon) {
		runtimeContext.sandboxPolicy = this.sandboxPolicy;
		if (!this.getCache()) delete this.registry[path];

		if (this.registry[path] === undefined) {
			var info = this.getEvalCode(path, tokenParserContextCommon);
			var output = info.output;
			var tokenParserContext = info.tokenParserContext;
			var CurrentTemplate = undefined;

			try {
				eval(output);
			} catch (e) {
				console.log('----------------------------');
				console.log('Exception in eval: ' + output);
				console.log('----------------------------');
				throw (e);
			}

			//console.log(output);

			this.registry[path] = { output : output, class : CurrentTemplate };
		}
	
		return <CompiledTemplate>this.registry[path];
	}

	parseTemplateSyncOne(tokenParserContext, tokenReader: TokenReader.TokenReader) {
		if (!tokenReader.hasMore()) return null;
		var item = tokenReader.peek();
		debug('parseTemplateSync: ' + item.type);
		switch (item.type) {
			case 'text':
				item = tokenReader.read();
				return new ParserNode.ParserNodeRaw('runtimeContext.write(' + JSON.stringify(String(item.value)) + ');');
			case 'trimSpacesAfter':
			case 'trimSpacesBefore':
				item = tokenReader.read();
				return (new ParserNode.ParserNodeRaw('runtimeContext.trimSpaces();'));
			case 'expression':
				item = tokenReader.read();
				// Propagate the "not done".
				return (new ParserNode.ParserNodeRaw(this.parseTemplateExpressionSync(tokenParserContext, tokenReader, new TokenReader.TokenReader(item.value)).generateCode()));
			case 'block':
				item = tokenReader.read();
				// Propagate the "not done".
				return (this.parseTemplateBlockSync(tokenParserContext, tokenReader, new TokenReader.TokenReader(item.value)));
		}

		throw (new Error("Invalid item.type == '" + item.type + "'"));
	}

	parseTemplateSync(tokenParserContext, tokenReader: TokenReader.TokenReader) {
		var nodes = new ParserNode.ParserNodeContainer();

		while (tokenReader.hasMore()) {
			nodes.add(this.parseTemplateSyncOne(tokenParserContext, tokenReader));
		}
	
		return nodes;
	}

	parseTemplateExpressionSync(tokenParserContext, templateTokenReader, expressionTokenReader): ParserNode.ParserNodeWriteExpression {
		return new ParserNode.ParserNodeWriteExpression((new ExpressionParser.ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression());
	}

	parseTemplateBlockSync(tokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader): ParserNode.ParserNode {
		var that = this;
		var blockTypeToken = expressionTokenReader.read();
		var blockType = blockTypeToken.value;
		if (blockTypeToken.type != 'id') throw(new Error("Block expected a type as first token but found : " + JSON.stringify(blockTypeToken)));
		debug('BLOCK: ' + blockType);
	
		var blockHandler = this.languageContext.tags[blockType];
		if (blockHandler !== undefined) {
			//console.log("blockHandler: " + blockType + " | " + tokenParserContext.common.sandbox);

			if (tokenParserContext.common.sandbox) {
				if (this.sandboxPolicy.allowedTags.indexOf(blockType) == -1) throw (new Error("Sandbox policy disallows block '" + blockType + "'"));
			}

			return blockHandler(blockType, this, tokenParserContext, templateTokenReader, expressionTokenReader);
		}

		//throw (new Error("Invalid block type '" + blockTypeToken.value + "' just can handle " + JSON.stringify(Object.keys(this.languageContext.tags))));
		throw (new Error("Invalid block type '" + blockTypeToken.value + "'"));
	}
}
