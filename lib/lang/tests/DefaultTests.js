var DefaultTests = (function () {
    function DefaultTests() { }
    DefaultTests.constant = function constant(value, constant) {
        throw (new Error("Not implemented"));
    }
    DefaultTests.defined = function defined(value) {
        return (value !== null) && (value !== undefined);
    }
    DefaultTests.divisibleby = function divisibleby(value, right) {
        return (value % right) == 0;
    }
    DefaultTests.empty = function empty(value) {
        if(!DefaultTests.defined(value)) {
            return true;
        }
        if(value.prototype == Array.prototype || value.prototype == String.prototype) {
            return (value.length == 0);
        }
        return false;
    }
    DefaultTests.even = function even(value) {
        return (value % 2) == 0;
    }
    DefaultTests.iterable = function iterable(value) {
        throw (new Error("Not implemented"));
    }
    DefaultTests.$null = function $null(value) {
        return (value === null);
    }
    DefaultTests.odd = function odd(value) {
        return (value % 2) == 1;
    }
    DefaultTests.sameas = function sameas(value, right) {
        return (value === right);
    }
    return DefaultTests;
})();
exports.DefaultTests = DefaultTests;
