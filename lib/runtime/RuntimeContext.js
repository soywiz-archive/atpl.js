///<reference path='../imports.d.ts'/>
"use strict";
var TokenParserContext_1 = require('../parser/TokenParserContext');
var Scope_1 = require('./Scope');
var SandboxPolicy_1 = require('../SandboxPolicy');
//import TemplateParser = require('../parser/TemplateParser');
var RuntimeUtils = require('./RuntimeUtils');
var RuntimeContext = (function () {
    function RuntimeContext(templateParser, scopeData, languageContext) {
        this.templateParser = templateParser;
        this.languageContext = languageContext;
        this.output = '';
        this.currentAutoescape = true;
        this.defaultAutoescape = true;
        this.currentBlockName = 'none';
        this.removeFollowingSpaces = false;
        this.sandboxPolicy = new SandboxPolicy_1.SandboxPolicy();
        this.locale = null;
        this.scope = new Scope_1.Scope(scopeData);
    }
    RuntimeContext.normalizeTrans = function (text) {
        return String(text).trim().replace(/\{\{\s*(\w+)\s*\}\}/g, function (str, id) { return "%" + id + "%"; });
    };
    RuntimeContext.prototype.trans2 = function (normal, plural, count) {
        var _this = this;
        if (plural === void 0) { plural = ""; }
        if (count === void 0) { count = 1; }
        var locale = this.scopeGet("locale") || this.locale;
        var selected = (count == 1) ? normal : plural;
        return this.languageContext.trans(selected, normal, plural, locale, count).replace(/%(\w+)%/g, function (str, id) { return _this.scopeGet(id); });
    };
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
        //console.log("setCurrentBlock('" + template.name + "', '" + name + "')");
        this.CurrentTemplate = template;
        this.currentBlockName = name;
        try {
            return callback();
        }
        finally {
            this.CurrentTemplate = BackCurrentTemplate;
            this.currentBlockName = BackCurrentBlockName;
        }
    };
    RuntimeContext.prototype.createScope = function (inner, only) {
        if (only === void 0) { only = false; }
        if (only) {
            var oldScope = this.scope;
            try {
                this.scope = new Scope_1.Scope({});
                inner();
            }
            finally {
                this.scope = oldScope;
            }
        }
        else {
            this.scope.createScope(inner);
        }
    };
    RuntimeContext.prototype.captureOutput = function (callback) {
        var oldOutput = this.output;
        this.output = '';
        try {
            callback();
            return this.output;
        }
        finally {
            this.output = oldOutput;
        }
    };
    RuntimeContext.prototype.trimSpaces = function () {
        this.output = this.output.replace(/\s+$/, '');
        this.removeFollowingSpaces = true;
    };
    RuntimeContext.prototype.write = function (text) {
        if (text === undefined || text === null)
            return;
        if (this.removeFollowingSpaces) {
            text = text.replace(/^\s+/, '');
            this.removeFollowingSpaces = (text.match(/^\s+$/) != null);
        }
        this.output += text;
    };
    RuntimeContext.prototype.getEscapedText = function (text) {
        try {
            if (text === undefined || text === null)
                return '';
            if (!RuntimeUtils.isString(text))
                text = JSON.stringify(text);
            //console.log(this.currentAutoescape);
            switch (this.currentAutoescape) {
                case false:
                    text = text;
                    break;
                case 'js':
                    text = RuntimeUtils.escapeJsString(text);
                    break;
                case 'css':
                    text = RuntimeUtils.escapeCssString(text);
                    break;
                case 'url':
                    text = RuntimeUtils.escapeUrlString(text);
                    break;
                case 'html_attr':
                    text = RuntimeUtils.escapeHtmlAttribute(text);
                    break;
                case 'html':
                case true:
                case undefined:
                    text = RuntimeUtils.escapeHtmlEntities(text);
                    break;
                default: throw (new Error('Invalid escaping strategy "' + this.currentAutoescape + '"(valid ones: html, js, url, css, and html_attr).'));
            }
            return text;
        }
        finally {
            this.currentAutoescape = this.defaultAutoescape;
        }
    };
    RuntimeContext.prototype.writeExpression = function (text) {
        this.write(this.getEscapedText(text));
    };
    RuntimeContext.prototype.$call = function (functionList, $function, $arguments, $argumentNames) {
        if (functionList !== undefined && functionList !== null) {
            //console.log('call:' + $function);
            if (RuntimeUtils.isString($function))
                $function = functionList[$function];
            return this.$call2($function, $arguments, $argumentNames);
        }
        return null;
    };
    RuntimeContext.prototype.$call2 = function ($function, $arguments, $argumentNames) {
        if ($function !== undefined && $function !== null) {
            if ($function instanceof Function) {
                return RuntimeUtils.callFunctionWithNamedArguments(this, $function, $arguments, $argumentNames);
            }
        }
        return null;
    };
    RuntimeContext.prototype.callContext = function ($context, $functionName, $arguments, $argumentNames) {
        if ($context !== undefined && $context !== null) {
            var $function = $context[$functionName];
            if ($function instanceof Function) {
                return RuntimeUtils.callFunctionWithNamedArguments($context, $function, $arguments, $argumentNames);
            }
        }
        return null;
    };
    RuntimeContext.prototype.call = function ($function, $arguments, $argumentNames) {
        if (this.languageContext.functions[$function] === undefined) {
            return this.$call2(this.scope.get($function), $arguments, $argumentNames);
        }
        else {
            return this.$call(this.languageContext.functions, $function, $arguments, $argumentNames);
        }
    };
    RuntimeContext.prototype.filter = function (filterName, $arguments) {
        if (this.languageContext.filters[filterName] === undefined)
            throw (new Error("Invalid filter type '" + filterName + "'"));
        return this.$call(this.languageContext.filters, filterName, $arguments);
    };
    RuntimeContext.prototype.test = function ($function, $arguments) {
        return this.$call(this.languageContext.tests, $function, $arguments);
    };
    // TODO: Probably better to create a object separate to RuntimeContext that holds those values.
    RuntimeContext.prototype._KeepTemplateHierarchy = function (callback) {
        var LeafTemplateOld = this.LeafTemplate;
        var CurrentTemplateOld = this.CurrentTemplate;
        var RootTemplateOld = this.RootTemplate;
        try {
            callback();
        }
        finally {
            this.LeafTemplate = LeafTemplateOld;
            this.CurrentTemplate = CurrentTemplateOld;
            this.RootTemplate = RootTemplateOld;
        }
    };
    RuntimeContext.prototype.include = function (info, scope, only, tokenParserContextCommonInfo) {
        var _this = this;
        if (scope === void 0) { scope = {}; }
        if (only === void 0) { only = false; }
        this.createScope(function () {
            if (scope !== undefined)
                _this.scope.setAll(scope);
            if (RuntimeUtils.isString(info)) {
                var name = info;
                var IncludeTemplate = new ((_this.templateParser.compile(name, _this, new TokenParserContext_1.TokenParserContextCommon(tokenParserContextCommonInfo))).class)();
                _this._KeepTemplateHierarchy(function () {
                    _this.LeafTemplate = _this.CurrentTemplate = _this.RootTemplate = IncludeTemplate;
                    IncludeTemplate.__main(_this);
                });
            }
            else {
                var IncludeTemplate = new (info.class)();
                _this._KeepTemplateHierarchy(function () {
                    _this.LeafTemplate = _this.CurrentTemplate = _this.RootTemplate = IncludeTemplate;
                    IncludeTemplate.__main(_this);
                });
            }
        }, only);
    };
    RuntimeContext.prototype.import = function (name) {
        var IncludeTemplate = new ((this.templateParser.compile(name, this)).class)();
        //console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<");
        //console.log(IncludeTemplate.macros);
        //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
        return IncludeTemplate.macros;
        //return 'Hello World!';
    };
    RuntimeContext.prototype.fromImport = function (name, pairs) {
        var _this = this;
        var keys = this.import(name);
        pairs.forEach(function (pair) {
            var from = pair[0];
            var to = pair[1];
            //console.log(from + " : " + to);
            _this.scope.set(to, keys[from]);
        });
    };
    RuntimeContext.prototype.extends = function (name) {
        var ParentTemplateInfo = (this.templateParser.compile(name, this));
        var ParentTemplate = new (ParentTemplateInfo.class)();
        //for (var key in ParentTemplate) if (this.CurrentTemplate[key] === undefined) this.CurrentTemplate[key] = ParentTemplate[key];
        this.RootTemplate['__proto__']['__proto__'] = ParentTemplate;
        this.RootTemplate = ParentTemplate;
        this.LeafTemplate['__parent'] = ParentTemplate;
        this.LeafTemplate['__main'] = ParentTemplate['__main'];
        return this.LeafTemplate.__main(this);
    };
    RuntimeContext.prototype.each = function (list, callback) {
        var index = 0;
        var length = list.length;
        for (var k in list) {
            this.scope.set('loop', {
                'index0': index,
                'index': index + 1,
                'revindex0': length - index,
                'revindex': length - index - 1,
                'first': index == 0,
                'last': index == length - 1,
                'parent': this.scope.getParent(),
                'length': length,
            });
            callback(k, list[k]);
            index++;
        }
    };
    RuntimeContext.prototype.range = function (low, high, step) {
        var out = RuntimeUtils.range(low, high, step);
        //console.log(out);
        return out;
    };
    RuntimeContext.prototype._getBlocks = function (Current) {
        var ret = {};
        //console.log('-------------');
        //console.log(util.inspect(Current['__proto__'], false));
        //console.log('+++++++++++++');
        //if (Current['__parent']) ret = this._getBlocks(Current['__parent']);
        //if (Current['__proto__'] && Current['__proto__']['__proto__']) ret = this._getBlocks(Current['__proto__']['__proto__']);
        //console.log('*************');
        for (var key in Current) {
            //console.log(key);
            if (key.match(/^block_/))
                ret[key] = Current[key];
        }
        return ret;
    };
    RuntimeContext.prototype._putBlock = function (Current, name) {
        var method = (Current[name]);
        if (method === undefined) {
            console.log(Current['__proto__']);
            throw (new Error("Can't find block '" + name + "' in '" + Current.name + ":" + this.currentBlockName + "'"));
        }
        return method.call(Current, this);
    };
    RuntimeContext.prototype.putBlock = function (name) {
        return this._putBlock(this.LeafTemplate, name);
    };
    RuntimeContext.prototype.putBlockParent = function (name) {
        //console.log('RootTemplate: ' + this.RootTemplate.name);
        //console.log('LeafTemplate: ' + this.LeafTemplate.name);
        //console.log('CurrentTemplate: ' + this.CurrentTemplate.name);
        return this._putBlock(this.CurrentTemplate['__proto__']['__proto__'], name);
        //throw (new Error("Not implemented"));
    };
    RuntimeContext.prototype.autoescape = function (temporalValue, callback, setCurrentAfter) {
        if (setCurrentAfter === void 0) { setCurrentAfter = false; }
        if (temporalValue === undefined)
            temporalValue = true;
        var prevDefault = this.defaultAutoescape;
        this.defaultAutoescape = temporalValue;
        try {
            this.currentAutoescape = this.defaultAutoescape;
            //console.log(this.currentAutoescape);
            return callback();
        }
        finally {
            this.defaultAutoescape = prevDefault;
            if (setCurrentAfter)
                this.currentAutoescape = prevDefault;
        }
    };
    RuntimeContext.prototype.scopeGet = function (key) {
        switch (key) {
            case '_self':
                // FIXME?: Probably not CurrentTemplate but the template that contains this functions.
                return this.CurrentTemplate.macros;
            case '_context':
                // INFO: This will be SLOW.
                return this.scope.getAll();
        }
        return this.scope.get(key);
    };
    RuntimeContext.prototype.scopeSet = function (key, value) {
        return this.scope.set(key, value);
    };
    RuntimeContext.prototype.slice = function (object, left, right) {
        if (RuntimeUtils.isString(object)) {
            return object.substr(left, right);
        }
        if (RuntimeUtils.isArray(object)) {
            return object.slice(left, right);
        }
        return undefined;
    };
    RuntimeContext.prototype.access = function (object, key) {
        if (object === undefined || object === null)
            return null;
        var ret = object[key];
        return ret;
    };
    RuntimeContext.prototype.accessCall = function (object, key, _arguments) {
        var ret = this.access(object, key);
        if (ret instanceof Function)
            ret = ret.apply(object, _arguments);
        return ret;
    };
    RuntimeContext.prototype.emptyList = function (value) {
        if (value === undefined || value === null)
            return true;
        if (value instanceof Array || value instanceof String)
            return (value.length == 0);
        return false;
    };
    RuntimeContext.prototype.ternaryShortcut = function (value, _default) {
        return value ? value : _default;
    };
    RuntimeContext.prototype.inArray = function (value, array) {
        return RuntimeUtils.inArray(value, array);
    };
    return RuntimeContext;
}());
exports.RuntimeContext = RuntimeContext;
