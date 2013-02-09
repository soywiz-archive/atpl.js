var RuntimeUtils = require('../runtime/RuntimeUtils')
var util = require('util')
var DefaultFunctions = (function () {
    function DefaultFunctions() { }
    DefaultFunctions.range = // http://twig.sensiolabs.org/doc/functions/range.html
    function range(low, high, step) {
        if (typeof step === "undefined") { step = 1; }
        return RuntimeUtils.range(low, high, step);
    };
    DefaultFunctions.cycle = // http://twig.sensiolabs.org/doc/functions/cycle.html
    function cycle(list, index) {
        return list[index % list.length];
    };
    DefaultFunctions.constant = // http://twig.sensiolabs.org/doc/functions/constant.html
    function constant(name) {
        throw (new Error("Not implemented function [constant] [no use on javascript]"));
    };
    DefaultFunctions.random = // http://twig.sensiolabs.org/doc/functions/random.html
    function random(values) {
        if(values === undefined || values === null) {
            return RuntimeUtils.random();
        }
        if((values.prototype == Array.prototype) || (values.prototype == String.prototype)) {
            return values[Math.round(RuntimeUtils.random() * (values.length - 1))];
        }
        return RuntimeUtils.random(0, values);
    };
    DefaultFunctions.attribute = // http://twig.sensiolabs.org/doc/functions/attribute.html
    function attribute(object, method, arguments) {
        throw (new Error("Not implemented function [attribute] [no use on javascript]"));
    };
    DefaultFunctions.block = // http://twig.sensiolabs.org/doc/functions/block.html
    function block(name) {
        var that = this;
        return that.captureOutput(function () {
            that.putBlock('block_' + name);
        });
    };
    DefaultFunctions.parent = // http://twig.sensiolabs.org/doc/functions/parent.html
    function parent() {
        var that = this;
        return that.captureOutput(function () {
            that.putBlockParent(that.currentBlockName);
        });
    };
    DefaultFunctions.dump = // http://twig.sensiolabs.org/doc/functions/dump.html
    function dump() {
        var objects = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            objects[_i] = arguments[_i + 0];
        }
        if(objects.length > 0) {
            var result = '';
            for(var n = 0; n < objects.length; n++) {
                result += RuntimeUtils.inspect_json(objects[n]);
            }
            return result;
        } else {
            return RuntimeUtils.inspect_json(this.scope.getAll());
        }
    };
    DefaultFunctions.date = // http://twig.sensiolabs.org/doc/functions/date.html
    function date(date, timezone) {
        throw (new Error("Not implemented function [date]"));
    };
    DefaultFunctions.template_from_string = // http://twig.sensiolabs.org/doc/functions/template_from_string.html
    function template_from_string(template) {
        throw (new Error("Not implemented function [template_from_string]"));
    };
    DefaultFunctions.inspect = // https://github.com/soywiz/atpl.js/issues/13
    function inspect(object, showHidden, depth, color) {
        return util.inspect(object, showHidden, depth, color);
    };
    return DefaultFunctions;
})();
exports.DefaultFunctions = DefaultFunctions;
//@ sourceMappingURL=DefaultFunctions.js.map
