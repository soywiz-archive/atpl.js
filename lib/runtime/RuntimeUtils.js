var DateFormat = require('./lib/DateFormat')
var Format = require('./lib/Format')
var _strtotime = require('./lib/strtotime')
var _strip_tags = require('./lib/strip_tags')
var util = require('util')
function ensureNumber(value) {
    if(isNumber(value)) {
        return value;
    }
    return parseFloat(String(value));
}
exports.ensureNumber = ensureNumber;
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
function strip_tags(input, allowed) {
    return _strip_tags.strip_tags(input, allowed);
}
exports.strip_tags = strip_tags;
function split(value, delimiter, limit) {
    if(delimiter == '') {
        if(limit === undefined) {
            limit = 1;
        }
        var ret = [];
        for(var n = 0; n < value.length; n += limit) {
            ret.push(value.substr(n, limit));
        }
        return ret;
    } else {
        if(limit === undefined) {
            limit = 9999999999;
        }
        var extraArray = value.split(delimiter).slice(limit - 1);
        var parts = value.split(delimiter, limit - 1);
        if(extraArray.length) {
            parts.push(extraArray.join(delimiter));
        }
        return parts;
    }
}
exports.split = split;
function strtotime(text, now) {
    return _strtotime.strtotime(text, now);
}
exports.strtotime = strtotime;
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
    var _arguments = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        _arguments[_i] = arguments[_i + 0];
    }
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
function $default(value, default_value) {
    if(value === undefined || value === null) {
        return default_value;
    }
    return value;
}
exports.$default = $default;
function empty(value) {
    if(value === null || value === undefined || value === false) {
        return true;
    }
    if(isArray(value) || isString(value)) {
        return (value.length == 0);
    }
    return false;
}
exports.empty = empty;
function isNumber(obj) {
    return typeof obj == 'number';
}
exports.isNumber = isNumber;
function toString(obj) {
    if(!defined(obj)) {
        return '';
    }
    return '' + obj;
}
exports.toString = toString;
function isString(obj) {
    return typeof obj == 'string';
}
exports.isString = isString;
function isArray(obj) {
    if(!defined(obj)) {
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
function escapeHtmlEntities(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
exports.escapeHtmlEntities = escapeHtmlEntities;
function escapeHtmlAttribute(text) {
    return String(text).replace(/[^a-zA-Z0-9,\.\-_]/g, function (match) {
        var chr = match;
        var ord = match.charCodeAt(0);
        if((ord <= 0x1f && chr != "\t" && chr != "\n" && chr != "\r") || (ord >= 0x7f && ord <= 0x9f)) {
            return '&#xFFFD;';
        }
        switch(ord) {
            case 34:
                return '&quot;';
            case 38:
                return '&amp;';
            case 60:
                return '&lt;';
            case 62:
                return '&gt;';
        }
        return '&#x' + (('0000' + ord.toString(16)).substr((ord < 0x100) ? -2 : -4)) + ';';
    });
}
exports.escapeHtmlAttribute = escapeHtmlAttribute;
function escapeJsString(text) {
    return text.replace(/\W/g, function (match) {
        switch(match) {
            case '\'':
                return '\\\'';
            case '"':
                return '\\\"';
            case ' ':
                return ' ';
            case "\n":
                return '\\n';
            case "\r":
                return '\\r';
            case "\t":
                return '\\t';
            default:
                var charCode = match.charCodeAt(0);
                var retCode = charCode.toString(16);
                while(retCode.length < 4) {
                    retCode = '0' + retCode;
                }
                return '\\u' + retCode;
                break;
        }
    });
}
exports.escapeJsString = escapeJsString;
function escapeCssString(text) {
    return text.replace(/\W/g, function (match) {
        return '\\' + match.charCodeAt(0).toString(16).toUpperCase() + ' ';
    });
}
exports.escapeCssString = escapeCssString;
function escapeUrlString(str) {
    str = (str + '').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
}
exports.escapeUrlString = escapeUrlString;
