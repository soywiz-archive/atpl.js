///<reference path='../imports.d.ts'/>

export import TokenReader          = module('../lexer/TokenReader');
export import _TemplateTokenizer   = module('../lexer/TemplateTokenizer');
export import _RuntimeContext      = module('../runtime/RuntimeContext');
export import _FlowException       = module('./FlowException');
export import _TokenParserContext  = module('./TokenParserContext');
export import _ExpressionParser    = module('./ExpressionParser');
export import LanguageContext = module('../LanguageContext');

var TemplateTokenizer = _TemplateTokenizer.TemplateTokenizer;
var TokenParserContext = _TokenParserContext.TokenParserContext;
var RuntimeContext = _RuntimeContext.RuntimeContext;
var ExpressionParser = _ExpressionParser.ExpressionParser;
var FlowException = _FlowException.FlowException;

function debug(data) {
	//console.log(data);
}

export class TemplateParser {
	registry:any = {};
	registryString: any = {};

	constructor(public templateProvider, public languageContext: LanguageContext.LanguageContext) {
	}

	compileAndRenderStringToString(content, scope: any) {
		if (scope === undefined) scope = {};
		var runtimeContext = new RuntimeContext(this, scope, this.languageContext);
		this.compileAndRenderString(content, runtimeContext);
		return runtimeContext.output;
	}

	compileAndRenderToString(path, scope: any) {
		if (scope === undefined) scope = {};
		var runtimeContext = new RuntimeContext(this, scope, this.languageContext);
		this.compileAndRender(path, runtimeContext);
		return runtimeContext.output;
	}

	compileAndRenderString(content, runtimeContext) {
		var template = new (this.compileString(content, runtimeContext).class)();
		template.render(runtimeContext);
		return template;
	}

	compileAndRender(path, runtimeContext) {
		var template = new (this.compile(path, runtimeContext).class)();
		template.render(runtimeContext);
		return template;
	}

	getEvalCodeString(content: string, path: string) {
		var templateTokenizer  = new TemplateTokenizer(content);
		var templateTokens     = templateTokenizer.tokenize();
		var tokenParserContext = new TokenParserContext();
	
		try {
			tokenParserContext.setBlock('__main', () => {
				this.parseTemplateSync(tokenParserContext, new TokenReader.TokenReader(templateTokens));
			});
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

		var blocks = tokenParserContext.blocksOutput;
		for (var blockName in blocks) {
			var block = blocks[blockName];
			output += 'CurrentTemplate.prototype.' + blockName + ' = function(runtimeContext) {\n';
			{
				output += 'var that = this;\n';
				output += 'runtimeContext.setCurrentBlock(that, ' + JSON.stringify(blockName) + ', function() {';
				{
					output += block + "\n";
				}
				output += '});';
			}
			output += '};\n';
		}

		output += 'CurrentTemplate.prototype.macros = {};\n';
		output += 'CurrentTemplate.prototype.macros.$runtimeContext = runtimeContext;\n';
		
		var macros = tokenParserContext.macrosOutput;
		for (var macroName in macros) {
			var macro = macros[macroName];
			output += 'CurrentTemplate.prototype.macros.' + macroName + ' = function() {\n';
			output += 'var runtimeContext = this.$runtimeContext || this;\n';
			//output += 'console.log("<<<<<<<<<<<<<<<<<<<<<<");console.log(this);\n';
			output += macro;
			output += '};\n';
		}

		debug(output);
		return { output: output, tokenParserContext: tokenParserContext };
	}

	getEvalCode(path: string) {
		if (this.registry[path] !== undefined) {
			return this.registry[path];
		}
	
		//console.log("TemplateParser.prototype.compile: " + path);

		var content            = this.templateProvider.getSync(path);
	
		return this.getEvalCodeString(content, path);
	}

	compileString(content: string, runtimeContext: any) {
		if (this.registryString[content] === undefined) {
			var info = this.getEvalCodeString(content, 'inline');
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

			this.registryString[content] = { output : output, class : CurrentTemplate };
		}
	
		return this.registryString[content];
	}

	compile(path: string, runtimeContext: any) {
		if (this.registry[path] === undefined) {
			var info = this.getEvalCode(path);
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
	
		return this.registry[path];
	}

	parseTemplateSync(tokenParserContext, tokenReader: TokenReader.TokenReader) {
		while (tokenReader.hasMore()) {
			var item = tokenReader.peek();
			debug('parseTemplateSync: ' + item.type);
			switch (item.type) {
				case 'text':
					item = tokenReader.read();
					tokenParserContext.write(
						'runtimeContext.write(' + JSON.stringify(String(item.value)) + ');'
					);
				break;
				case 'expression':
					item = tokenReader.read();
					// Propagate the "not done".
					this.parseTemplateExpressionSync(tokenParserContext, tokenReader, new TokenReader.TokenReader(item.value));
				break;
				case 'block':
					item = tokenReader.read();
					// Propagate the "not done".
					this.parseTemplateBlockSync(tokenParserContext, tokenReader, new TokenReader.TokenReader(item.value));
				break;
				default:
					throw(new Error("Invalid item.type == '" + item.type + "'"));
			}
		}
	
		return tokenReader.hasMore();
	}

	parseTemplateExpressionSync(tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionParser = new ExpressionParser(expressionTokenReader);
		tokenParserContext.write(
			'runtimeContext.writeExpression(' + expressionParser.parseExpression().generateCode() + ');'
		);
	}

	parseTemplateBlockSync(tokenParserContext, templateTokenReader, expressionTokenReader) {
		var that = this;
		var blockTypeToken = expressionTokenReader.read();
		var blockType = blockTypeToken.value;
		if (blockTypeToken.type != 'id') throw(new Error("Block expected a type as first token but found : " + JSON.stringify(blockTypeToken)));
		debug('BLOCK: ' + blockType);
	
		var blockHandler = this.languageContext.tags[blockType];
		if (blockHandler !== undefined) {
			return blockHandler(blockType, this, tokenParserContext, templateTokenReader, expressionTokenReader);
		}

		throw(new Error("Invalid block type '" + blockTypeToken.value + "'"));
	}
}

