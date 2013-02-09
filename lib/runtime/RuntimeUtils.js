var DateFormat = require('./lib/DateFormat')
var Format = require('./lib/Format')
var util = require('util')
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
    if(isString(from) || isString(to)) {
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
function random(min, max) {
    if (typeof min === "undefined") { min = 0; }
    if (typeof max === "undefined") { max = 2147483647; }
    min = Math.round(min);
    max = Math.round(max);
    return Math.round(Math.random() * (max - min)) + min;
}
exports.random = random;
function sprintf() {
    return Format.sprintf.apply(null, arguments);
}
exports.sprintf = sprintf;
function date(format, date, timezone) {
    if(date === undefined) {
        date = new Date();
    }
    if(!(date instanceof Date)) {
        date = new Date(date * 1000);
    }
    return DateFormat.date(date, format);
}
exports.date = date;
function defined(value) {
    return (value !== null) && (value !== undefined);
}
exports.defined = defined;
function empty(value) {
    if(!defined(value)) {
        return true;
    }
    if(value.prototype == Array.prototype || value.prototype == String.prototype) {
        return (value.length == 0);
    }
    return false;
}
exports.empty = empty;
function isString(obj) {
    if(empty(obj)) {
        return false;
    }
    return toString.call(obj) == '[object String]';
}
exports.isString = isString;
function isArray(obj) {
    if(empty(obj)) {
        return false;
    }
    return obj instanceof Array;
}
exports.isArray = isArray;
function isObject(obj) {
    return typeof obj === 'object';
}
exports.isObject = isObject;
function inspect_json(obj) {
    return util.inspect(obj, false, null, false);
}
exports.inspect_json = inspect_json;
function json_encode_circular(obj, already_encoded) {
    if (typeof already_encoded === "undefined") { already_encoded = undefined; }
    if(already_encoded === undefined) {
        already_encoded = [];
    }
    if(already_encoded.indexOf(obj) != -1) {
        return 'null';
    }
    var ret = '';
    if(isArray(obj)) {
        already_encoded.push(obj);
        for(var n = 0; n < obj.length; n++) {
            if(n != 0) {
                ret += ',';
            }
            ret += json_encode_circular(obj[n], already_encoded);
        }
        ret = '[' + ret + ']';
    } else if(isObject(obj)) {
        already_encoded.push(obj);
        for(var key in obj) {
            if(ret.length != 0) {
                ret += ',';
            }
            ret += JSON.stringify(key) + ':' + json_encode_circular(obj[key], already_encoded);
        }
        ret = '{' + ret + '}';
    } else {
        ret = JSON.stringify(obj);
    }
    return ret;
}
exports.json_encode_circular = json_encode_circular;
