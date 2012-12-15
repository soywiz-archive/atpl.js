var RuntimeContext = (function () {
    function RuntimeContext() {
        this.output = '';
        this.scope = {
        };
    }
    RuntimeContext.prototype.createScope = function (callback) {
        var newScope = {
        };
        var oldScope = this.scope;
        newScope['__proto__'] = oldScope;
        this.scope = newScope;
        try  {
            callback();
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
        this.write(this.escape(text));
    };
    RuntimeContext.prototype.escape = function (text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    return RuntimeContext;
})();
exports.RuntimeContext = RuntimeContext;
