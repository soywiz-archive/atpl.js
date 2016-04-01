"use strict";
var RuntimeUtils = require('../runtime/RuntimeUtils');
var DefaultTests = (function () {
    function DefaultTests() {
    }
    // http://twig.sensiolabs.org/doc/tests/constant.html
    DefaultTests.constant = function (value, constant) {
        throw (new Error("Not implemented test [constant] [no use on javascript]"));
    };
    // http://twig.sensiolabs.org/doc/tests/defined.html
    DefaultTests.defined = function (value) {
        return RuntimeUtils.defined(value);
    };
    // http://twig.sensiolabs.org/doc/tests/divisibleby.html
    DefaultTests.divisibleby = function (value, right) {
        return (value % right) == 0;
    };
    // http://twig.sensiolabs.org/doc/tests/empty.html
    DefaultTests.empty = function (value) {
        return RuntimeUtils.empty(value);
    };
    // http://twig.sensiolabs.org/doc/tests/even.html
    DefaultTests.even = function (value) {
        return (value % 2) == 0;
    };
    // http://twig.sensiolabs.org/doc/tests/iterable.html
    DefaultTests.iterable = function (value) {
        if (RuntimeUtils.isArray(value))
            return true;
        if (RuntimeUtils.isObject(value) && (value !== null))
            return true;
        return false;
    };
    // http://twig.sensiolabs.org/doc/tests/null.html
    DefaultTests.$null = function (value) {
        return (value === null);
    };
    // http://twig.sensiolabs.org/doc/tests/odd.html
    DefaultTests.odd = function (value) {
        return (value % 2) == 1;
    };
    // http://twig.sensiolabs.org/doc/tests/sameas.html
    DefaultTests.sameas = function (value, right) {
        return (value === right);
    };
    return DefaultTests;
}());
exports.DefaultTests = DefaultTests;
