export class Scope {
	constructor(public scope: any = {}) {
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

	get(key) {
		return this.scope[key];
	}

	set(key, value) {
		return this.scope[key] = value;
	}
}