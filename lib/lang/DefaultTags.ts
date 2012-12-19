export import ExpressionParser = module('../parser/ExpressionParser');
export import FlowException = module('../parser/FlowException');
export import ParserNode = module('../parser/ParserNode');
export import TokenReader = module('../lexer/TokenReader');

export interface ITemplateParser {
	addBlockFlowExceptionHandler(name: string);
	addBlockHandler(name: string, callback: (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) => void);
}

/*
export class ParserNodeAutoescape extends ParserNode.ParserNode {
	constructor(private expression: ParserNode.ParserNodeExpression, private innerCode: ParserNode.ParserNode) {
		super();
	}

	generateCode() {
		return 'runtimeContext.autoescape(' + this.expression.generateCode() + ', function() {' + this.innerCode.generateCode() + '});';
	}
}
*/

function checkNoMoreTokens(expressionTokenReader) {
	if (expressionTokenReader.hasMore()) throw (new Error("Unexpected token '" + JSON.stringify(expressionTokenReader.peek()) + "'"));
	return expressionTokenReader;
}

function _flowexception(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
	throw(new FlowException.FlowException(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader));
}

function handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, handlers) {
	while (true) {
		try {
			var keys = []; for (var key in handlers) keys.push(key);
			if (!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
				throw (new Error("Unexpected end of '" + blockType + "' no any of [" + keys.map((key) => "'" + key + "'").join(', ') + "]"));
			}
		} catch (e) {
			if (!(e instanceof FlowException.FlowException)) throw (e);
			var handler = handlers[e.blockType];
			if (handler !== undefined) {
				if (handler(e)) return;
			} else {
				throw (new Error("Unexpected '" + e.blockType + "' for '" + blockType + "'"));
			}
		}
	}
}

// @TODO: blockHandlers should return a ParserNode/AstNode and the output should be generated at the end instead of writing now.
export class DefaultTags {
	// autoescape
	static endautoescape = _flowexception;
	static autoescape(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		tokenParserContext.write('runtimeContext.autoescape(' + expressionNode.generateCode() + ', function() {');

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'endautoescape': (e) => {
				tokenParserContext.write('});');
				return true;
			},
		});
	}

	// DO/SET
	static set(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var nodeId: any = expressionParser.parseIdentifier();
		expressionTokenReader.expectAndMoveNext('=');
		var nodeValue = expressionParser.parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		tokenParserContext.write('runtimeContext.scope.set(' + JSON.stringify(nodeId.value) + ', ' + nodeValue.generateCode()  + ');');
	}
	static $do(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [do]"));
	}

	// EMBED
	static embed(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [embed]"));
	}

	// FILTER
	static filter(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [filter]"));
	}

	// FLUSH
	static flush(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		// do nothing (all output is buffered and can't be flushed)
	}

	// USE
	static use(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [use]"));
	}

	// MACRO/FROM/IMPORTUSE
	static endmacro = _flowexception;
	static macro(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var macroName = expressionTokenReader.read().value;
		var paramNames = [];
		expressionTokenReader.expectAndMoveNext(['(']);
		if (expressionTokenReader.peek().value != ")") {
			while (true) {
				paramNames.push(expressionTokenReader.read().value);
				if (expressionTokenReader.expectAndMoveNext([')', ',']) == ')') break;
			}
		}
		checkNoMoreTokens(expressionTokenReader);

		console.log(paramNames);

		tokenParserContext.setMacro(macroName, function () {
			handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
				'endmacro': (e) => {
					return true;
				},
			});
		});

	}
	static from(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [from]"));
	}
	static $import(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var fileNameNode = expressionParser.parseExpression();
		expressionTokenReader.expectAndMoveNext(['as']);
		var aliasNode = <ParserNode.ParserNodeLeftValue>expressionParser.parseIdentifier();

		checkNoMoreTokens(expressionTokenReader);

		var assign = new ParserNode.ParserNodeAssignment(aliasNode, new ParserNode.ParserNodeRaw('runtimeContext.import(' + fileNameNode.generateCode() + ')'))
		tokenParserContext.write(assign.generateCode() + ";");
	}

	// INCLUDE
	static include(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		tokenParserContext.write('runtimeContext.include(' + expressionNode.generateCode() + ');');
	}

	// RAW
	static raw(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [raw]"));
	}

	// SANDBOX
	static sandbox(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [sandbox]"));
	}

	// SPACELESS
	static spaceless(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [spaceless]"));
	}

	// IF/ELSEIF/ELSE/ENDIF
	static $else = _flowexception;
	static $elseif = _flowexception;
	static $endif = _flowexception;
	static $if(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var didElse = false;

		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		tokenParserContext.write('if (' + expressionNode.generateCode() + ') {');

		//parseExpressionExpressionSync

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'elseif': (e) => {
				if (didElse) throw (new Error("Can't put 'elseif' after the 'else'"));

				var expressionNode = (new ExpressionParser.ExpressionParser(e.expressionTokenReader)).parseExpression();
				checkNoMoreTokens(expressionTokenReader);
				tokenParserContext.write('} else if (' + expressionNode.generateCode() + ') {');
			},
			'else': (e) => {
				if (didElse) throw (new Error("Can't have two 'else'"));
				tokenParserContext.write('} else {');
				didElse = true;
			},
			'endif': (e) => {
				tokenParserContext.write('}');
				return true;
			},
		});
	}

	// BLOCK/ENDBLOCK
	static endblock = _flowexception;
	static block(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var blockName = 'block_' + expressionTokenReader.read().value;
		tokenParserContext.setBlock(blockName, function () {
			handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
				'endblock': (e) => {
					return true;
				},
			});
		});
		tokenParserContext.write('runtimeContext.putBlock(' + JSON.stringify(blockName) + ');');
	}

	// EXTENDS
	static $extends(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		tokenParserContext.write('return runtimeContext.extends(' + expressionNode.generateCode() + ');');
	}

	// http://twig.sensiolabs.org/doc/tags/for.html
	static $endfor = _flowexception;
	static $for(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var didElse = false;
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var valueId: any = expressionParser.parseIdentifier();
		var keyId: any = undefined;
		var condId: any = undefined;
		var res = expressionTokenReader.expectAndMoveNext([',', 'in']);
		if (res == ',') {
			keyId = valueId;
			valueId = expressionParser.parseIdentifier();
			expressionTokenReader.expectAndMoveNext(['in']);
		}
		var nodeList = expressionParser.parseExpression();

		// Since Twig 1.2
		if (expressionTokenReader.checkAndMoveNext(['if'])) {
			condId = expressionParser.parseExpression();
		}

		checkNoMoreTokens(expressionTokenReader);

		tokenParserContext.write('runtimeContext.createScope((function() { ');
		tokenParserContext.write(' var list = ' + nodeList.generateCode() + ';'); 
		tokenParserContext.write(' if (!runtimeContext.emptyList(list)) {'); 
		tokenParserContext.write('  runtimeContext.each(list, function(k, v) { '); 
		tokenParserContext.write('   ' + (new ParserNode.ParserNodeAssignment(valueId, new ParserNode.ParserNodeRaw("v"))).generateCode() + ';');
		if (keyId !== undefined) {
			tokenParserContext.write('   ' + (new ParserNode.ParserNodeAssignment(keyId, new ParserNode.ParserNodeRaw("k"))).generateCode() + ';');
		}
		if (condId) {
			tokenParserContext.write('   if (' + condId.generateCode() + ') { ');
		}
		
		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'else': (e) => {
				if (didElse) throw (new Error("Can't have two 'else'"));
				tokenParserContext.write('}); } else {');
				didElse = true;
			},
			'endfor': (e) => {
				if (condId) tokenParserContext.write('} ');
				if (!didElse) tokenParserContext.write('}); ');
				tokenParserContext.write('} }));');
				return true;
			},
		});
	}
}
