var RuntimeUtils = require('../runtime/RuntimeUtils')
var DefaultTests = (function () {
    function DefaultTests() { }
    DefaultTests.constant = // http://twig.sensiolabs.org/doc/tests/constant.html
    function constant(value, constant) {
        throw (new Error("Not implemented test [constant] [no use on javascript]"));
    };
    DefaultTests.defined = // http://twig.sensiolabs.org/doc/tests/defined.html
    function defined(value) {
        return RuntimeUtils.defined(value);
    };
    DefaultTests.divisibleby = // http://twig.sensiolabs.org/doc/tests/divisibleby.html
    function divisibleby(value, right) {
        return (value % right) == 0;
    };
    DefaultTests.empty = // http://twig.sensiolabs.org/doc/tests/empty.html
    function empty(value) {
        return RuntimeUtils.empty(value);
    };
    DefaultTests.even = // http://twig.sensiolabs.org/doc/tests/even.html
    function even(value) {
        return (value % 2) == 0;
    };
    DefaultTests.iterable = // http://twig.sensiolabs.org/doc/tests/iterable.html
    function iterable(value) {
        if(value instanceof Array) {
            return true;
        }
        return false;
    };
    DefaultTests.$null = // http://twig.sensiolabs.org/doc/tests/null.html
    function $null(value) {
        return (value === null);
    };
    DefaultTests.odd = // http://twig.sensiolabs.org/doc/tests/odd.html
    function odd(value) {
        return (value % 2) == 1;
    };
    DefaultTests.sameas = // http://twig.sensiolabs.org/doc/tests/sameas.html
    function sameas(value, right) {
        return (value === right);
    };
    return DefaultTests;
})();
exports.DefaultTests = DefaultTests;
//@ sourceMappingURL=DefaultTests.js.map
