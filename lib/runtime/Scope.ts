export class Scope {
	constructor(public scope: any = {}) {
	}

	/**
	 * Creates a new scope temporarlly (while executing the callback).
	 * Writting variables will set temporarily in the new scope, while
	 * reading will try to get the value from the new scope and then
	 * in following scopes.
	 *
	 * @param inner Callback where the new scope will be available.
	 */
	createScope(inner: () => void) {
		var newScope = {};
		var oldScope = this.scope;
		(<any>newScope)['__proto__'] = oldScope;
		this.scope = newScope;
		try {
			return inner();
		} finally {
			this.scope = oldScope;
		}
	}

	/**
	 * Obtains the parent scope.
	 */
	getParent() {
		return this.scope['__proto__'];
	}

	/**
	 * Gets a value in the most recent available scope.
	 */
	get(key: string): any {
		return this.scope[key];
	}

	/**
	 * Gets all the scope values. (slow)
	 */
	getAll() {
		var object:any = {};
		var parentScope = this.getParent();
		if (parentScope instanceof Scope) object = parentScope.getAll();
		for (var key in this.scope) object[key] = this.scope[key];
		return object;
	}

	/**
	 * Sets a value in the scope
	 */
	set(key: string, value: any): any {
		return this.scope[key] = value;
	}

    /**
     * Sets a value in the scope it is defined, if it is not, it creates it in the current scope. 
     */
    setUpdate(key: string, value: any): any {
        if (!(key in this.scope)) return this.set(key, value);

        var keyScope = this.scope;
        while (keyScope) {
            if (keyScope.hasOwnProperty(key)) return keyScope[key] = value;
            keyScope = keyScope['__proto__']; 
        }
        return null;
    }

	/**
	 * Sets a list of values in the current scope.
	 */
	setAll(object: any): void {
		for (var key in object) this.set(key, object[key]);
	}
}
