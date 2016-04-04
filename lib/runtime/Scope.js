"use strict";
var Scope = (function () {
    function Scope(scope) {
        if (scope === void 0) { scope = {}; }
        this.scope = scope;
    }
    /**
     * Creates a new scope temporarlly (while executing the callback).
     * Writting variables will set temporarily in the new scope, while
     * reading will try to get the value from the new scope and then
     * in following scopes.
     *
     * @param inner Callback where the new scope will be available.
     */
    Scope.prototype.createScope = function (inner) {
        var newScope = {};
        var oldScope = this.scope;
        newScope['__proto__'] = oldScope;
        this.scope = newScope;
        try {
            return inner();
        }
        finally {
            this.scope = oldScope;
        }
    };
    /**
     * Obtains the parent scope.
     */
    Scope.prototype.getParent = function () {
        return this.scope['__proto__'];
    };
    /**
     * Gets a value in the most recent available scope.
     */
    Scope.prototype.get = function (key) {
        return this.scope[key];
    };
    /**
     * Gets all the scope values. (slow)
     */
    Scope.prototype.getAll = function () {
        var object = {};
        var parentScope = this.getParent();
        if (parentScope instanceof Scope)
            object = parentScope.getAll();
        for (var key in this.scope)
            object[key] = this.scope[key];
        return object;
    };
    /**
     * Sets a value in the scope
     */
    Scope.prototype.set = function (key, value) {
        return this.scope[key] = value;
    };
    /**
     * Sets a list of values in the current scope.
     */
    Scope.prototype.setAll = function (object) {
        for (var key in object)
            this.set(key, object[key]);
    };
    return Scope;
}());
exports.Scope = Scope;
