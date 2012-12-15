///<reference path='../imports.d.ts'/>

export class RuntimeContext {
	output: string = '';
	scope: any = {};
	functions: any = {};

	constructor() {
		this.functions.range = function (start, end, step = 1) {
			var out = [];
			var current = start;
			while (current <= end) {
				out.push(current);
				current += step;
			}
			return out;
		};
	}

	createScope(inner: () => void) {
		var newScope = {};
		var oldScope = this.scope;
		newScope['__proto__'] = oldScope;
		this.scope = newScope;
		try {
			inner();
		} finally {
			this.scope = oldScope;
		}
	}

	write(text: any) {
		if (text === undefined || text === null) return;
		this.output += text;
	}

	writeExpression(text: any) {
		if (text === undefined || text === null) return;
		if (!text.substr) text = JSON.stringify(text);
		this.write(this.escape(text));
	}

	call($function: any, arguments: any[]) {
		if ($function !== undefined && $function !== null) {
			//console.log('call:' + $function);
			if ($function.substr) $function = this.functions[$function];
			//console.log('call:' + $function);
			if ($function instanceof Function) {
				return $function.apply(null, arguments);
				//console.log('called!');
			}
		}
		return null;
	}

	access(object: any, key: any) {
		if (object === undefined || object === null) return null;
		return object[key];
	}

	escape(text: string) {
		return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
}