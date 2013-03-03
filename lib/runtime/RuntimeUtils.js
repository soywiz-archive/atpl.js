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
exports.__sprintf = (function () {
    function get_type(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }
    function str_repeat(input, multiplier) {
        for(var output = []; multiplier > 0; output[--multiplier] = input) {
        }
        return output.join('');
    }
    var str_format = function () {
        if(!str_format.cache.hasOwnProperty(arguments[0])) {
            str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
        }
        return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    };
    str_format.format = function (parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
        for(i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i]);
            if(node_type === 'string') {
                output.push(parse_tree[i]);
            } else if(node_type === 'array') {
                match = parse_tree[i];
                if(match[2]) {
                    arg = argv[cursor];
                    for(k = 0; k < match[2].length; k++) {
                        if(!arg.hasOwnProperty(match[2][k])) {
                            throw (sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                        }
                        arg = arg[match[2][k]];
                    }
                } else if(match[1]) {
                    arg = argv[match[1]];
                } else {
                    arg = argv[cursor++];
                }
                if(/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                    throw (sprintf('[sprintf] expecting number but found %s', get_type(arg)));
                }
                switch(match[8]) {
                    case 'b':
                        arg = arg.toString(2);
                        break;
                    case 'c':
                        arg = String.fromCharCode(arg);
                        break;
                    case 'd':
                        arg = parseInt(arg, 10);
                        break;
                    case 'e':
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                        break;
                    case 'f':
                        arg = match[7] ? parseInt(parseFloat(arg).toFixed(match[7])) : parseFloat(arg);
                        break;
                    case 'o':
                        arg = arg.toString(8);
                        break;
                    case 's':
                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg);
                        break;
                    case 'u':
                        arg = Math.abs(arg);
                        break;
                    case 'x':
                        arg = arg.toString(16);
                        break;
                    case 'X':
                        arg = arg.toString(16).toUpperCase();
                        break;
                }
                arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+' + arg : arg);
                pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                pad_length = match[6] - String(arg).length;
                pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                output.push(match[5] ? arg + pad : pad + arg);
            }
        }
        return output.join('');
    };
    str_format.cache = {
    };
    str_format.parse = function (fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0, field_match;
        while(_fmt) {
            if((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                parse_tree.push(match[0]);
            } else if((match = /^\x25{2}/.exec(_fmt)) !== null) {
                parse_tree.push('%');
            } else if((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                if(match[2]) {
                    arg_names |= 1;
                    var field_list = [], replacement_field = match[2], field_match = [];
                    if((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1]);
                        while((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                            if((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            } else if((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            } else {
                                throw ('[sprintf] huh?');
                            }
                        }
                    } else {
                        throw ('[sprintf] huh?');
                    }
                    match[2] = field_list;
                } else {
                    arg_names |= 2;
                }
                if(arg_names === 3) {
                    throw ('[sprintf] mixing positional and named placeholders is not (yet) supported');
                }
                parse_tree.push(match);
            } else {
                throw ('[sprintf] huh?');
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return parse_tree;
    };
    return str_format;
})();
function sprintf() {
    var _arguments = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        _arguments[_i] = arguments[_i + 0];
    }
    return exports.__sprintf.apply(null, arguments);
}
exports.sprintf = sprintf;
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
function getOrdinalFor(intNum) {
    return (((intNum = Math.abs(intNum) % 100) % 10 == 1 && intNum != 11) ? "st" : (intNum % 10 == 2 && intNum != 12) ? "nd" : (intNum % 10 == 3 && intNum != 13) ? "rd" : "th");
}
exports.getOrdinalFor = getOrdinalFor;
function getISO8601Year(aDate) {
    var d = new Date(aDate.getFullYear() + 1, 0, 4);
    if((d - aDate) / 86400000 < 7 && (aDate.getDay() + 6) % 7 < (d.getDay() + 6) % 7) {
        return d.getFullYear();
    }
    if(aDate.getMonth() > 0 || aDate.getDate() >= 4) {
        return aDate.getFullYear();
    }
    return aDate.getFullYear() - (((aDate.getDay() + 6) % 7 - aDate.getDate() > 2) ? 1 : 0);
}
exports.getISO8601Year = getISO8601Year;
function getISO8601Week(aDate) {
    var d = new Date(getISO8601Year(aDate), 0, 4);
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return Math.floor((aDate - d) / 604800000) + 1;
}
exports.getISO8601Week = getISO8601Week;
var date_shortDays = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
var date_fullDays = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
var date_shortMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
var date_fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
function date(format, date, timezone) {
    if(date === undefined) {
        date = new Date();
    }
    if(!(date instanceof Date)) {
        date = new Date(date * 1000);
    }
    if(typeof format !== "string" || /^\s*$/.test(format)) {
        return date + "";
    }
    var jan1st = new Date(date.getFullYear(), 0, 1);
    var me = date;
    return format.replace(/[dDjlNSwzWFmMntLoYyaABgGhHisu]/g, function (option) {
        switch(option) {
            case "d":
                return ("0" + me.getDate()).replace(/^.+(..)$/, "$1");
            case "D":
                return date_shortDays[me.getDay()];
            case "j":
                return me.getDate();
            case "l":
                return date_fullDays[me.getDay()];
            case "N":
                return (me.getDay() + 6) % 7 + 1;
            case "S":
                return getOrdinalFor(me.getDate());
            case "w":
                return me.getDay();
            case "z":
                return Math.ceil((jan1st - me) / 86400000);
            case "W":
                return ("0" + getISO8601Week(me)).replace(/^.(..)$/, "$1");
            case "F":
                return date_fullMonths[me.getMonth()];
            case "m":
                return ("0" + (me.getMonth() + 1)).replace(/^.+(..)$/, "$1");
            case "M":
                return date_shortMonths[me.getMonth()];
            case "n":
                return me.getMonth() + 1;
            case "t":
                return new Date(me.getFullYear(), me.getMonth() + 1, -1).getDate();
            case "L":
                return new Date(me.getFullYear(), 1, 29).getDate() == 29 ? 1 : 0;
            case "o":
                return getISO8601Year(me);
            case "Y":
                return me.getFullYear();
            case "y":
                return (me.getFullYear() + "").replace(/^.+(..)$/, "$1");
            case "a":
                return me.getHours() < 12 ? "am" : "pm";
            case "A":
                return me.getHours() < 12 ? "AM" : "PM";
            case "B":
                return Math.floor((((me.getUTCHours() + 1) % 24) + me.getUTCMinutes() / 60 + me.getUTCSeconds() / 3600) * 1000 / 24);
            case "g":
                return me.getHours() % 12 != 0 ? me.getHours() % 12 : 12;
            case "G":
                return me.getHours();
            case "h":
                return ("0" + (me.getHours() % 12 != 0 ? me.getHours() % 12 : 12)).replace(/^.+(..)$/, "$1");
            case "H":
                return ("0" + me.getHours()).replace(/^.+(..)$/, "$1");
            case "i":
                return ("0" + me.getMinutes()).replace(/^.+(..)$/, "$1");
            case "s":
                return ("0" + me.getSeconds()).replace(/^.+(..)$/, "$1");
            case "u":
                return me.getMilliseconds();
        }
    });
}
exports.date = date;
function inArray(value, array) {
    if(array instanceof Array) {
        return array.indexOf(value) != -1;
    }
    if(isString(value) && isString(array)) {
        return (array).indexOf(value) != -1;
    }
    return false;
}
exports.inArray = inArray;
function getFunctionParameterNames(func) {
    var funStr = func.toString();
    return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}
exports.getFunctionParameterNames = getFunctionParameterNames;
function callFunctionWithNamedArguments($context, $function, $arguments, $namedArguments) {
    if($namedArguments !== null && $namedArguments !== undefined) {
        var argumentNames = getFunctionParameterNames($function);
        var namedPairs = {
        };
        var unnamedList = [];
        for(var n = 0; n < $arguments.length; n++) {
            if($namedArguments[n] === null) {
                unnamedList.push($arguments[n]);
            } else {
                namedPairs[$namedArguments[n]] = $arguments[n];
            }
        }
        $arguments = [];
        argumentNames.forEach(function (argumentName) {
            if($namedArguments.indexOf(argumentName) != -1) {
                $arguments.push(namedPairs[argumentName]);
            } else {
                $arguments.push(unnamedList.shift());
            }
        });
    }
    return $function.apply($context, $arguments);
}
exports.callFunctionWithNamedArguments = callFunctionWithNamedArguments;
