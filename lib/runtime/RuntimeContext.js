var DefaultFunctions = require('../lang/functions/DefaultFunctions')
var DefaultFilters = require('../lang/filters/DefaultFilters')
var DefaultTests = require('../lang/tests/DefaultTests')
var Scope = require('./Scope')
var RuntimeContext = (function () {
    function RuntimeContext(templateParser, scopeData) {
        this.templateParser = templateParser;
        this.output = '';
        this.functions = {
        };
        this.filters = {
        };
        this.tests = {
        };
        this.currentAutoescape = true;
        this.defaultAutoescape = true;
        this.currentBlockName = 'none';
        this.scope = new Scope.Scope(scopeData);
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
    RuntimeContext.prototype.setTemplate = function (Template) {
        this.LeafTemplate = Template;
        this.CurrentTemplate = Template;
        this.RootTemplate = Template;
    };
    RuntimeContext.prototype.setCurrentBlock = function (template, name, callback) {
        var BackCurrentTemplate = this.CurrentTemplate;
        var BackCurrentBlockName = this.currentBlockName;
        this.CurrentTemplate = template;
        this.currentBlockName = name;
        try  {
            return callback();
        }finally {
            this.CurrentTemplate = BackCurrentTemplate;
            this.currentBlockName = BackCurrentBlockName;
        }
    };
    RuntimeContext.prototype.createScope = function (inner) {
        this.scope.createScope(inner);
    };
    RuntimeContext.prototype.captureOutput = function (callback) {
        var oldOutput = this.output;
        this.output = '';
        try  {
            callback();
            return this.output;
        }finally {
            this.output = oldOutput;
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
    RuntimeContext.prototype.test = function ($function, $arguments) {
        return this.$call(this.tests, $function, $arguments);
    };
    RuntimeContext.prototype.extends = function (name) {
        var ParentTemplateInfo = (this.templateParser.compile(name));
        var ParentTemplate = new (ParentTemplateInfo.class)();
        this.RootTemplate['__proto__']['__proto__'] = ParentTemplate;
        this.RootTemplate = ParentTemplate;
        this.LeafTemplate['__parent'] = ParentTemplate;
        this.LeafTemplate['__main'] = ParentTemplate['__main'];
        return this.LeafTemplate.__main(this);
    };
    RuntimeContext.prototype._putBlock = function (Current, name) {
        var method = (Current[name]);
        if(method === undefined) {
            console.log(Current['__proto__']);
            throw (new Error("Can't find block '" + name + "'"));
        }
        return method(this);
    };
    RuntimeContext.prototype.putBlock = function (name) {
        return this._putBlock(this.LeafTemplate, name);
    };
    RuntimeContext.prototype.putBlockParent = function (name) {
        throw (new Error("Not implemented"));
    };
    RuntimeContext.prototype.autoescape = function (temporalValue, callback) {
        if(temporalValue === undefined) {
            temporalValue = true;
        }
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
    RuntimeContext.prototype.emptyList = function (value) {
        if(value === undefined || value === null) {
            return true;
        }
        if(value instanceof Array || value instanceof String) {
            return (value.length == 0);
        }
        return false;
    };
    RuntimeContext.escapeHtmlEntities = function escapeHtmlEntities(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    return RuntimeContext;
})();
exports.RuntimeContext = RuntimeContext;
