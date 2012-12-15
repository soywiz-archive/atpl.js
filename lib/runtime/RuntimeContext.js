var DefaultFunctions = require('../lang/functions/DefaultFunctions')
var DefaultFilters = require('../lang/filters/DefaultFilters')
var DefaultTests = require('../lang/tests/DefaultTests')
var RuntimeContext = (function () {
    function RuntimeContext() {
        this.output = '';
        this.scope = {
        };
        this.functions = {
        };
        this.filters = {
        };
        this.tests = {
        };
        this.currentAutoescape = true;
        this.defaultAutoescape = true;
        for(var key in DefaultFunctions.DefaultFunctions) {
            this.functions[key.replace(/^\$+/, '')] = DefaultFunctions.DefaultFunctions[key];
        }
        for(var key in DefaultFilters.DefaultFilters) {
            this.filters[key.replace(/^\$+/, '')] = DefaultFilters.DefaultFilters[key];
        }
        for(var key in DefaultTests.DefaultTests) {
            this.tests[key.replace(/^\$+/, '')] = DefaultTests.DefaultTests[key];
        }
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
        switch(this.currentAutoescape) {
            case false: {
                this.write(text);
                break;

            }
            case 'js': {
                throw (new Error("Not implemented"));
                break;

            }
            case 'css': {
                throw (new Error("Not implemented"));
                break;

            }
            case 'url': {
                throw (new Error("Not implemented"));
                break;

            }
            case 'html_attr': {
                throw (new Error("Not implemented"));
                break;

            }
            default:
            case true:
            case 'html': {
                this.write(RuntimeContext.escapeHtmlEntities(text));
                break;

            }
        }
        this.currentAutoescape = this.defaultAutoescape;
    };
    RuntimeContext.prototype.$call = function (functionList, $function, $arguments) {
        if($function !== undefined && $function !== null) {
            if($function.substr) {
                $function = functionList[$function];
            }
            if($function instanceof Function) {
                return $function.apply(this, $arguments);
            }
        }
        return null;
    };
    RuntimeContext.prototype.call = function ($function, $arguments) {
        return this.$call(this.functions, $function, $arguments);
    };
    RuntimeContext.prototype.filter = function ($function, $arguments) {
        return this.$call(this.filters, $function, $arguments);
    };
    RuntimeContext.prototype.autoescape = function (temporalValue, callback) {
        var prevDefault = this.defaultAutoescape;
        this.defaultAutoescape = temporalValue;
        try  {
            this.currentAutoescape = this.defaultAutoescape;
            callback();
        }finally {
            this.defaultAutoescape = prevDefault;
        }
    };
    RuntimeContext.prototype.access = function (object, key) {
        if(object === undefined || object === null) {
            return null;
        }
        return object[key];
    };
    RuntimeContext.escapeHtmlEntities = function escapeHtmlEntities(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    return RuntimeContext;
})();
exports.RuntimeContext = RuntimeContext;
