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

// @TODO: blockHandlers should return a ParserNode/AstNode and the output should be generated at the end instead of writing now.
export function register(templateParser: ITemplateParser) {
	// AUTOESCAPE
	templateParser.addBlockFlowExceptionHandler('endautoescape');
	templateParser.addBlockHandler('autoescape', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();

		tokenParserContext.write('runtimeContext.autoescape(' + expressionNode.generateCode() + ', function() {');

		while (true) {
			try {
				templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
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
	});

	// DO/SET
	templateParser.addBlockHandler('set', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var nodeId: any = expressionParser.parseIdentifier();
		expressionTokenReader.expectAndMoveNext('=');
		var nodeValue = expressionParser.parseExpression();

		tokenParserContext.write('runtimeContext.scope.set(' + JSON.stringify(nodeId.value) + ', ' + nodeValue.generateCode()  + ');');

	});
	templateParser.addBlockHandler('do', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [do]"));
	});

	// EMBED
	templateParser.addBlockHandler('embed', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [embed]"));
	});

	// FILTER
	templateParser.addBlockHandler('filter', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [filter]"));
	});

	// FLUSH
	templateParser.addBlockHandler('flush', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [flush]"));
	});

	// MACRO/FROM/IMPORTUSE
	templateParser.addBlockHandler('use', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [use]"));
	});
	templateParser.addBlockHandler('macro', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [macro]"));
	});
	templateParser.addBlockHandler('from', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [from]"));
	});
	templateParser.addBlockHandler('import', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [import]"));
	});

	// INCLUDE
	templateParser.addBlockHandler('include', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();

		tokenParserContext.write('runtimeContext.include(' + expressionNode.generateCode() + ');');
	});

	// RAW
	templateParser.addBlockHandler('raw', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [raw]"));
	});

	// SANDBOX
	templateParser.addBlockHandler('sandbox', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [sandbox]"));
	});

	// RAW
	templateParser.addBlockHandler('raw', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [raw]"));
	});

	// SPACELESS
	templateParser.addBlockHandler('spaceless', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		throw (new Error("Not implemented tag [spaceless]"));
	});

	// IF/ELSEIF/ELSE/ENDIF
	templateParser.addBlockFlowExceptionHandler('else');
	templateParser.addBlockFlowExceptionHandler('elseif');
	templateParser.addBlockFlowExceptionHandler('endif');
	templateParser.addBlockHandler('if', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var didElse = false;

		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		tokenParserContext.write('if (' + expressionNode.generateCode() + ') {');

		//parseExpressionExpressionSync

		while (true) {
			try {
				templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
			} catch (e) {
				if (!(e instanceof FlowException.FlowException)) throw (e);
				switch (e.blockType) {
					case 'elseif':
						if (didElse) throw(new Error("Can't put 'elseif' after the 'else'"));

						var expressionNode = (new ExpressionParser.ExpressionParser(e.expressionTokenReader)).parseExpression();
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
	});

	// BLOCK/ENDBLOCK
	templateParser.addBlockFlowExceptionHandler('endblock');
	templateParser.addBlockHandler('block', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var blockName = 'block_' + expressionTokenReader.read().value;
		tokenParserContext.setBlock(blockName, function () {
			try {
				templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
			} catch (e) {
				if (!(e instanceof FlowException.FlowException)) throw (e);
				switch (e.blockType) {
					case 'endblock':
						break;
					default: throw (new Error("Unexpected '" + e.blockType + "' for 'block'"));
				}
			}
		});
		tokenParserContext.write('runtimeContext.putBlock(' + JSON.stringify(blockName) + ');');
	});

	// EXTENDS
	templateParser.addBlockHandler('extends', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();

		tokenParserContext.write('return runtimeContext.extends(' + expressionNode.generateCode() + ');');
	});

	// FOR/ENDFOR
	templateParser.addBlockFlowExceptionHandler('endfor');
	templateParser.addBlockHandler('for', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
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
		if (expressionTokenReader.checkAndMoveNext(['if'])) {
			condId = expressionParser.parseExpression();
		}

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
				templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
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
	});
}
