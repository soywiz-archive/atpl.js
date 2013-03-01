var RuntimeUtils = require('../runtime/RuntimeUtils')
var DefaultTests = (function () {
    function DefaultTests() { }
    DefaultTests.constant = function constant(value, constant) {
        throw (new Error("Not implemented test [constant] [no use on javascript]"));
    };
    DefaultTests.defined = function defined(value) {
        return RuntimeUtils.defined(value);
    };
    DefaultTests.divisibleby = function divisibleby(value, right) {
        return (value % right) == 0;
    };
    DefaultTests.empty = function empty(value) {
        return RuntimeUtils.empty(value);
    };
    DefaultTests.even = function even(value) {
        return (value % 2) == 0;
    };
    DefaultTests.iterable = function iterable(value) {
        if(RuntimeUtils.isArray(value)) {
            return true;
        }
        if(RuntimeUtils.isObject(value) && (value !== null)) {
            return true;
        }
        return false;
    };
    DefaultTests.$null = function $null(value) {
        return (value === null);
    };
    DefaultTests.odd = function odd(value) {
        return (value % 2) == 1;
    };
    DefaultTests.sameas = function sameas(value, right) {
        return (value === right);
    };
    return DefaultTests;
})();
exports.DefaultTests = DefaultTests;
