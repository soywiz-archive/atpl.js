///<reference path='../imports.d.ts'/>

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//export class NodeBuilder {
//	binary(left: ParserNodeExpression, op: string, right: ParserNodeExpression): ParserNodeExpression {
//		if (op == '=') {
//			return new ParserNodeAssignment(left, right);
//		} else {
//			return new ParserNodeBinaryOperation(left, op, right);
//		}
//	}
//}

export interface ParserNodeGenerateCodeContext {
	doWrite: bool;
}

export class ParserNode {
	type: string = '-';

	generateCode(context: ParserNodeGenerateCodeContext) {
		return '<invalid>';
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
	}
}

export class ParserNodeExpression extends ParserNode {
}

export class ParserNodeWriteExpression extends ParserNodeExpression {
	constructor(public expression: ParserNodeExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		if (!context.doWrite) {
			throw (new Error('A template that extends another one cannot have a body'));
			return '';
		}
		return 'runtimeContext.writeExpression(' + this.expression.generateCode(context) + ')';
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.expression.iterate(handler);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeContainer extends ParserNode {
	type: string = 'ParserNodeContainer';

	constructor(public nodes: ParserNode[] = null) {
		super();
		if (this.nodes == null) this.nodes = [];
	}

	add(node: ParserNode) {
		this.nodes.push(node);
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		var output = '';
		for (var n in this.nodes) {
			output += this.nodes[n].generateCode(context);
		}
		return output;
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		for (var n in this.nodes) {
			this.nodes[n].iterate(handler);
		}
	}
}

export class ParserNodeContainerExpression extends ParserNodeExpression {
	type: string = 'ParserNodeContainerExpression';

	constructor(public nodes: ParserNode[] = null) {
		super();
		if (this.nodes == null) this.nodes = [];
	}

	add(node: ParserNode) {
		this.nodes.push(node);
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		var output = '';
		for (var n in this.nodes) {
			output += this.nodes[n].generateCode(context);
		}
		return output;
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		for (var n in this.nodes) {
			this.nodes[n].iterate(handler);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeObjectItem extends ParserNode {
	type: string = 'ParserNodeObjectItem';

	constructor(private key: ParserNodeExpression, private value: ParserNodeExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return this.key.generateCode(context) + ' : ' + this.value.generateCode(context);
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.key.iterate(handler);
		this.value.iterate(handler);
	}

}

export class ParserNodeObjectContainer extends ParserNodeExpression {
	type: string = 'ParserNodeObjectContainer';

	constructor(private items: ParserNodeObjectItem[]) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return '{' + this.items.map(node => node.generateCode(context)).join(', ') + '}';
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		for (var n in this.items) this.items[n].iterate(handler);
	}
}

export class ParserNodeArrayContainer extends ParserNodeExpression {
	type: string = 'ParserNodeArrayContainer';

	constructor(private items: ParserNodeExpression[]) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return '[' + this.items.map(node => node.generateCode(context)).join(', ') + ']';
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		for (var n in this.items) this.items[n].iterate(handler);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export interface ParseNodeLiteralIdentifier {
	type: string;
	value: any;
	generateCode(context: ParserNodeGenerateCodeContext);
}

export class ParserNodeLiteral extends ParserNodeExpression implements ParseNodeLiteralIdentifier {
	type: string = 'ParserNodeLiteral';

	constructor(public value: any) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return JSON.stringify(this.value);
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeLeftValue extends ParserNodeExpression {
	type: string = 'ParserNodeLeftValue';

	generateAssign(context: ParserNodeGenerateCodeContext, expr: ParserNodeExpression): string {
		throw (new Error("Must implement"));
	}
}

export class ParserNodeIdentifier extends ParserNodeLeftValue implements ParseNodeLiteralIdentifier {
	type: string = 'ParserNodeIdentifier';

	constructor(public value: string) {
		super();
	}

	generateAssign(context: ParserNodeGenerateCodeContext, expr: ParserNodeExpression) {
		return 'runtimeContext.scopeSet(' + JSON.stringify(this.value) + ', ' + expr.generateCode(context) + ')';
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return 'runtimeContext.scopeGet(' + JSON.stringify(this.value) + ')';
	}
}

export class ParserNodeStatement extends ParserNode {
	type: string = 'ParserNodeStatement';
}

export class ParserNodeRaw extends ParserNodeExpression {
	type: string = 'ParserNodeRaw';

	constructor(public value: string, public putAlways: bool = true) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		if (!context.doWrite && !this.putAlways) return '';
		return this.value;
	}
}

export class ParserNodeStatementExpression extends ParserNodeStatement {
	type: string = 'ParserNodeStatementExpression';

	constructor(public expression: ParserNodeExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return this.expression.generateCode(context) + ';';
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.expression.iterate(handler);
	}
}

export class ParserNodeAssignment extends ParserNodeExpression {
	type: string = 'ParserNodeAssignment';

	constructor(public leftValue: ParserNodeLeftValue, public rightValue: ParserNodeExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return this.leftValue.generateAssign(context, this.rightValue);
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.leftValue.iterate(handler);
		this.rightValue.iterate(handler);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeCommaExpression extends ParserNode {
	type: string = 'ParserNodeCommaExpression';

	constructor(public expressions: ParserNodeExpression[], public names: string[] = null) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return this.expressions.map((item) => item.generateCode(context)).join(', ');
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		for (var n in this.expressions) this.expressions[n].iterate(handler);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeArrayAccess extends ParserNodeExpression {
	type: string = 'ParserNodeArrayAccess';

	constructor(public object: ParserNodeExpression, public key: ParserNodeExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return 'runtimeContext.access(' + this.object.generateCode(context) + ', ' + this.key.generateCode(context) + ')';
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.object.iterate(handler);
		this.key.iterate(handler);
	}
}

export class ParserNodeArraySlice extends ParserNodeExpression {
	type: string = 'ParserNodeArraySlice';

	constructor(public object: ParserNodeExpression, public left: ParserNodeExpression, public right: ParserNodeExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return 'runtimeContext.slice(' + this.object.generateCode(context) + ', ' + this.left.generateCode(context) + ', ' + this.right.generateCode(context) + ')';
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.object.iterate(handler);
		this.left.iterate(handler);
		this.right.iterate(handler);
	}
}

export class ParserNodeFunctionCall extends ParserNodeExpression {
	type: string = 'ParserNodeFunctionCall';

	constructor(public functionExpr: ParserNodeExpression, public arguments: ParserNodeCommaExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		if (this.functionExpr instanceof ParserNodeArrayAccess) {
			var arrayAccess = <ParserNodeArrayAccess>this.functionExpr;
			return 'runtimeContext.callContext(' + arrayAccess.object.generateCode(context) + ', ' + arrayAccess.key.generateCode(context) + ', [' + this.arguments.generateCode(context) + '], ' + JSON.stringify(this.arguments.names) + ')';
		} else {
			return 'runtimeContext.call(' + this.functionExpr.generateCode(context) + ', [' + this.arguments.generateCode(context) + '], ' + JSON.stringify(this.arguments.names) + ')';
		}
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.functionExpr.iterate(handler);
		this.arguments.iterate(handler);
	}
}

export class ParserNodeFilterCall extends ParserNodeExpression {
	type: string = 'ParserNodeFilterCall';

	constructor(public filterName: string, public arguments: ParserNodeCommaExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return 'runtimeContext.filter(' + JSON.stringify(this.filterName) + ', [' + this.arguments.generateCode(context) + '])';
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.arguments.iterate(handler);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeUnaryOperation extends ParserNodeExpression {
	type: string = 'ParserNodeUnaryOperation';

	constructor(public operator: string, public right: ParserNodeExpression) {
		super();
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		switch (this.operator) {
			case 'not':
				return '!(' + this.right.generateCode(context) + ')';
			default:
				return this.operator + '(' + this.right.generateCode(context) + ')';
		}
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.right.iterate(handler);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeBinaryOperation extends ParserNodeExpression {
	type: string = 'ParserNodeBinaryOperation';

	constructor(public operator: string, public left: ParserNodeExpression, public right: ParserNodeExpression) {
		super();
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.left.iterate(handler);
		this.right.iterate(handler);
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		switch (this.operator) {
			case 'b-or': return '("" + ' + this.left.generateCode(context) + ' | ' + this.right.generateCode(context) + ')';
			case 'b-and': return '("" + ' + this.left.generateCode(context) + ' & ' + this.right.generateCode(context) + ')';
			case 'b-xor': return '("" + ' + this.left.generateCode(context) + ' ^ ' + this.right.generateCode(context) + ')';
			case '~': return '("" + ' + this.left.generateCode(context) + ' + ' + this.right.generateCode(context) + ')';
			case '..': return 'runtimeContext.range(' + this.left.generateCode(context) + ', ' + this.right.generateCode(context) + ')';
			case '?:': return 'runtimeContext.ternaryShortcut(' + this.left.generateCode(context) + ', ' + this.right.generateCode(context) + ')';
			case '//': return 'Math.floor(' + this.left.generateCode(context) + ' / ' + this.right.generateCode(context) + ')';
			case '**': return 'Math.pow(' + this.left.generateCode(context) + ',' + this.right.generateCode(context) + ')';
			case 'not in':
			case 'in':
				var ret = 'runtimeContext.inArray(' + this.left.generateCode(context) + ',' + this.right.generateCode(context) + ')';
				if ((this.operator == 'not in')) ret = '!(' + ret + ')';

				return ret;
			case 'is':
			case 'is not':
				var ret = '';
				var left:ParserNodeExpression = this.left;
				var right:ParserNodeExpression = this.right;

				if (this.right instanceof ParserNodeUnaryOperation) {
					right = (<ParserNodeUnaryOperation>this.right).right;
				}

				if (right instanceof ParserNodeFunctionCall) {
					//throw (new Error("Not implemented ParserNodeFunctionCall"));
					ret = 'runtimeContext.test(' + (<ParserNodeFunctionCall>right).functionExpr.generateCode(context) + ', [' + left.generateCode(context) + ',' + (<ParserNodeFunctionCall>right).arguments.generateCode(context) + '])';
				} else if (right instanceof ParserNodeIdentifier) {
					ret = 'runtimeContext.test(' + JSON.stringify((<ParserNodeIdentifier>right).value) + ', [' + left.generateCode(context) + '])';
				} else if (right instanceof ParserNodeLiteral && (<ParserNodeLiteral>right).value === null) {
					ret = 'runtimeContext.test("null", [' + left.generateCode(context) + '])';
				} else {
					throw (new Error("ParserNodeBinaryOperation: Not implemented 'is' operator for tests with " + JSON.stringify(right)));
				}

				if (this.operator == 'is not') ret = '!(' + ret + ')';

				return ret;
			default:
				return (
					'(' +
						this.left.generateCode(context) +
						' ' + this.operator  + ' ' +
						this.right.generateCode(context) +
					')'
				);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeTernaryOperation extends ParserNode {
	type: string = 'ParserNodeTernaryOperation';

	constructor(public cond: ParserNode, public exprTrue: ParserNode, public exprFalse: ParserNode) {
		super();
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.cond.iterate(handler);
		this.exprTrue.iterate(handler);
		this.exprFalse.iterate(handler);
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return (
			'(' +
				this.cond.generateCode(context) + 
				" ? " + this.exprTrue.generateCode(context) +
				" : " + this.exprFalse.generateCode(context) +
			')'
		);
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

export class ParserNodeOutputText extends ParserNode {
	text: string = '';
	type: string = 'ParserNodeOutputText';

	constructor(text: string) {
		super();
		this.text = String(text);
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		if (!context.doWrite) {
			if (this.text.match(/\S/)) throw (new Error('A template that extends another one cannot have a body'));
			return '';
		}
		return 'runtimeContext.write(' + JSON.stringify(this.text) + ');';
	}
}

export class ParserNodeOutputNodeExpression extends ParserNodeExpression {
	type: string = 'ParserNodeOutputNodeExpression';

	constructor(public expression: ParserNode) {
		super();
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.expression.iterate(handler);
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		if (!context.doWrite) return '';
		return 'runtimeContext.write(' + this.expression.generateCode(context) + ')';
	}
}

export class ParserNodeReturnStatement extends ParserNodeStatement {
	type: string = 'ParserNodeReturnStatement';

	constructor(public expression: ParserNodeExpression) {
		super();
	}

	iterate(handler: (node: ParserNode) => void ) {
		handler(this);
		this.expression.iterate(handler);
	}

	generateCode(context: ParserNodeGenerateCodeContext) {
		return 'return ' + this.expression.generateCode(context) + ';';
	}
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
