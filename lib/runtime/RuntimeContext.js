var RuntimeUtils = require('./RuntimeUtils')

var Scope = require('./Scope')
var RuntimeContext = (function () {
    function RuntimeContext(templateParser, scopeData, languageContext) {
        this.templateParser = templateParser;
        this.languageContext = languageContext;
        this.output = '';
        this.currentAutoescape = true;
        this.defaultAutoescape = true;
        this.currentBlockName = 'none';
        this.removeFollowingSpaces = false;
        this.scope = new Scope.Scope(scopeData);
    }
    RuntimeContext.prototype.setTemplate = function (Template) {
        this.LeafTemplate = Template;
        this.CurrentTemplate = Template;
        this.RootTemplate = Template;
    };
    RuntimeContext.prototype.compileString = function (templateString) {
        return this.templateParser.compileString(templateString, this);
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
    RuntimeContext.prototype.createScope = function (inner, only) {
        if (typeof only === "undefined") { only = false; }
        if(only) {
            var oldScope = this.scope;
            try  {
                this.scope = new Scope.Scope({
                });
                inner();
            }finally {
                this.scope = oldScope;
            }
        } else {
            this.scope.createScope(inner);
        }
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
    RuntimeContext.prototype.trimSpaces = function () {
        this.output = this.output.replace(/\s+$/, '');
        this.removeFollowingSpaces = true;
    };
    RuntimeContext.prototype.write = function (text) {
        if(text === undefined || text === null) {
            return;
        }
        if(this.removeFollowingSpaces) {
            text = text.replace(/^\s+/, '');
            this.removeFollowingSpaces = (text.match(/^\s+$/) != null);
        }
        this.output += text;
    };
    RuntimeContext.prototype.writeExpression = function (text) {
        if(text === undefined || text === null) {
            return;
        }
        if(!RuntimeUtils.isString(text)) {
            text = JSON.stringify(text);
        }
        switch(this.currentAutoescape) {
            case false:
                this.write(text);
                break;
            case 'js':
                this.write(RuntimeUtils.escapeJsString(text));
                break;
            case 'css':
                this.write(RuntimeUtils.escapeCssString(text));
                break;
            case 'url':
                this.write(RuntimeUtils.escapeUrlString(text));
                break;
            case 'html_attr':
                this.write(RuntimeUtils.escapeHtmlAttribute(text));
                break;
            case 'html':
            case true:
            case undefined:
                this.write(RuntimeUtils.escapeHtmlEntities(text));
                break;
            default:
                throw (new Error('Invalid escaping strategy "' + this.currentAutoescape + '"(valid ones: html, js, url, css, and html_attr).'));
        }
        this.currentAutoescape = this.defaultAutoescape;
    };
    RuntimeContext.prototype.$call = function (functionList, $function, $arguments) {
        if(functionList !== undefined && functionList !== null) {
            if(RuntimeUtils.isString($function)) {
                $function = functionList[$function];
            }
            return this.$call2($function, $arguments);
        }
        return null;
    };
    RuntimeContext.prototype.$call2 = function ($function, $arguments) {
        if($function !== undefined && $function !== null) {
            if($function instanceof Function) {
                return $function.apply(this, $arguments);
            }
        }
        return null;
    };
    RuntimeContext.prototype.callContext = function ($context, $functionName, $arguments) {
        if($context !== undefined && $context !== null) {
            var $function = $context[$functionName];
            if($function instanceof Function) {
                return $function.apply($context, $arguments);
            }
        }
        return null;
    };
    RuntimeContext.prototype.call = function ($function, $arguments) {
        if(this.languageContext.functions[$function] === undefined) {
            return this.$call2(this.scope.get($function), $arguments);
        } else {
            return this.$call(this.languageContext.functions, $function, $arguments);
        }
    };
    RuntimeContext.prototype.filter = function ($function, $arguments) {
        return this.$call(this.languageContext.filters, $function, $arguments);
    };
    RuntimeContext.prototype.test = function ($function, $arguments) {
        return this.$call(this.languageContext.tests, $function, $arguments);
    };
    RuntimeContext.prototype.include = function (info, scope, only) {
        if (typeof scope === "undefined") { scope = {
        }; }
        if (typeof only === "undefined") { only = false; }
        var _this = this;
        this.createScope(function () {
            if(scope !== undefined) {
                _this.scope.setAll(scope);
            }
            if(RuntimeUtils.isString(info)) {
                var name = info;
                var IncludeTemplate = new ((_this.templateParser.compile(name, _this)).class)();
                IncludeTemplate.__main(_this);
            } else {
                var IncludeTemplate = new (info.class)();
                IncludeTemplate.__main(_this);
            }
        }, only);
    };
    RuntimeContext.prototype.import = function (name) {
        var IncludeTemplate = new ((this.templateParser.compile(name, this)).class)();
        return IncludeTemplate.macros;
    };
    RuntimeContext.prototype.fromImport = function (name, pairs) {
        var _this = this;
        var keys = this.import(name);
        pairs.forEach(function (pair) {
            var from = pair[0];
            var to = pair[1];
            _this.scope.set(to, keys[from]);
        });
    };
    RuntimeContext.prototype.extends = function (name) {
        var ParentTemplateInfo = (this.templateParser.compile(name, this));
        var ParentTemplate = new (ParentTemplateInfo.class)();
        this.RootTemplate['__proto__']['__proto__'] = ParentTemplate;
        this.RootTemplate = ParentTemplate;
        this.LeafTemplate['__parent'] = ParentTemplate;
        this.LeafTemplate['__main'] = ParentTemplate['__main'];
        return this.LeafTemplate.__main(this);
    };
    RuntimeContext.prototype.each = function (list, callback) {
        var index = 0;
        var length = list.length;
        for(var k in list) {
            this.scope.set('loop', {
                'index0': index,
                'index': index + 1,
                'revindex0': length - index,
                'revindex': length - index - 1,
                'first': index == 0,
                'last': index == length - 1,
                'parent': this.scope.getParent(),
                'length': length
            });
            callback(k, list[k]);
            index++;
        }
    };
    RuntimeContext.prototype.range = function (low, high, step) {
        var out = RuntimeUtils.range(low, high, step);
        return out;
    };
    RuntimeContext.prototype._putBlock = function (Current, name) {
        var method = (Current[name]);
        if(method === undefined) {
            console.log(Current['__proto__']);
            throw (new Error("Can't find block '" + name + "' in '" + Current.name + ":" + this.currentBlockName + "'"));
        }
        return method.call(Current, this);
    };
    RuntimeContext.prototype.putBlock = function (name) {
        return this._putBlock(this.LeafTemplate, name);
    };
    RuntimeContext.prototype.putBlockParent = function (name) {
        return this._putBlock(this.CurrentTemplate['__proto__']['__proto__'], name);
    };
    RuntimeContext.prototype.autoescape = function (temporalValue, callback, setCurrentAfter) {
        if (typeof setCurrentAfter === "undefined") { setCurrentAfter = false; }
        if(temporalValue === undefined) {
            temporalValue = true;
        }
        var prevDefault = this.defaultAutoescape;
        this.defaultAutoescape = temporalValue;
        try  {
            this.currentAutoescape = this.defaultAutoescape;
            return callback();
        }finally {
            this.defaultAutoescape = prevDefault;
            if(setCurrentAfter) {
                this.currentAutoescape = prevDefault;
            }
        }
    };
    RuntimeContext.prototype.scopeGet = function (key) {
        switch(key) {
            case '_self':
                return this.CurrentTemplate.macros;
            case '_context':
                return this.scope.getAll();
        }
        return this.scope.get(key);
    };
    RuntimeContext.prototype.scopeSet = function (key, value) {
        return this.scope.set(key, value);
    };
    RuntimeContext.prototype.slice = function (object, left, right) {
        if(RuntimeUtils.isString(object)) {
            return (object).substr(left, right);
        }
        if(RuntimeUtils.isArray(object)) {
            return (object).slice(left, right);
        }
        return undefined;
    };
    RuntimeContext.prototype.access = function (object, key) {
        if(object === undefined || object === null) {
            return null;
        }
        if(object instanceof Function) {
            object = object();
        }
        var ret = object[key];
        return ret;
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
    RuntimeContext.prototype.inArray = function (value, array) {
        if(array instanceof Array) {
            return array.indexOf(value) != -1;
        }
        if(RuntimeUtils.isString(value) && RuntimeUtils.isString(array)) {
            return (array).indexOf(value) != -1;
        }
        return false;
    };
    RuntimeContext.prototype.ternaryShortcut = function (value, _default) {
        return value ? value : _default;
    };
    return RuntimeContext;
})();
exports.RuntimeContext = RuntimeContext;
