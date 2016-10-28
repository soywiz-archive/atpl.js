import { ExpressionParser } from '../parser/ExpressionParser';
import { Scope } from '../runtime/Scope';
import {
  ParserNode,
  ParserNodeExpression,
  ParserNodeStatement,
  ParserNodeGenerateCodeContext,
  ParserNodeCommaExpression,
  ParserNodeContainer,
  ParserNodeLeftValue,
  ParserNodeAssignment,
  ParserNodeRaw,
  ParserNodeLiteral,
  ParserNodeContainerExpression,
  ParserNodeStatementExpression,
  ParserNodeIdentifier,
  ParserNodeOutputNodeExpression,
  ParserNodeReturnStatement,
  ParserNodeOutputText,
  ParserNodeWriteExpression
} from '../parser/ParserNode';
import { TokenParserContext } from '../parser/TokenParserContext';
import { TemplateParser, FlowException } from '../parser/TemplateParser';
import { TokenReader } from '../lexer/TokenReader';
import RuntimeUtils = require('../runtime/RuntimeUtils');
import { RuntimeContext } from '../runtime/RuntimeContext';

interface ITemplateParser {
  addBlockFlowExceptionHandler(name: string): void;
  addBlockHandler(name: string, callback: (blockType: any, templateParser: any, tokenParserContext: any, templateTokenReader: any, expressionTokenReader: any) => void): void;
}

function checkNoMoreTokens(expressionTokenReader: TokenReader) {
  //console.log(expressionTokenReader);
  //console.log(expressionTokenReader.hasMore());
  if (expressionTokenReader.hasMore()) {
    //console.log(expressionTokenReader);
    throw (new Error("Unexpected token '" + JSON.stringify(expressionTokenReader.peek()) + "'"));
  }
  return expressionTokenReader;
}

function _flowexception(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
  throw new FlowException(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader);
}

function handleOpenedTag(
  blockType: string,
  templateParser: TemplateParser,
  tokenParserContext: TokenParserContext,
  templateTokenReader: TokenReader,
  expressionTokenReader: TokenReader,
  handlers: { [key: string]: ((e: FlowException) => boolean) },
  innerNodeHandler: (node: ParserNode, nodeStart: number, nodeEnd: number) => void
) {
  while (true) {
    try {
      var keys: string[] = [];
      for (var key in handlers) keys.push(key);
      //console.log("[[");
      var nodeStart = templateTokenReader.tokenizer.stringReader.position;
      var node = templateParser.parseTemplateSyncOne(tokenParserContext, templateTokenReader);
      var nodeEnd = templateTokenReader.tokenizer.stringReader.position;
      if (node == null) throw new Error("Unexpected end of '" + blockType + "' no any of [" + keys.map((key) => "'" + key + "'").join(', ') + "]");
      //console.log("]]");
      //console.log(node);
      innerNodeHandler(node, nodeStart, nodeEnd);
    } catch (e) {
      if (!(e instanceof FlowException)) throw (e);
      var handler = handlers[e.blockType];
      if (handler !== undefined) {
        if (handler(e)) return;
      } else {
        throw (new Error("Unexpected '" + e.blockType + "' for '" + blockType + "'"));
      }
    }
  }
}

function _self(expression: ParserNodeExpression, path: string) {
  let self = DefaultTags._self;
  let fileNameNode = <ParserNodeLiteral> expression;
  if (fileNameNode.value === '_self') {
    self.value = path;
    fileNameNode = self;
  }
  DefaultTags._self = fileNameNode;
  return fileNameNode;
}

class ParserNodeAutoescape extends ParserNodeStatement {
  constructor(public expression: ParserNodeExpression, public inner: ParserNode) {
    super();
  }

  iterate(handler: (node: ParserNode) => void) {
    handler(this);
    this.expression.iterate(handler);
    this.inner.iterate(handler);
  }

  generateCode(context: ParserNodeGenerateCodeContext) {
    return (
      'runtimeContext.autoescape(' + this.expression.generateCode(context) + ', function() {' +
      this.inner.generateCode(context) +
      '}, true);'
    );
  }
}

class ParserNodeExpressionFilter extends ParserNodeExpression {
  filters: { name: string; parameters: ParserNodeCommaExpression; }[] = [];

  constructor(public inner: ParserNode) {
    super();
  }

  iterate(handler: (node: ParserNode) => void) {
    handler(this);
    this.inner.iterate(handler);
    this.filters.forEach(item => item.parameters.iterate(handler));
  }

  addFilter(filterName: string, filterParameters: ParserNodeCommaExpression) {
    this.filters.push({
      name: filterName,
      parameters: filterParameters,
    });
  }

  generateCode(context: ParserNodeGenerateCodeContext) {
    var out = '';

    this.filters.reverse().forEach((filter) => {
      out += 'runtimeContext.filter(' + JSON.stringify(filter.name) + ', [';
    });

    out += 'runtimeContext.captureOutput(function () {';
    out += this.inner.generateCode(context);
    out += '})';

    this.filters.reverse().forEach((filter) => {
      if (filter.parameters && filter.parameters.expressions.length > 0) {
        out += ',';
        out += filter.parameters.generateCode(context);
      }
      out += '])';
    });

    return out
  }
}

class ParserNodeScopeSet extends ParserNodeStatement {
  constructor(public key: string, public value: ParserNodeExpression) {
    super();
  }

  iterate(handler: (node: ParserNode) => void) {
    handler(this);
    this.value.iterate(handler);
  }

  generateCode(context: ParserNodeGenerateCodeContext) {
    return 'runtimeContext.scope.setUpdate(' + JSON.stringify(this.key) + ', ' + this.value.generateCode(context) + ');';
  }
}

class ParserNodeIf extends ParserNodeStatement {
  conditions: { expression: ParserNodeExpression; code: ParserNodeContainer; }[] = [];

  iterate(handler: (node: ParserNode) => void) {
    handler(this);
    this.conditions.forEach(node => { node.code.iterate(handler); node.expression.iterate(handler); });
  }

  addCaseCondition(expression: ParserNodeExpression) {
    this.conditions.push({
      expression: expression,
      code: new ParserNodeContainer([]),
    });
  }

  addElseCondition() {
    this.conditions.push({
      expression: null,
      code: new ParserNodeContainer([]),
    });
  }

  addCodeToCondition(node: ParserNode) {
    this.conditions[this.conditions.length - 1].code.add(node);
  }

  generateCode(context: ParserNodeGenerateCodeContext) {
    var out = '';

    for (var n = 0; n < this.conditions.length; n++) {
      var condition = this.conditions[n];
      if (out != '') out += 'else ';
      if (condition.expression != null) out += 'if (' + condition.expression.generateCode(context) + ')';
      out += '{ ';
      out += condition.code.generateCode(context);
      out += '}';
    }

    return out;
  }
}

class ParserNodeFor extends ParserNodeStatement {
  constructor(public keyId: any, public condId: any, public valueId: ParserNodeLeftValue, public nodeList: ParserNodeExpression, public forCode: ParserNode, public elseCode: ParserNode) {
    super();
  }

  iterate(handler: (node: ParserNode) => void) {
    handler(this);
    this.valueId.iterate(handler);
    this.nodeList.iterate(handler);
    this.forCode.iterate(handler);
    this.elseCode.iterate(handler);
  }

  generateCode(context: ParserNodeGenerateCodeContext) {
    var out = '';
    out += ('runtimeContext.createScope((function() { ');
    out += (' var list = ' + this.nodeList.generateCode(context) + ';');
    out += (' if (!runtimeContext.emptyList(list)) {');
    out += ('  runtimeContext.each(list, function(k, v) { ');
    out += ('   ' + (new ParserNodeAssignment(this.valueId, new ParserNodeRaw("v"))).generateCode(context) + ';');
    if (this.keyId !== undefined) {
      out += ('   ' + (new ParserNodeAssignment(this.keyId, new ParserNodeRaw("k"))).generateCode(context) + ';');
    }
    if (this.condId) {
      out += ('   if (' + this.condId.generateCode() + ') { ');
    } else {
      out += ('   if (true) { ');
    }

    out += this.forCode.generateCode(context);

    out += ('}'); // if condition

    out += ('  });'); // each
    out += ('} else {');
    {
      out += this.elseCode.generateCode(context);
    }
    out += ('} '); // if/else
    out += ('}));'); // createScope

    return out;
  }
}

export class DefaultTags {
  // autoescape
  static _self: any;
  static endautoescape = _flowexception;
  static autoescape(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader): ParserNodeStatement {
    var expressionNode = (new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression();
    checkNoMoreTokens(expressionTokenReader);

    var innerNode = new ParserNodeContainer([]);

    handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
      'endautoescape': (e: FlowException) => {
        return true;
      },
    }, (node, nodeStart, nodeEnd) => {
      innerNode.add(node);
    });

    return new ParserNodeAutoescape(expressionNode, innerNode);
  }

  // DO/SET
  static endset = _flowexception;
  static set(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader): ParserNode {
    var expressionParser = new ExpressionParser(expressionTokenReader, tokenParserContext);
    var nodeIds = expressionParser.parseIdentifierCommaList();
    if (expressionTokenReader.checkAndMoveNext(['='])) {
      var nodeValues = expressionParser.parseCommaExpression();
      checkNoMoreTokens(expressionTokenReader);

      if (nodeIds.length != nodeValues.expressions.length) throw (new Error("variables doesn't match values"));

      var container = new ParserNodeContainer([]);

      for (var n = 0; n < nodeIds.length; n++) {
        container.add(new ParserNodeScopeSet(String((<any>nodeIds[n]).value), nodeValues.expressions[n]));
      }

      return container;
    } else {
      var innerNode = new ParserNodeContainer([]);

      //console.log('************************');
      handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
        'endset': (e: FlowException) => {
          return true;
        },
      }, (node, nodeStart, nodeEnd) => {
        //console.log(node);
        innerNode.add(node);
      });
      //console.log('************************');

      return new ParserNodeStatementExpression(<ParserNodeExpression><any>(new ParserNodeContainer([
        new ParserNodeRaw('runtimeContext.scopeSetUpdate(' + JSON.stringify((<ParserNodeIdentifier>nodeIds[0]).value) + ', (runtimeContext.captureOutput(function() { '),
        innerNode,
        new ParserNodeRaw('})))')
      ])));
    }
  }
  static $do(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var expressionNode = (new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression();
    checkNoMoreTokens(expressionTokenReader);

    return new ParserNodeStatementExpression(expressionNode);
  }

  // EMBED
  // http://twig.sensiolabs.org/doc/tags/embed.html
  static endembed = _flowexception;
  static embed(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var expressionString = expressionTokenReader.getSliceWithCallback(() => {
      var includeName = (new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression();
    }).map(item => item.rawValue);
    checkNoMoreTokens(expressionTokenReader);

    var offsetStart = templateTokenReader.getOffset();
    var offsetEnd = offsetStart;

    handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
      'endembed': (e: FlowException) => { offsetEnd = templateTokenReader.getOffset() - 1; return true; },
    }, (node, nodeStart, nodeEnd) => {
    });
    var rawText = templateTokenReader.getSlice(offsetStart, offsetEnd).map((item) => (<any>item).rawText).join('');
    var templateString = '{% extends ' + expressionString + ' %}' + rawText;
    return new ParserNodeRaw('runtimeContext.include(runtimeContext.compileString(' + JSON.stringify(templateString) + '));');
  }

  // FILTER
  // http://twig.sensiolabs.org/doc/tags/filter.html
  static endfilter = _flowexception;
  static filter(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var innerNode = new ParserNodeContainer([]);

    handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
      'endfilter': (e: FlowException) => { return true; },
    }, (node, nodeStart, nodeEnd) => {
      innerNode.add(node);
    });

    var filterNode = new ParserNodeExpressionFilter(innerNode);

    var expressionParser = new ExpressionParser(expressionTokenReader, tokenParserContext);
    while (true) {
      var filterName = (<any>expressionParser.parseIdentifier()).value;
      var parameters: ParserNodeCommaExpression = null;

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

    return new ParserNodeStatementExpression(new ParserNodeOutputNodeExpression(filterNode));
  }

  // FLUSH
  // http://twig.sensiolabs.org/doc/tags/flush.html
  static flush(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    // do nothing (all output is buffered and can't be flushed)
  }

  // MACRO/FROM/IMPORTUSE
  static endmacro = _flowexception;
  static macro(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var expressionParser = new ExpressionParser(expressionTokenReader, tokenParserContext);
    var macroName = expressionTokenReader.read().value;
    var paramNames: ParserNodeExpression[] = [];
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

    var macroNode = new ParserNodeContainer([]);
    macroNode.add(new ParserNodeRaw('var _arguments = arguments;'));
    macroNode.add(new ParserNodeRaw('return runtimeContext.captureOutput(function() { '));
    macroNode.add(new ParserNodeRaw('return runtimeContext.autoescape(false, function() { '));
    macroNode.add(new ParserNodeRaw('runtimeContext.createScope(function() { '));

    paramNames.forEach((paramName: any, index: any) => {
      var assign = new ParserNodeAssignment(paramName, new ParserNodeRaw('_arguments[' + index + ']'))
      macroNode.add(new ParserNodeStatementExpression(assign));
    });

    handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
      'endmacro': (e: FlowException) => {
        return true;
      },
    }, (node, nodeStart, nodeEnd) => {
      macroNode.add(node);
    });

    macroNode.add(new ParserNodeRaw('});')); // createScope
    macroNode.add(new ParserNodeRaw('});')); // autoescape
    macroNode.add(new ParserNodeRaw('});')); // captureOutput

    var macroCode = tokenParserContext.setMacro(macroName, macroNode);
    //console.log(macroCode);
    return new ParserNodeRaw('');

  }
  static from(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var expressionParser = new ExpressionParser(expressionTokenReader, tokenParserContext);
    let fileNameNode = _self(expressionParser.parseExpression(), templateParser.path);
    expressionTokenReader.expectAndMoveNext(['import']);

    var pairs: any[] = [];

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

    return new ParserNodeContainer([
      new ParserNodeRaw('runtimeContext.fromImport('),
      fileNameNode,
      new ParserNodeRaw(', ' + JSON.stringify(pairs) + ');')
    ]);
  }
  static $import(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var expressionParser = new ExpressionParser(expressionTokenReader, tokenParserContext);
    let fileNameNode = _self(expressionParser.parseExpression(), templateParser.path);
    expressionTokenReader.expectAndMoveNext(['as']);
    var aliasNode = <ParserNodeLeftValue>expressionParser.parseIdentifier();

    checkNoMoreTokens(expressionTokenReader);

    return new ParserNodeStatementExpression(
      new ParserNodeAssignment(
        aliasNode,
        new ParserNodeContainerExpression([
          new ParserNodeRaw('runtimeContext.import('),
          fileNameNode,
          new ParserNodeRaw(')'),
        ])
      )
    );
  }

  // USE
  // http://twig.sensiolabs.org/doc/tags/use.html
  static use(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var expressionParser = new ExpressionParser(expressionTokenReader, tokenParserContext);
    var fileName = expressionParser.parseStringLiteral().value;

    var pairs: { [name: string]: string } = {};

    while (expressionTokenReader.checkAndMoveNext(['with'])) {
      var fromNode = expressionParser.parseIdentifierOnly().value;
      expressionTokenReader.expectAndMoveNext(['as']);
      var toNode = expressionParser.parseIdentifierOnly().value;
      pairs['block_' + fromNode] = 'block_' + toNode;
    }

    checkNoMoreTokens(expressionTokenReader);

    var info = templateParser.getEvalCode(fileName, tokenParserContext.common);

    info.tokenParserContext.iterateBlocks((node, name) => {
      if (name.match(/^block_/)) {
        if (pairs[name]) {
          tokenParserContext.setBlock(pairs[name], node);
        } else {
          tokenParserContext.setBlock(name, node);
        }
      }
    });

    return new ParserNodeRaw('');
  }

  // INCLUDE
  static include(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    //console.log(tokenParserContext.common);
    var node = new ParserNodeContainer([]);
    node.add(new ParserNodeRaw('runtimeContext.include('));
    var expressionNode = (new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression();
    node.add(expressionNode);
    if (expressionTokenReader.checkAndMoveNext(['with'])) {
      node.add(new ParserNodeRaw(','));
      node.add((new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression());
    } else {
      node.add(new ParserNodeRaw(', undefined'));
    }
    if (expressionTokenReader.checkAndMoveNext(['only'])) {
      node.add(new ParserNodeRaw(', true'));
    } else {
      node.add(new ParserNodeRaw(', false'));
    }
    node.add(new ParserNodeRaw(', ' + JSON.stringify(tokenParserContext.common.serialize())));
    checkNoMoreTokens(expressionTokenReader);
    node.add(new ParserNodeRaw(');'));

    return node;
  }

  // RAW/VERBATIM
  // http://twig.sensiolabs.org/doc/tags/verbatim.html
  static endraw = _flowexception;
  static endverbatim = _flowexception;
  static raw(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    checkNoMoreTokens(expressionTokenReader);
    //console.log(templateTokenReader);

    //var rawText = templateTokenReader.tokens

    var res = templateTokenReader.tokenizer.stringReader.findRegexp(/\{%\-?\s*end(verbatim|raw)\s*\-?%\}/);
    if (res.position === null) throw (new Error("Expecting endverbatim"));
    var rawText = templateTokenReader.tokenizer.stringReader.readChars(res.position);
    templateTokenReader.tokenizer.stringReader.skipChars(res.length);

    return new ParserNodeOutputText(rawText);
  }
  static verbatim = DefaultTags.raw;

  // SANDBOX
  // http://twig.sensiolabs.org/doc/tags/sandbox.html
  static endsandbox = _flowexception;
  static sandbox(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    checkNoMoreTokens(expressionTokenReader);

    var innerNode = new ParserNodeContainer([]);

    tokenParserContext.common.setSandbox(() => {
      handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
        'endsandbox': (e: FlowException) => {
          return true;
        },
      }, (node, nodeStart, nodeEnd) => {
        innerNode.add(node);
      });
    });

    return new ParserNodeContainer([
      new ParserNodeRaw('runtimeContext.createScope(function() { '),
      new ParserNodeRaw('  runtimeContext.scopeSet("__sandboxed", true);'),
      innerNode,
      new ParserNodeRaw('});')
    ]);
  }

  // SPACELESS
  // http://twig.sensiolabs.org/doc/tags/spaceless.html
  static endspaceless = _flowexception;
  static spaceless(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    checkNoMoreTokens(expressionTokenReader);

    var innerNode = new ParserNodeContainer([]);

    //console.log('************************');
    handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
      'endspaceless': (e: FlowException) => {
        return true;
      },
    }, (node) => {
      //console.log(node);
      innerNode.add(node);
    });
    //console.log('************************');

    return new ParserNodeStatementExpression(new ParserNodeOutputNodeExpression(new ParserNodeContainer([
      new ParserNodeRaw('runtimeContext.filter("spaceless", [runtimeContext.captureOutput(function() { '),
      innerNode,
      new ParserNodeRaw('})])')
    ])));
  }

  // TRANS
  // http://twig.sensiolabs.org/doc/extensions/i18n.html
  static endtrans = _flowexception;
  static plural = _flowexception;
  static notes = _flowexception;
  static trans(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var expressionNode: ParserNodeExpression = null;

    if (expressionTokenReader.hasMore()) {
      expressionNode = (new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression();
    }

    checkNoMoreTokens(expressionTokenReader);

    if (expressionNode != null) {
      return new ParserNodeStatementExpression(new ParserNodeOutputNodeExpression(new ParserNodeContainer([
        new ParserNodeRaw('runtimeContext.trans2('),
        expressionNode,
        new ParserNodeRaw(')')
      ])));
    } else {
      var innerNode = new ParserNodeContainer([]);

      var lastPos = templateTokenReader.tokenizer.stringReader.position;
      var currentPos = lastPos;

      var state = 'normal';
      var pluralNode: ParserNodeExpression = new ParserNodeRaw("1");
      var info = <{ [a: string]: string }>{ 'normal': '', 'plural': '', 'notes': '' }
      var flush = function(e: FlowException) {
        info[state] = e.templateTokenReader.tokenizer.stringReader.getSlice(lastPos, currentPos);
        lastPos = e.templateTokenReader.tokenizer.stringReader.position;
      }

      handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
        'plural': (e: FlowException) => {
          pluralNode = (new ExpressionParser(e.expressionTokenReader, tokenParserContext)).parseExpression();
          checkNoMoreTokens(e.expressionTokenReader);
          flush(e);
          state = 'plural';
          return false;
        },
        'notes': (e: FlowException) => {
          flush(e);
          state = 'notes';
          return false;
        },
        'endtrans': (e: FlowException) => {
          flush(e);
          //console.log(e.templateTokenReader.getOffset());
          return true;
        },
      }, (node, nodeStart, nodeEnd) => {
        //console.log('node', node, nodeStart, nodeEnd);
        currentPos = nodeEnd;
        innerNode.add(node);
      });
      //console.log('************************');

      //console.log(info);

      return new ParserNodeStatementExpression(new ParserNodeOutputNodeExpression(new ParserNodeContainer([
        new ParserNodeRaw('runtimeContext.trans2('),

        new ParserNodeRaw(JSON.stringify(RuntimeContext.normalizeTrans(info['normal'])) + ","),
        new ParserNodeRaw(JSON.stringify(RuntimeContext.normalizeTrans(info['plural'])) + ","),
        pluralNode,
        new ParserNodeRaw(')')
      ])));

    }
  }

  // IF/ELSEIF/ELSE/ENDIF
  static $else = _flowexception;
  static $elseif = _flowexception;
  static $endif = _flowexception;
  static $if(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader): ParserNodeStatement {
    var didElse = false;

    var expressionNode = (new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression();
    checkNoMoreTokens(expressionTokenReader);

    var parserNodeIf = new ParserNodeIf();

    parserNodeIf.addCaseCondition(expressionNode);

    handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
      'elseif': (e: FlowException) => {
        if (didElse) throw new Error("Can't put 'elseif' after the 'else'");

        var expressionNode = (new ExpressionParser(e.expressionTokenReader, tokenParserContext)).parseExpression();
        checkNoMoreTokens(expressionTokenReader);
        parserNodeIf.addCaseCondition(expressionNode);
        return false;
      },
      'else': (e: FlowException) => {
        if (didElse) throw new Error("Can't have two 'else'");
        parserNodeIf.addElseCondition();
        didElse = true;
        return false;
      },
      'endif': (e: FlowException) => {
        return true;
      },
    }, (node, nodeStart, nodeEnd) => {
      parserNodeIf.addCodeToCondition(node);
    });

    return parserNodeIf;
  }

  // BLOCK/ENDBLOCK
  static endblock = _flowexception;
  static block(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var blockName = 'block_' + expressionTokenReader.read().value;

    var innerNode = new ParserNodeContainer([]);

    if (expressionTokenReader.hasMore()) {
      var expressionNode = (new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression();
      checkNoMoreTokens(expressionTokenReader);

      innerNode.add(new ParserNodeReturnStatement(new ParserNodeWriteExpression(expressionNode)));
    } else {

      handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
        'endblock': (e: FlowException) => {
          return true;
        },
      }, (node, nodeStart, nodeEnd) => {
        innerNode.add(node);
      });
    }

    tokenParserContext.setBlock(blockName, innerNode);

    return new ParserNodeRaw('runtimeContext.putBlock(' + JSON.stringify(blockName) + ');', false);
  }

  // EXTENDS
  static $extends(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader) {
    var expressionNode = (new ExpressionParser(expressionTokenReader, tokenParserContext)).parseExpression();
    checkNoMoreTokens(expressionTokenReader);

    tokenParserContext.addAfterMainNode(new ParserNodeContainer([
      new ParserNodeRaw('return runtimeContext.extends('),
      expressionNode,
      new ParserNodeRaw(');')
    ]));

    return new ParserNodeRaw('');
  }

  // http://twig.sensiolabs.org/doc/tags/for.html
  static $endfor = _flowexception;
  static $for(blockType: string, templateParser: TemplateParser, tokenParserContext: TokenParserContext, templateTokenReader: TokenReader, expressionTokenReader: TokenReader): ParserNodeStatement {
    var didElse = false;
    var expressionParser = new ExpressionParser(expressionTokenReader, tokenParserContext);
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

    var forCode = new ParserNodeContainer([]);
    var elseCode = new ParserNodeContainer([]);

    handleOpenedTag(blockType, templateParser, tokenParserContext, templateTokenReader, expressionTokenReader, {
      'else': (e: FlowException) => {
        if (didElse) throw (new Error("Can't have two 'else'"));
        didElse = true;
        return false;
      },
      'endfor': (e: FlowException) => {
        return true;
      },
    }, (node, nodeStart, nodeEnd) => {
      if (!didElse) {
        forCode.add(node);
      } else {
        elseCode.add(node);
      }
    });

    return new ParserNodeFor(keyId, condId, valueId, nodeList, forCode, elseCode);
  }
}
