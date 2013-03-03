import ExpressionParser = module('../parser/ExpressionParser');
import FlowException = module('../parser/FlowException');
import ParserNode = module('../parser/ParserNode');
import TemplateParser = module('../parser/TemplateParser');
import TokenParserContext = module('../parser/TokenParserContext');
import TokenReader = module('../lexer/TokenReader');

export interface ITemplateParser {
	addBlockFlowExceptionHandler(name: string);
	addBlockHandler(name: string, callback: (blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) => void);
}

function checkNoMoreTokens(expressionTokenReader) {
	if (expressionTokenReader.hasMore()) throw (new Error("Unexpected token '" + JSON.stringify(expressionTokenReader.peek()) + "'"));
	return expressionTokenReader;
}

function _flowexception(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader) {
	throw(new FlowException.FlowException(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader));
}

function handleOpenedTag(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader, handlers, innerNodeHandler: (node: ParserNode.ParserNode) => void) {
	while (true) {
		try {
			var keys = []; for (var key in handlers) keys.push(key);
			//console.log("[[");
			var node = templateParser.parseTemplateSyncOne(tokenParserContext, templateTokenReader);
			if (node == null) throw (new Error("Unexpected end of '" + blockType + "' no any of [" + keys.map((key) => "'" + key + "'").join(', ') + "]"));
			//console.log("]]");
			//console.log(node);
			innerNodeHandler(node);
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

export class ParserNodeAutoescape extends ParserNode.ParserNodeStatement {
	constructor(public expression: ParserNode.ParserNodeExpression, public inner: ParserNode.ParserNode) {
		super();
	}

	generateCode() {
		return (
			'runtimeContext.autoescape(' + this.expression.generateCode() + ', function() {' +
				this.inner.generateCode() +
			'}, true);'
		);
	}
}

export class ParserNodeStatementFilter extends ParserNode.ParserNodeStatement {
	filters = <{ name: string; parameters: ParserNode.ParserNodeCommaExpression; }[]>[];

	constructor(public inner: ParserNode.ParserNode) {
		super();
	}

	addFilter(filterName: string, filterParameters: ParserNode.ParserNodeCommaExpression) {
		this.filters.push({
			name: filterName,
			parameters: filterParameters,
		});
	}

	generateCode() {
		var out = '';

		out += 'runtimeContext.write(';
		this.filters.reverse().forEach((filter) => {
			out += 'runtimeContext.filter(' + JSON.stringify(filter.name) + ', [';
		});

		out += 'runtimeContext.captureOutput(function () {'
		out += this.inner.generateCode();
		out += '})';

		this.filters.reverse().forEach((filter) => {
			if (filter.parameters && filter.parameters.expressions.length > 0) {
				out += ',';
				out += filter.parameters.generateCode();
			}
			out += '])';
		});

		out += ');';

		return out
	}
}

export class ParserNodeScopeSet extends ParserNode.ParserNodeStatement {
	constructor(public key: string, public value: ParserNode.ParserNodeExpression) {
		super();
	}

	generateCode() {
		return 'runtimeContext.scope.set(' + JSON.stringify(this.key) + ', ' + this.value.generateCode() + ');';
	}
}

export class ParserNodeIf extends ParserNode.ParserNodeStatement {
	conditions: { expression: ParserNode.ParserNodeExpression; code: ParserNode.ParserNodeContainer; }[] = [];

	addCaseCondition(expression: ParserNode.ParserNodeExpression) {
		this.conditions.push({
			expression: expression,
			code: new ParserNode.ParserNodeContainer(),
		});
	}

	addElseCondition() {
		this.conditions.push({
			expression: null,
			code: new ParserNode.ParserNodeContainer(),
		});
	}

	addCodeToCondition(node: ParserNode.ParserNode) {
		this.conditions[this.conditions.length - 1].code.add(node);
	}

	generateCode() {
		var out = '';

		for (var n = 0; n < this.conditions.length; n++) {
			var condition = this.conditions[n];
			if (out != '') out += 'else ';
			if (condition.expression != null) out += 'if (' + condition.expression.generateCode() + ')';
			out += '{ ';
			out += condition.code.generateCode();
			out += '}';
		}

		return out;
	}
}

export class ParserNodeFor extends ParserNode.ParserNodeStatement {
	constructor(public keyId: any, public condId: any, public valueId: ParserNode.ParserNodeLeftValue, public nodeList: ParserNode.ParserNodeExpression, public forCode: ParserNode.ParserNode, public elseCode: ParserNode.ParserNode) {
		super();
	}

	generateCode() {
		var out = '';
		out += ('runtimeContext.createScope((function() { ');
		out += (' var list = ' + this.nodeList.generateCode() + ';');
		out += (' if (!runtimeContext.emptyList(list)) {');
		out += ('  runtimeContext.each(list, function(k, v) { ');
		out += ('   ' + (new ParserNode.ParserNodeAssignment(this.valueId, new ParserNode.ParserNodeRaw("v"))).generateCode() + ';');
		if (this.keyId !== undefined) {
			out += ('   ' + (new ParserNode.ParserNodeAssignment(this.keyId, new ParserNode.ParserNodeRaw("k"))).generateCode() + ';');
		}
		if (this.condId) {
			out += ('   if (' + this.condId.generateCode() + ') { ');
		} else {
			out += ('   if (true) { ');
		}
		
		out += this.forCode.generateCode();

		out += ('}'); // if condition
		
		out += ('  });'); // each
		out += ('} else {');
		{
			out += this.elseCode.generateCode();
		}
		out += ('} '); // if/else
		out += ('}));'); // createScope

		return out;
	}
}

export class DefaultTags {
	// autoescape
	static endautoescape = _flowexception;
	static autoescape(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		var innerNode = new ParserNode.ParserNodeContainer();

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'endautoescape': (e) => {
				return true;
			},
		}, (node) => {
			innerNode.add(node);
		});

		return new ParserNodeAutoescape(expressionNode, innerNode);
	}

	// DO/SET
	static set (blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var nodeIds = expressionParser.parseIdentifierCommaList();
		expressionTokenReader.expectAndMoveNext([ '=' ]);
		var nodeValues = expressionParser.parseCommaExpression();
		checkNoMoreTokens(expressionTokenReader);

		if (nodeIds.length != nodeValues.expressions.length) throw (new Error("variables doesn't match values"));

		var container = new ParserNode.ParserNodeContainer();

		for (var n = 0; n < nodeIds.length; n++) {
			container.add(new ParserNodeScopeSet(String((<any>nodeIds[n]).value), nodeValues.expressions[n]));
		}

		return container;
	}
	static $do(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		return new ParserNode.ParserNodeStatementExpression(expressionNode);
	}

	// EMBED
	// http://twig.sensiolabs.org/doc/tags/embed.html
	static endembed = _flowexception;
	static embed(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionString = expressionTokenReader.getSliceWithCallback(() => {
			var includeName = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		}).map(item => item.rawValue);
		checkNoMoreTokens(expressionTokenReader);

		var offsetStart = templateTokenReader.getOffset();
		var offsetEnd = offsetStart;

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'endembed': (e) => { offsetEnd = templateTokenReader.getOffset() - 1; return true; },
		}, (node) => {
		});
		var rawText = templateTokenReader.getSlice(offsetStart, offsetEnd).map((item) => (<any>item).rawText).join('');
		var templateString = '{% extends ' + expressionString + ' %}' + rawText;
		return new ParserNode.ParserNodeRaw('runtimeContext.include(runtimeContext.compileString(' + JSON.stringify(templateString) + '));');
	}

	// FILTER
	// http://twig.sensiolabs.org/doc/tags/filter.html
	static endfilter = _flowexception;
	static filter(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var innerNode = new ParserNode.ParserNodeContainer();

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'endfilter': (e) => { return true; },
		}, (node) => {
			innerNode.add(node);
		});

		var filterNode = new ParserNodeStatementFilter(innerNode);

		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		while (true) {
			var filterName = (<any>expressionParser.parseIdentifier()).value;
			var parameters = null;

			//console.log(filterName);

			if (expressionTokenReader.checkAndMoveNext(['('])) {
				parameters = expressionParser.parseCommaExpression();
				//console.log(parameters);
				expressionTokenReader.expectAndMoveNext([')']);
			}

			filterNode.addFilter(filterName, parameters);

			if (!expressionTokenReader.checkAndMoveNext(['|'])) {
				break;
			}
		}

		checkNoMoreTokens(expressionTokenReader);

		return filterNode;
	}

	// FLUSH
	// http://twig.sensiolabs.org/doc/tags/flush.html
	static flush(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		// do nothing (all output is buffered and can't be flushed)
	}

	// USE
	// http://twig.sensiolabs.org/doc/tags/use.html
	static use(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		throw (new Error("Not implemented tag [use]"));
	}

	// MACRO/FROM/IMPORTUSE
	static endmacro = _flowexception;
	static macro(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var macroName = expressionTokenReader.read().value;
		var paramNames = [];
		expressionTokenReader.expectAndMoveNext(['(']);
		if (expressionTokenReader.peek().value != ")") {
			while (true) {
				paramNames.push(expressionParser.parseIdentifier());
				if (expressionTokenReader.expectAndMoveNext([')', ',']) == ')') break;
			}
		} else {
			expressionTokenReader.expectAndMoveNext([')']);
		}
		checkNoMoreTokens(expressionTokenReader);

		var macroNode = new ParserNode.ParserNodeContainer();
		macroNode.add(new ParserNode.ParserNodeRaw('var _arguments = arguments;'));
		macroNode.add(new ParserNode.ParserNodeRaw('return runtimeContext.captureOutput(function() { '));
		macroNode.add(new ParserNode.ParserNodeRaw('return runtimeContext.autoescape(false, function() { '));
		macroNode.add(new ParserNode.ParserNodeRaw('runtimeContext.createScope(function() { '));

		paramNames.forEach((paramName, index) => {
			var assign = new ParserNode.ParserNodeAssignment(paramName, new ParserNode.ParserNodeRaw('_arguments[' + index + ']'))
			macroNode.add(new ParserNode.ParserNodeStatementExpression(assign));
		});

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'endmacro': (e) => {
				return true;
			},
		}, (node) => {
			macroNode.add(node);
		});

		macroNode.add(new ParserNode.ParserNodeRaw('});')); // createScope
		macroNode.add(new ParserNode.ParserNodeRaw('});')); // autoescape
		macroNode.add(new ParserNode.ParserNodeRaw('});')); // captureOutput

		var macroCode = tokenParserContext.setMacro(macroName, macroNode);
		//console.log(macroCode);
		return new ParserNode.ParserNodeRaw('');

	}
	static from(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var fileNameNode = expressionParser.parseExpression();
		expressionTokenReader.expectAndMoveNext(['import']);

		var pairs = [];

		while (expressionTokenReader.peek().value != null) {
			var fromNode = expressionTokenReader.read().value;
			var toNode = fromNode;
			var token = expressionTokenReader.expectAndMoveNext(['as', ',', null]);
			if (token == 'as') {
				toNode = expressionTokenReader.read().value;
				expressionTokenReader.expectAndMoveNext([',', null]);
			}
			pairs.push([fromNode, toNode]);
		}

		checkNoMoreTokens(expressionTokenReader);

		return new ParserNode.ParserNodeContainer([
			new ParserNode.ParserNodeRaw('runtimeContext.fromImport('),
			fileNameNode,
			new ParserNode.ParserNodeRaw(', ' + JSON.stringify(pairs) + ');')
		]);
	}
	static $import(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionParser = new ExpressionParser.ExpressionParser(expressionTokenReader);
		var fileNameNode = expressionParser.parseExpression();
		expressionTokenReader.expectAndMoveNext(['as']);
		var aliasNode = <ParserNode.ParserNodeLeftValue>expressionParser.parseIdentifier();

		checkNoMoreTokens(expressionTokenReader);

		return new ParserNode.ParserNodeStatementExpression(
			new ParserNode.ParserNodeAssignment(aliasNode, new ParserNode.ParserNodeRaw('runtimeContext.import(' + fileNameNode.generateCode() + ')'))
		);
	}

	// INCLUDE
	static include(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var node = new ParserNode.ParserNodeContainer();
		node.add(new ParserNode.ParserNodeRaw('runtimeContext.include('));
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		node.add(expressionNode);
		if (expressionTokenReader.checkAndMoveNext(['with'])) {
			node.add(new ParserNode.ParserNodeRaw(','));
			node.add((new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression());
		} else {
			node.add(new ParserNode.ParserNodeRaw(', undefined'));
		}
		if (expressionTokenReader.checkAndMoveNext(['only'])) {
			node.add(new ParserNode.ParserNodeRaw(', true'));
		} else {
			node.add(new ParserNode.ParserNodeRaw(', false'));
		}
		checkNoMoreTokens(expressionTokenReader);
		node.add(new ParserNode.ParserNodeRaw(');'));

		return node;
	}

	// RAW/VERBATIM
	// http://twig.sensiolabs.org/doc/tags/verbatim.html
	static endraw = _flowexception;
	static endverbatim = _flowexception;
	static raw(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		checkNoMoreTokens(expressionTokenReader);
		//console.log(templateTokenReader);

		//var rawText = templateTokenReader.tokens

		var offsetStart = templateTokenReader.getOffset();
		var offsetEnd = offsetStart;

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'endverbatim': (e) => { offsetEnd = templateTokenReader.getOffset() - 1; return true; },
			'endraw': (e) => { offsetEnd = templateTokenReader.getOffset() - 1; return true; },
		}, (node) => {
		});

		var rawText = templateTokenReader.getSlice(offsetStart, offsetEnd).map((item) => (<any>item).rawText).join('');
		//console.log('-----------------------------');
		//console.log(templateTokenReader.getSlice(offsetStart, offsetEnd));
		//console.log('-----------------------------');
		//console.log(rawText);
		//console.log('-----------------------------');

		return new ParserNode.ParserNodeOutputText(rawText);
		//throw (new Error("Not implemented tag [raw/verbatim]"));
	}
	static verbatim = DefaultTags.raw;

	// SANDBOX
	static sandbox(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		throw (new Error("Not implemented tag [sandbox]"));
	}

	// SPACELESS
	// http://twig.sensiolabs.org/doc/tags/spaceless.html
	static endspaceless = _flowexception;
	static spaceless(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		checkNoMoreTokens(expressionTokenReader);

		var innerNode = new ParserNode.ParserNodeContainer();

		//console.log('************************');
		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'endspaceless': (e) => {
				return true;
			},
		}, (node) => {
			//console.log(node);
			innerNode.add(node);
		});
		//console.log('************************');

		return new ParserNode.ParserNodeContainer([
			new ParserNode.ParserNodeRaw('runtimeContext.write(runtimeContext.filter("spaceless", [runtimeContext.captureOutput(function() { '),
			innerNode,
			new ParserNode.ParserNodeRaw('})]));')
		]);
	}

	// IF/ELSEIF/ELSE/ENDIF
	static $else = _flowexception;
	static $elseif = _flowexception;
	static $endif = _flowexception;
	static $if(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var didElse = false;

		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);


		var parserNodeIf = new ParserNodeIf();

		parserNodeIf.addCaseCondition(expressionNode);

		//tokenParserContext.write('if (' + expressionNode.generateCode() + ') {');

		//parseExpressionExpressionSync

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'elseif': (e) => {
				if (didElse) throw (new Error("Can't put 'elseif' after the 'else'"));

				var expressionNode = (new ExpressionParser.ExpressionParser(e.expressionTokenReader)).parseExpression();
				checkNoMoreTokens(expressionTokenReader);
				parserNodeIf.addCaseCondition(expressionNode);
			},
			'else': (e) => {
				if (didElse) throw (new Error("Can't have two 'else'"));
				parserNodeIf.addElseCondition();
				didElse = true;
			},
			'endif': (e) => {
				return true;
			},
		}, (node) => {
			parserNodeIf.addCodeToCondition(node);
		});

		return parserNodeIf;
	}

	// BLOCK/ENDBLOCK
	static endblock = _flowexception;
	static block(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var blockName = 'block_' + expressionTokenReader.read().value;

		var innerNode = new ParserNode.ParserNodeContainer();

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'endblock': (e) => {
				return true;
			},
		}, (node) => {
			innerNode.add(node);
		});

		tokenParserContext.setBlock(blockName, innerNode);

		return new ParserNode.ParserNodeRaw('runtimeContext.putBlock(' + JSON.stringify(blockName) + ');');
	}

	// EXTENDS
	static $extends(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
		var expressionNode = (new ExpressionParser.ExpressionParser(expressionTokenReader)).parseExpression();
		checkNoMoreTokens(expressionTokenReader);

		return new ParserNode.ParserNodeContainer([
			new ParserNode.ParserNodeRaw('return runtimeContext.extends('),
			expressionNode,
			new ParserNode.ParserNodeRaw(');')
		]);
	}

	// http://twig.sensiolabs.org/doc/tags/for.html
	static $endfor = _flowexception;
	static $for(blockType: string, templateParser: TemplateParser.TemplateParser, tokenParserContext: TokenParserContext.TokenParserContext, templateTokenReader: TokenReader.TokenReader, expressionTokenReader: TokenReader.TokenReader) {
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

		var forCode = new ParserNode.ParserNodeContainer();
		var elseCode = new ParserNode.ParserNodeContainer();

		handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
			'else': (e) => {
				if (didElse) throw (new Error("Can't have two 'else'"));
				didElse = true;
			},
			'endfor': (e) => {
				return true;
			},
		}, (node) => {
			if (!didElse) {
				forCode.add(node);
			} else {
				elseCode.add(node);
			}
		});

		return new ParserNodeFor(keyId, condId, valueId, nodeList, forCode, elseCode);
	}
}
