var Scope = (function () {
    function Scope(scope) {
        if (typeof scope === "undefined") { scope = {
        }; }
        this.scope = scope;
    }
    Scope.prototype.createScope = function (inner) {
        var newScope = {
        };
        var oldScope = this.scope;
        newScope['__proto__'] = oldScope;
        this.scope = newScope;
        try  {
            return inner();
        }finally {
            this.scope = oldScope;
        }
    };
    Scope.prototype.getParent = function () {
        return this.scope['__proto__'];
    };
    Scope.prototype.get = function (key) {
        return this.scope[key];
    };
    Scope.prototype.getAll = function () {
        var object = {
        };
        var parentScope = this.scope['__proto__'];
        if(parentScope instanceof Scope) {
            object = parentScope.getAll();
        }
        for(var key in this.scope) {
            object[key] = this.scope[key];
        }
        return object;
    };
    Scope.prototype.set = function (key, value) {
        return this.scope[key] = value;
    };
    return Scope;
})();
exports.Scope = Scope;

