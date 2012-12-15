///<reference path='../imports.d.ts'/>

export import TokenReader          = module('../lexer/TokenReader');
export import _TemplateTokenizer   = module('../lexer/TemplateTokenizer');
export import _RuntimeContext      = module('../runtime/RuntimeContext');
export import _FlowException       = module('./FlowException');
export import _TokenParserContext  = module('./TokenParserContext');
export import _ExpressionParser    = module('./ExpressionParser');
export import DefaultTags          = module('../lang/tags/DefaultTags');

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
	blockHandlers:any = {};

	constructor(public templateProvider) {
		DefaultTags.register(this);
	}

	private addStandardBlockHandlers() {
		
	}

	addBlockFlowExceptionHandler(blockType) {
		this.addBlockHandler(blockType, function(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
			throw(new FlowException(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader));
		});
	}

	addBlockHandler(blockType, callback: (blockType, templateParser: TemplateParser, tokenParserContext: _TokenParserContext.TokenParserContext, templateTokenReader: any, expressionTokenReader: any) => void) {
		this.blockHandlers[blockType] = callback;
	}

	compileAndRenderToString(path, scope: any) {
		if (scope === undefined) scope = {};
		var runtimeContext = new RuntimeContext(this, scope);
		this.compileAndRender(path, runtimeContext);
		return runtimeContext.output;
	}

	compileAndRender(path, runtimeContext) {
		var template = new (this.compile(path).class)();
		template.render(runtimeContext);
		return template;
	}

	getEvalCode(path: string) {
		if (this.registry[path] !== undefined) {
			return this.registry[path];
		}
	
		//console.log("TemplateParser.prototype.compile: " + path);

		var content            = this.templateProvider.getSync(path);
	
		var templateTokenizer  = new TemplateTokenizer(content);
		var templateTokens     = templateTokenizer.tokenize();
		var tokenParserContext = new TokenParserContext();
	
		try {
			this.parseTemplateSync(tokenParserContext, new TokenReader.TokenReader(templateTokens));
		} catch (e) {
			if (e instanceof FlowException) {
				//console.log(e);
				throw(new Error("Unexpected tag '" + e.blockType + "' on template root"));
			}
			throw(e);
		}
		var blocks = tokenParserContext.blocksOutput;
		var output = '';
		output += 'CurrentTemplate = function() { };\n';
		output += 'CurrentTemplate.prototype.render = function(runtimeContext) { runtimeContext.setTemplate(this); this.__main(runtimeContext); };\n';
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

		debug(output);
		return { output: output, tokenParserContext: tokenParserContext };
	}

	compile(path: string) {
		if (this.registry[path] === undefined) {
			var info = this.getEvalCode(path);
			var output = info.output;
			var tokenParserContext = info.tokenParserContext;
			var CurrentTemplate = undefined;

			eval(output);

			//console.log(output);

			this.registry[path] = { output : output, class : CurrentTemplate };
		}
	
		return this.registry[path];
	}

	parseTemplateSync(tokenParserContext, tokenReader: TokenReader.TokenReader) {
		while (tokenReader.hasMore) {
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
	
		return;
	};

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
	
		var blockHandler = this.blockHandlers[blockType];
		if (blockHandler !== undefined) {
			return blockHandler(blockType, this, tokenParserContext, templateTokenReader, expressionTokenReader);
		}

		throw(new Error("Invalid block type '" + blockTypeToken.value + "'"));
	}
}

