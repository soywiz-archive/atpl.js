export import ExpressionParser = module('../parser/ExpressionParser');
export import FlowException = module('../parser/FlowException');
export import ParserNode = module('../parser/ParserNode');

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

// @TODO: blockHandlers should return a ParserNode/AstNode and the output should be generated at the end instead of writing now.
export class DefaultTags {
	// autoescape
	static endautoescape = _flowexception;
	static autoescape(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		tokenParserContext.write('runtimeContext.autoescape(' + expressionNode.generateCode() + ', function() {');

		while (true) {
			try {
				if (!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
					throw (new Error("Unexpected end of 'autoescape' no closing 'endautoescape'"));
				}
			} catch (e) {
				if (!(e instanceof FlowException.FlowException)) throw (e);
				switch (e.blockType) {
					case 'endautoescape':
						tokenParserContext.write('});');
						return;
					default: throw (new Error("Unexpected '" + e.blockType + "' for 'autoescape'"));
				}
			}
		}
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
		throw (new Error("Not implemented tag [flush]"));
	}

	// MACRO/FROM/IMPORTUSE
	static use(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [use]"));
	}
	static macro(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [macro]"));
	}
	static from(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [from]"));
	}
	static $import(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [import]"));
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

		while (true) {
			try {
				if (!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
					throw (new Error("Unexpected end of 'if' no closing 'endif'"));
				}
			} catch (e) {
				if (!(e instanceof FlowException.FlowException)) throw (e);
				switch (e.blockType) {
					case 'elseif':
						if (didElse) throw (new Error("Can't put 'elseif' after the 'else'"));

						var expressionNode = (new ExpressionParser.ExpressionParser(e.expressionTokenReader)).parseExpression();
						checkNoMoreTokens(expressionTokenReader);
						tokenParserContext.write('} else if (' + expressionNode.generateCode() + ') {');
						break;
					case 'else':
						if (didElse) throw (new Error("Can't have two 'else'"));
						tokenParserContext.write('} else {');
						didElse = true;
						break;
					case 'endif':
						tokenParserContext.write('}');
						return;
					default: throw (new Error("Unexpected '" + e.blockType + "' for 'if'"));
				}
			}
		}
	}

	// BLOCK/ENDBLOCK
	static endblock = _flowexception;
	static block(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var blockName = 'block_' + expressionTokenReader.read().value;
		tokenParserContext.setBlock(blockName, function () {
			try {
				if (!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
					throw (new Error("Unexpected end of 'block' no closing 'endblock'"));
				}
			} catch (e) {
				if (!(e instanceof FlowException.FlowException)) throw (e);
				switch (e.blockType) {
					case 'endblock':
						return;
					default: throw (new Error("Unexpected '" + e.blockType + "' for 'block'"));
				}
			}
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
		while (true) {
			try {
				if (!templateParser.parseTemplateSync(tokenParserContext, templateTokenReader)) {
					throw (new Error("Unexpected end of 'for' no closing 'endfor'"));
				}
			} catch (e) {
				if (!(e instanceof FlowException.FlowException)) throw (e);
				switch (e.blockType) {
					case 'else':
						if (didElse) throw (new Error("Can't have two 'else'"));
						tokenParserContext.write('}); } else {');
						didElse = true;
						continue;
					case 'endfor':
						if (condId) tokenParserContext.write('} ');
						if (!didElse) tokenParserContext.write('}); ');
						tokenParserContext.write('} }));');
						return;
					default: throw (new Error("Unexpected '" + e.blockType + "' for 'for'"));
				}
			}
		}
	}
}
