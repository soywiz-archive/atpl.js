var DateFormat = require('./lib/DateFormat')
var Format = require('./lib/Format')
var util = require('util')
function normalizePath(path) {
    var components = [];
    var notNormalizedComponents = path.split(/[\\\/]/g);
    path = path.replace(/\\/g, '/');
    for(var index in notNormalizedComponents) {
        var component = notNormalizedComponents[index];
        switch(component) {
            case '':
                break;
            case '.':
                break;
            case '..':
                if(components.length > 0) {
                    components.pop();
                }
                break;
            default:
                components.push(component);
                break;
        }
    }
    var retval = components.join('/');
    if(path.match(/^\//)) {
        retval = '/' + retval;
    }
    return retval;
}
exports.normalizePath = normalizePath;
function quoteRegExp(str) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}
exports.quoteRegExp = quoteRegExp;
;
function pathIsInside(basePath, path) {
    basePath = normalizePath(basePath) + '/';
    path = normalizePath(path) + '/';
    return (path.substr(0, basePath.length) == basePath);
}
exports.pathIsInside = pathIsInside;
function interpretNumber(number, radix) {
    number = String(number);
    if(number == '0') {
        return 0;
    }
    if(radix === undefined) {
        if(number.substr(0, 2).toLowerCase() == '0x') {
            return interpretNumber(number.substr(2), 16);
        }
        if(number.substr(0, 2).toLowerCase() == '0b') {
            return interpretNumber(number.substr(2), 2);
        }
        if(number.substr(0, 1) == '0') {
            return interpretNumber(number.substr(1), 8);
        }
        radix = 10;
    }
    if(radix == 10) {
        return parseFloat(number);
    }
    return parseInt(number, radix);
}
exports.interpretNumber = interpretNumber;
function ensureArray(value) {
    if(isArray(value)) {
        return value;
    }
    return [
        value
    ];
}
exports.ensureArray = ensureArray;
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
function trim(value, characters) {
    if(characters !== undefined) {
        var regExpQuoted = '[' + quoteRegExp(characters) + ']';
        var regExpStart = new RegExp('^' + regExpQuoted + '+', '');
        var regExpEnd = new RegExp('' + regExpQuoted + '+$', '');
        return String(value).replace(regExpStart, '').replace(regExpEnd, '');
    } else {
        return String(value).trim();
    }
}
exports.trim = trim;
function number_format(value, decimal, decimal_point, decimal_sep) {
    if (typeof decimal === "undefined") { decimal = 0; }
    if (typeof decimal_point === "undefined") { decimal_point = '.'; }
    if (typeof decimal_sep === "undefined") { decimal_sep = ','; }
    var precision = Math.pow(10, decimal);
    var zeroPad = (decimal > 0) ? Array(decimal + 1).join('0') : '';
    value = ensureNumber(value);
    value = Math.round(value * precision) / precision;
    var valueString = String(value);
    var partsString = valueString.split('.');
    var integerString = String(partsString[0]);
    var decimalString = String((partsString.length >= 2) ? partsString[1] : '0');
    var paddedDecimalString = (decimalString + zeroPad).substr(0, decimal);
    var outputString = '';
    for(var n = integerString.length; n >= 0; n -= 3) {
        if(n - 3 < 0) {
            outputString = integerString.substr(0, 3 + (n - 3)) + outputString;
        } else {
            outputString = integerString.substr(n - 3, 3) + outputString;
        }
        if(n - 3 > 0) {
            outputString = decimal_sep + outputString;
        }
    }
    if(decimal > 0) {
        outputString += decimal_point + paddedDecimalString;
    }
    return outputString;
}
exports.number_format = number_format;
function range(from, to, step) {
    if (typeof step === "undefined") { step = 1; }
    if(isString(from) || isString(to)) {
        return rangeString(String(from), String(to), step);
    }
    return rangeNumbers(from, to, step);
}
exports.range = range;
function strip_tags(input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
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
    if(!text) {
        return null;
    }
    if(text instanceof Date) {
        return text;
    }
    text = String(text);
    text = text.trim().replace(/\s{2,}/g, ' ').replace(/[\t\r\n]/g, '').toLowerCase();
    var parse;
    var parsed;
    var match;
    var date;
    if(now instanceof Date) {
        date = now;
    } else if(now) {
        date = new Date(now * 1000);
    } else {
        date = new Date();
    }
    if(match = text.match(/^now\s*/i)) {
        text = text.substr(match[0].length);
        date = new Date();
    }
    if(!isNaN(parse = Date.parse(text))) {
        date = new Date(parse);
        text = '';
    }
    if(match = text.match(/^(\d{2,4})-(\d{2})-(\d{2})(?:\s(\d{1,2}):(\d{2})(?::\d{2})?)?(?:\.(\d+)?)?/)) {
        text = text.substr(match[0].length);
        var year = (match[1] >= 0 && match[1] <= 69) ? (+match[1] + 2000) : (match[1]);
        date = new Date(year, parseInt(match[2], 10) - 1, (match[3]), (match[4]) || 0, (match[5]) || 0, (match[6]) || 0, (match[7]) || 0);
    }
    var days = {
        'sun': 0,
        'mon': 1,
        'tue': 2,
        'wed': 3,
        'thu': 4,
        'fri': 5,
        'sat': 6
    };
    var ranges = {
        'yea': 'FullYear',
        'mon': 'Month',
        'day': 'Date',
        'hou': 'Hours',
        'min': 'Minutes',
        'sec': 'Seconds'
    };
    function lastNext(type, range, modifier) {
        var day = days[range];
        if(typeof (day) !== 'undefined') {
            var diff = day - date.getDay();
            if(diff === 0) {
                diff = 7 * modifier;
            } else if(diff > 0 && type === 'last') {
                diff -= 7;
            } else if(diff < 0 && type === 'next') {
                diff += 7;
            }
            date.setDate(date.getDate() + diff);
        }
    }
    function process(val) {
        var split = val.match(/^([+-]?\d+)\s*(\w+)$/);
        var type = split[1];
        var range = split[2].substring(0, 3);
        var typeIsNumber = /\d+/.test(type);
        var ago = split[2] === 'ago';
        var num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);
        if(typeIsNumber) {
            num *= parseInt(type, 10);
        }
        if(ranges.hasOwnProperty(range)) {
            return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
        } else if(range === 'wee') {
            return date.setDate(date.getDate() + (num * 7));
        }
        if(type === 'next' || type === 'last') {
            lastNext(type, range, num);
        } else if(!typeIsNumber) {
            return false;
        }
        return true;
    }
    var regex = '([+-]?\\d+\\s*' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)|(last|next)\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))(\\sago)?';
    if(text.length > 0) {
        match = text.match(new RegExp(regex, 'gi'));
        if(!match) {
            return false;
        }
        for(var i = 0, len = match.length; i < len; i++) {
            if(!process(match[i])) {
                return false;
            }
        }
    }
    return (date.getTime() / 1000);
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
    return encodeURIComponent(String(str)).replace(/[!'\(\)\*]/g, function (match) {
        return '%' + (('00' + match.charCodeAt(0).toString(16)).substr(-2));
    });
}
exports.escapeUrlString = escapeUrlString;
