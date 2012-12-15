///<reference path='../imports.d.ts'/>

export class RuntimeContext {
	output = '';
	scope = {};
	constructor() {
	}

	createScope(callback) {
		var newScope = {};
		var oldScope = this.scope;
		newScope['__proto__'] = oldScope;
		this.scope = newScope;
		try {
			callback();
		} finally {
			this.scope = oldScope;
		}
	}

	write(text) {
		if (text === undefined || text === null) return;
		this.output += text;
	}

	writeExpression(text) {
		if (text === undefined || text === null) return;
		this.write(this.escape(text));
	}

	escape(text) {
		return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
}