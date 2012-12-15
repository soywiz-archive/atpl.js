var RuntimeContext = (function () {
    function RuntimeContext() {
        this.output = '';
        this.scope = {
        };
        this.functions = {
        };
        this.functions.range = function (start, end, step) {
            if (typeof step === "undefined") { step = 1; }
            var out = [];
            var current = start;
            while(current <= end) {
                out.push(current);
                current += step;
            }
            return out;
        };
    }
    RuntimeContext.prototype.createScope = function (inner) {
        var newScope = {
        };
        var oldScope = this.scope;
        newScope['__proto__'] = oldScope;
        this.scope = newScope;
        try  {
            inner();
        }finally {
            this.scope = oldScope;
        }
    };
    RuntimeContext.prototype.write = function (text) {
        if(text === undefined || text === null) {
            return;
        }
        this.output += text;
    };
    RuntimeContext.prototype.writeExpression = function (text) {
        if(text === undefined || text === null) {
            return;
        }
        if(!text.substr) {
            text = JSON.stringify(text);
        }
        this.write(this.escape(text));
    };
    RuntimeContext.prototype.call = function ($function, arguments) {
        if($function !== undefined && $function !== null) {
            if($function.substr) {
                $function = this.functions[$function];
            }
            if($function instanceof Function) {
                return $function.apply(null, arguments);
            }
        }
        return null;
    };
    RuntimeContext.prototype.access = function (object, key) {
        if(object === undefined || object === null) {
            return null;
        }
        return object[key];
    };
    RuntimeContext.prototype.escape = function (text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    return RuntimeContext;
})();
exports.RuntimeContext = RuntimeContext;
