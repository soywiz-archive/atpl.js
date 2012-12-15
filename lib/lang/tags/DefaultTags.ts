export import ExpressionParser = module('../../parser/ExpressionParser');
export import FlowException = module('../../parser/FlowException');
export import ParserNode = module('../../parser/ParserNode');

export interface ITemplateParser {
	addBlockFlowExceptionHandler(name: string);
	addBlockHandler(name: string, callback: (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) => void);
}

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
					default: throw (new Error("Unexpected '" + e.blockType + "'"));
				}
			}
		}
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
					/*
					case 'elseif':
						if (didElse) throw(new Error("Can't put 'elseif' after the 'else'"));
						tokenParserContext.write('} else if (undefined) {');
						didElse = true;
					break;
					*/
					case 'else':
						if (didElse) throw (new Error("Can't have two 'else'"));
						tokenParserContext.write('} else {');
						didElse = true;
						break;
					case 'endif':
						tokenParserContext.write('}');
						return;
					default: throw (new Error("Unexpected '" + e.blockType + "'"));
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
					default: throw (new Error("Unexpected '" + e.blockType + "'"));
				}
			}
		});
		tokenParserContext.write('runtimeContext.putBlock(that, ' + JSON.stringify(blockName) + ');');
	});

	// EXTENDS
	templateParser.addBlockHandler('extends', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();

		tokenParserContext.write('return runtimeContext.extends(that, ' + expressionNode.generateCode() + ');');
	});

	// FOR/ENDFOR
	templateParser.addBlockFlowExceptionHandler('endfor');
	templateParser.addBlockHandler('for', function (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var nodeId: any = expressionParser.parseIdentifier();
		expressionTokenReader.expectAndMoveNext('in');
		var nodeList = expressionParser.parseExpression();
		tokenParserContext.write('runtimeContext.createScope((function() { var k, list = ' + nodeList.generateCode() + '; for (k in list) { ' + (new ParserNode.ParserNodeAssignment(nodeId, new ParserNode.ParserNodeRaw("list[k]"))).generateCode() + '; ');
		try {
			templateParser.parseTemplateSync(tokenParserContext, templateTokenReader);
		} catch (e) {
			if (!(e instanceof FlowException.FlowException)) throw (e);
			switch (e.blockType) {
				case 'endfor':
					tokenParserContext.write('} }));');
					break;
				default: throw (new Error("Unexpected '" + e.blockType + "'"));
			}
		}
	});
}
