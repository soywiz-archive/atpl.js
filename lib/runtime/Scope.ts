export class Scope {
	constructor(public scope: any = {}) {
	}

	createScope(inner: () => void) {
		var newScope = {};
		var oldScope = this.scope;
		newScope['__proto__'] = oldScope;
		this.scope = newScope;
		try {
			return inner();
		} finally {
			this.scope = oldScope;
		}
	}

	getParent() {
		return this.scope['__proto__'];
	}

	get(key) {
		return this.scope[key];
	}

	getAll() {
		var object = {};
		var parentScope = this.scope['__proto__'];
		if (parentScope instanceof Scope) {
			object = parentScope.getAll();
		}
		for (var key in this.scope) {
			object[key] = this.scope[key];
		}
		return object;
	}

	set(key, value) {
		return this.scope[key] = value;
	}

	setAll(object) {
		for (var key in object) this.set(key, object[key]);
	}
}
