"use strict";
var RuntimeUtils = require('../runtime/RuntimeUtils');
/**
 *
 */
var DefaultFunctions = (function () {
    function DefaultFunctions() {
    }
    /**
     * Obtains a range of numbers
     *
     * @see http://twig.sensiolabs.org/doc/functions/range.html
     */
    DefaultFunctions.range = function (low, high, step) {
        if (step === void 0) { step = 1; }
        return RuntimeUtils.range(low, high, step);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/cycle.html
     */
    DefaultFunctions.cycle = function (list, index) {
        return list[index % list.length];
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/constant.html
     */
    DefaultFunctions.constant = function (name) {
        throw (new Error("Not implemented function [constant] [no use on javascript]"));
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/include.html
     */
    DefaultFunctions.include = function (name) {
        var runtimeContext = this;
        runtimeContext.include(name);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/random.html
     */
    DefaultFunctions.random = function (values) {
        if (values === undefined || values === null) {
            return RuntimeUtils.random();
        }
        else if (RuntimeUtils.isArray(values) || RuntimeUtils.isString(values)) {
            return values[RuntimeUtils.random(0, values.length)];
        }
        else {
            return RuntimeUtils.random(0, values);
        }
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/attribute.html
     */
    DefaultFunctions.attribute = function (object, method, _arguments) {
        var runtimeContext = this;
        return runtimeContext.accessCall(object, method, _arguments);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/block.html
     */
    DefaultFunctions.block = function (name) {
        var runtimeContext = this;
        return runtimeContext.captureOutput(function () {
            runtimeContext.putBlock('block_' + name);
        });
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/parent.html
     */
    DefaultFunctions.parent = function () {
        var runtimeContext = this;
        return runtimeContext.autoescape(false, function () {
            return runtimeContext.captureOutput(function () {
                runtimeContext.putBlockParent(runtimeContext.currentBlockName);
            });
        });
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/dump.html
     */
    DefaultFunctions.dump = function () {
        var objects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objects[_i - 0] = arguments[_i];
        }
        var runtimeContext = this;
        if (objects.length > 0) {
            var result = '';
            for (var n = 0; n < objects.length; n++)
                result += RuntimeUtils.inspect_json(objects[n]);
            return result;
        }
        else {
            return RuntimeUtils.inspect_json(runtimeContext.scope.getAll());
        }
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/date.html
     */
    DefaultFunctions.date = function (date, timezone) {
        if (timezone !== undefined)
            throw (new Error("Not implemented function [date] with [timezone] parameter"));
        return RuntimeUtils.strtotime(date);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/functions/template_from_string.html
     */
    DefaultFunctions.template_from_string = function (template) {
        var runtimeContext = this;
        return runtimeContext.compileString(template);
    };
    /**
     *
     * @see https://github.com/soywiz/atpl.js/issues/13
     */
    DefaultFunctions.inspect = function (object, showHidden, depth, color) {
        return RuntimeUtils.inspect(object, showHidden, depth, color);
    };
    return DefaultFunctions;
}());
exports.DefaultFunctions = DefaultFunctions;
