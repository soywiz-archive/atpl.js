var RuntimeUtils = require('../runtime/RuntimeUtils')


var util = require('util')
var DefaultFunctions = (function () {
    function DefaultFunctions() { }
    DefaultFunctions.range = function range(low, high, step) {
        if (typeof step === "undefined") { step = 1; }
        return RuntimeUtils.range(low, high, step);
    };
    DefaultFunctions.cycle = function cycle(list, index) {
        return list[index % list.length];
    };
    DefaultFunctions.constant = function constant(name) {
        throw (new Error("Not implemented function [constant] [no use on javascript]"));
    };
    DefaultFunctions.include = function include(name) {
        var runtimeContext = this;
        runtimeContext.include(name);
    };
    DefaultFunctions.random = function random(values) {
        if(values === undefined || values === null) {
            return RuntimeUtils.random();
        } else if(RuntimeUtils.isArray(values) || RuntimeUtils.isString(values)) {
            return values[RuntimeUtils.random(0, values.length)];
        } else {
            return RuntimeUtils.random(0, values);
        }
    };
    DefaultFunctions.attribute = function attribute(object, method, _arguments) {
        var runtimeContext = this;
        return runtimeContext.accessCall(object, method, _arguments);
    };
    DefaultFunctions.block = function block(name) {
        var runtimeContext = this;
        return runtimeContext.captureOutput(function () {
            runtimeContext.putBlock('block_' + name);
        });
    };
    DefaultFunctions.parent = function parent() {
        var runtimeContext = this;
        return runtimeContext.autoescape(false, function () {
            return runtimeContext.captureOutput(function () {
                runtimeContext.putBlockParent(runtimeContext.currentBlockName);
            });
        });
    };
    DefaultFunctions.dump = function dump() {
        var objects = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            objects[_i] = arguments[_i + 0];
        }
        var runtimeContext = this;
        if(objects.length > 0) {
            var result = '';
            for(var n = 0; n < objects.length; n++) {
                result += RuntimeUtils.inspect_json(objects[n]);
            }
            return result;
        } else {
            return RuntimeUtils.inspect_json(runtimeContext.scope.getAll());
        }
    };
    DefaultFunctions.date = function date(date, timezone) {
        if(timezone !== undefined) {
            throw (new Error("Not implemented function [date] with [timezone] parameter"));
        }
        return RuntimeUtils.strtotime(date);
    };
    DefaultFunctions.template_from_string = function template_from_string(template) {
        var runtimeContext = this;
        return runtimeContext.compileString(template);
    };
    DefaultFunctions.inspect = function inspect(object, showHidden, depth, color) {
        return util.inspect(object, showHidden, depth, color);
    };
    return DefaultFunctions;
})();
exports.DefaultFunctions = DefaultFunctions;
