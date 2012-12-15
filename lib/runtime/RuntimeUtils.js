function capitalize(str) {
    str = String(str);
    return str.charAt(0).toUpperCase() + str.substr(1);
}
exports.capitalize = capitalize;
function title(str) {
    return String(str).replace(/\w+/g, function (word) {
        return capitalize(word);
    });
}
exports.title = title;
function range(from, to, step) {
    if (typeof step === "undefined") { step = 1; }
    if((from.substr) || (to.substr)) {
        return rangeString(String(from), String(to), step);
    }
    return rangeNumbers(from, to, step);
}
exports.range = range;
function rangeNumbers(from, to, step) {
    if (typeof step === "undefined") { step = 1; }
    var out = [];
    from = parseInt(from);
    to = parseInt(to);
    step = parseInt(step);
    if(step == 0) {
        step = 1;
    }
    while(from <= to) {
        out.push(from);
        from += step;
    }
    return out;
}
exports.rangeNumbers = rangeNumbers;
function rangeString(from, to, step) {
    if (typeof step === "undefined") { step = 1; }
    return rangeNumbers(String(from).charCodeAt(0), String(to).charCodeAt(0), step).map(function (value, index, array) {
        return '' + String.fromCharCode(value);
    });
}
exports.rangeString = rangeString;
