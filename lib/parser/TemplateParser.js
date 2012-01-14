var TemplateTokenizer   = require('./../lexer/TemplateTokenizer.js').TemplateTokenizer;
var TokenReader         = require('./../lexer/TokenReader.js').TokenReader;
var FlowException       = require('./FlowException.js').FlowException;
var TokenParserContext  = require('./TokenParserContext.js').TokenParserContext;
var ExpressionParser    = require('./ExpressionParser.js').ExpressionParser;


function debug(data) {
	//console.log(data);
}

var TemplateParser = function(templateProvider) {
	this.templateProvider = templateProvider;
	this.registry = {};
	this.blockHandlers = {};
	this.addStandardBlockHandlers();
};

TemplateParser.prototype.addStandardBlockHandlers = function() {
	// IF/ELSEIF/ELSE/ENDIF
	this.addBlockFlowExceptionHandler('else');
	this.addBlockFlowExceptionHandler('elseif');
	this.addBlockFlowExceptionHandler('endif');
	this.addBlockHandler('if', function(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var blockName = expressionTokenReader.read();
		var didElse = false;
		var done = false;
		
		tokenParserContext.write('if (undefined) {');
		
		//parseExpressionExpressionSync
		
		while (!done) {
			try {
				templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
			} catch (e) {
				if (!(e instanceof FlowException)) throw(e);
				switch (e.blockType) {
					/*
					case 'elseif':
						if (didElse) throw(new Error("Can't put 'elseif' after the 'else'"));
						tokenParserContext.write('} else if (undefined) {');
						didElse = true;
					break;
					*/
					case 'else':
						if (didElse) throw(new Error("Can't have two 'else'"));
						tokenParserContext.write('} else {');
						didElse = true;
					break;
					case 'endif':
						tokenParserContext.write('}');
						done = true;
					break;
					default: throw(new Error("Unexpected '" + e.blockType + "'"));
				}
			}
		}
	});
	
	// BLOCK/ENDBLOCK
	this.addBlockFlowExceptionHandler('endblock');
	this.addBlockHandler('block', function(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var blockName = 'block_' + expressionTokenReader.read().value;
		tokenParserContext.setBlock(blockName, function() {
			try {
				templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
			} catch (e) {
				if (!(e instanceof FlowException)) throw(e);
				switch (e.blockType) {
					case 'endblock':
					break;
					default: throw(new Error("Unexpected '" + e.blockType + "'"));
				}
			}
		});
		tokenParserContext.write('this.' + (blockName) + '(context);');
	});
	
	// EXTENDS
	this.addBlockHandler('extends', function(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		tokenParserContext.parentName = expressionTokenReader.read().value;
		//tokenParserContext.addAsyncCallback = function() {
			//console.log("extends!");
		//};
	});

	// FOR/ENDFOR
	this.addBlockFlowExceptionHandler('endfor');
	this.addBlockHandler('for', function(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
	});
};

TemplateParser.prototype.addBlockFlowExceptionHandler = function(blockType) {
	this.addBlockHandler(blockType, function(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw(new FlowException(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader));
	});
};

TemplateParser.prototype.addBlockHandler = function(blockType, callback) {
	this.blockHandlers[blockType] = callback;
};

TemplateParser.prototype.compileAndRenderToString = function(path, doneCallback) {
	var output = '';
	var context = {
		write: function(text) { output += text; },
	};
	this.compileAndRender(path, context, function() {
		doneCallback(output);
	});
};

TemplateParser.prototype.compileAndRender = function(path, context, doneCallback) {
	this.compile(path, function(Template) {
		Template.setParentAsync(function() {
			var template = new Template();
			template.render(context);
			doneCallback();
		});
	});
};

TemplateParser.prototype.compile = function(path, doneCallback) {
	var that = this;
	if (that.registry[path] !== undefined) {
		doneCallback(that.registry[path]);
	} else {
		that.templateProvider.getAsync(path, function(content) {
			var templateTokenizer = new TemplateTokenizer(content);
			var templateTokens = templateTokenizer.tokenize();
			var tokenParserContext = new TokenParserContext();
			
			that.parseTemplateSync(tokenParserContext, new TokenReader(templateTokens));
			var blocks = tokenParserContext.blocksOutput;
			tokenParserContext.executeLeftCallbacks(function() {
				var output = '';
				var CurrentTemplate = undefined;
				output += 'CurrentTemplate = function() { };';
				output += 'CurrentTemplate.parentName = ' + JSON.stringify(tokenParserContext.parentName) + ';';
				output += 'CurrentTemplate.prototype.render = function(context) { this.__main(context); };';
				//output += 'CurrentTemplate.prototype.setParentAsync = function(doneCallback) { doneCallback(); };';
				for (var blockName in blocks) {
					var block = blocks[blockName];
					output += 'CurrentTemplate.prototype.' + blockName + ' = function(context) {';
					output += block;
					output += '}; ';
				}

				debug(output);
				eval(output);
				
				CurrentTemplate.setParentAsync = function(doneCallback) {
					if (this.parentName == '') return doneCallback();
					debug('setParentAsync: ' + this.parentName);
					that.compile(this.parentName, function(ParentTemplate) {
						CurrentTemplate.prototype.__proto__ = ParentTemplate.prototype;
						CurrentTemplate.prototype.__main = ParentTemplate.prototype.__main;
						return doneCallback();
					});
				};
				
				/*
				new CurrentTemplate().render({
					write: function(text) {
						console.log('Render: ' + text);
					}
				});
				*/

				that.registry[path] = CurrentTemplate;
				
				doneCallback(that.registry[path]);
			});
		});
	}
};

TemplateParser.prototype.parseTemplateSync = function(tokenParserContext, tokenReader) {
	while (tokenReader.hasMore()) {
		var item = tokenReader.peek();
		debug('parseTemplateSync: ' + item.type);
		switch (item.type) {
			case 'text':
				item = tokenReader.read();
				tokenParserContext.write(
					'context.write(' + JSON.stringify(String(item.value)) + ');'
				);
			break;
			case 'expression':
				item = tokenReader.read();
				// Propagate the "not done".
				this.parseTemplateExpressionSync(tokenParserContext, tokenReader, new TokenReader(item.value));
			break;
			case 'block':
				item = tokenReader.read();
				// Propagate the "not done".
				this.parseTemplateBlockSync(tokenParserContext, tokenReader, new TokenReader(item.value));
			break;
			default:
				throw(new Error("Invalid item.type == '" + item.type + "'"));
		}
	}
	
	return;
};

TemplateParser.prototype.parseTemplateExpressionSync = function(tokenParserContext, templateTokenReader, expressionTokenReader) {
	throw(new Error("Not implemented!"));
};

TemplateParser.prototype.parseTemplateBlockSync = function(tokenParserContext, templateTokenReader, expressionTokenReader) {
	var that = this;
	var blockTypeToken = expressionTokenReader.read();
	var blockType = blockTypeToken.value;
	if (blockTypeToken.type != 'id') throw(new Error("Block expected a type as first token but found : " + JSON.stringify(firstToken)));
	debug('BLOCK: ' + blockType);
	
	var blockHandler = this.blockHandlers[blockType];
	if (blockHandler !== undefined) {
		return blockHandler(blockType, this, tokenParserContext, templateTokenReader, expressionTokenReader);
	}

	throw(new Error("Invalid block type '" + blockTypeToken.value + "'"));
};

exports.TemplateParser = TemplateParser;
