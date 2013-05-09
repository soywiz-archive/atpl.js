var RuntimeUtils = require('../runtime/RuntimeUtils')

var DefaultFilters = (function () {
    function DefaultFilters() { }
    DefaultFilters.abs = function abs(value) {
        return Math.abs(value);
    };
    DefaultFilters.batch = function batch(_items, groupCount) {
        var items = RuntimeUtils.ensureArray(_items);
        var groupList = [];
        groupCount = RuntimeUtils.ensureNumber(groupCount);
        for(var n = 0; n < items.length; n += groupCount) {
            groupList.push(items.slice(n, n + groupCount));
        }
        return groupList;
    };
    DefaultFilters.capitalize = function capitalize(value) {
        return RuntimeUtils.capitalize(value);
    };
    DefaultFilters.convert_encoding = function convert_encoding(value, from, to) {
        throw (new Error("Not implemented [no use on javascript that works with unicode]"));
    };
    DefaultFilters.date = function date(value, format, timezone) {
        return RuntimeUtils.date(format, value, timezone);
    };
    DefaultFilters.date_modify = function date_modify(value, modifier) {
        return RuntimeUtils.strtotime(modifier, value);
    };
    DefaultFilters.$default = function $default(value, default_value) {
        return RuntimeUtils.$default(value, default_value);
    };
    DefaultFilters.e = function e(value, strategy) {
        var runtimeContext = this;
        runtimeContext.currentAutoescape = strategy;
        return value;
    };
    DefaultFilters.escape = function escape(value, strategy) {
        if (typeof strategy === "undefined") { strategy = true; }
        var runtimeContext = this;
        runtimeContext.currentAutoescape = strategy;
        return value;
    };
    DefaultFilters.format = function format(format) {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            parameters[_i] = arguments[_i + 1];
        }
        return RuntimeUtils.sprintf.apply(null, arguments);
    };
    DefaultFilters.join = function join(value, separator) {
        if (typeof separator === "undefined") { separator = ''; }
        if(!RuntimeUtils.defined(value)) {
            return '';
        }
        if(value instanceof Array) {
            return value.join(separator);
        } else {
            return value;
        }
    };
    DefaultFilters.json_encode = function json_encode(value) {
        return RuntimeUtils.json_encode_circular(value);
    };
    DefaultFilters.keys = function keys(value) {
        if(!RuntimeUtils.defined(value)) {
            return [];
        }
        if(RuntimeUtils.isString(value)) {
            return [];
        }
        var keys = [];
        for(var key in value) {
            keys.push(key);
        }
        return keys;
    };
    DefaultFilters.$length = function $length(value) {
        if(!RuntimeUtils.defined(value)) {
            return 0;
        }
        return value.length;
    };
    DefaultFilters.first = function first(value) {
        if(!RuntimeUtils.defined(value)) {
            return undefined;
        }
        if(RuntimeUtils.isArray(value)) {
            return value[0];
        }
        if(RuntimeUtils.isString(value)) {
            return value.substr(0, 1);
        }
        if(RuntimeUtils.isObject(value)) {
            for(var k in value) {
                return value[k];
            }
        }
        return undefined;
    };
    DefaultFilters.last = function last(value) {
        if(!RuntimeUtils.defined(value)) {
            return undefined;
        }
        if(RuntimeUtils.isArray(value)) {
            return value[value.length - 1];
        }
        if(RuntimeUtils.isString(value)) {
            return value.substr(-1, 1);
        }
        if(RuntimeUtils.isObject(value)) {
            var last;
            for(var k in value) {
                last = value[k];
            }
            return last;
        }
        return undefined;
    };
    DefaultFilters.lower = function lower(value) {
        return String(value).toLowerCase();
    };
    DefaultFilters.merge = function merge(value, add) {
        if(RuntimeUtils.isArray(value)) {
            return (value).concat(add);
        } else {
            var object = {
            };
            for(var key in value) {
                object[key] = value[key];
            }
            for(var key in add) {
                object[key] = add[key];
            }
            return object;
        }
    };
    DefaultFilters.nl2br = function nl2br(value) {
        var runtimeContext = this;
        value = runtimeContext.getEscapedText(value);
        runtimeContext.currentAutoescape = false;
        return String(value).replace(/\n/g, '<br />\n');
    };
    DefaultFilters.number_format = function number_format(value, decimal, decimal_point, decimal_sep) {
        if (typeof decimal === "undefined") { decimal = 0; }
        if (typeof decimal_point === "undefined") { decimal_point = '.'; }
        if (typeof decimal_sep === "undefined") { decimal_sep = ','; }
        return RuntimeUtils.number_format(value, decimal, decimal_point, decimal_sep);
    };
    DefaultFilters.raw = function raw(value) {
        var runtimeContext = this;
        runtimeContext.currentAutoescape = false;
        return value;
    };
    DefaultFilters.replace = function replace(value, replace_pairs) {
        return String(value).replace(new RegExp("(" + Object.keys(replace_pairs).map(function (item) {
            return RuntimeUtils.quoteRegExp(item);
        }).join('|') + ")", "g"), function (match) {
            return replace_pairs[match];
        });
    };
    DefaultFilters.reverse = function reverse(value) {
        if(!RuntimeUtils.defined(value)) {
            return value;
        }
        if(RuntimeUtils.isArray(value)) {
            return value.reverse();
        }
        if(RuntimeUtils.isNumber(value)) {
            value = value.toString();
        }
        if(RuntimeUtils.isString(value)) {
            var ret = '';
            for(var n = 0; n < value.length; n++) {
                ret += value.charAt(value.length - n - 1);
            }
            return ret;
        }
        throw (new Error("Not implemented filter [reverse] with value type [" + (typeof value) + ']'));
    };
    DefaultFilters.slice = function slice(value, start, length, preserve_keys) {
        if(RuntimeUtils.isArray(value)) {
            return (value).slice(start, start + length);
        }
        if(RuntimeUtils.isNumber(value)) {
            value = value.toString();
        }
        if(RuntimeUtils.isString(value)) {
            return (value).substr(start, length);
        }
        return value;
    };
    DefaultFilters.sort = function sort(value) {
        if(value instanceof Array) {
            return value.sort();
        }
        return value;
    };
    DefaultFilters.split = function split(_value, delimiter, limit) {
        var value = RuntimeUtils.toString(_value);
        return RuntimeUtils.split(value, delimiter, limit);
    };
    DefaultFilters.striptags = function striptags(value) {
        return RuntimeUtils.strip_tags(value);
    };
    DefaultFilters.title = function title(value) {
        return RuntimeUtils.title(value);
    };
    DefaultFilters.trim = function trim(value, characters) {
        return RuntimeUtils.trim(value, characters);
    };
    DefaultFilters.upper = function upper(value) {
        return String(value).toUpperCase();
    };
    DefaultFilters.url_encode = function url_encode(value) {
        return RuntimeUtils.escapeUrlString(String(value)).replace('%20', '+');
    };
    DefaultFilters.spaceless = function spaceless(value) {
        return RuntimeUtils.toString(value).replace(/>\s+</g, '><');
    };
    return DefaultFilters;
})();
exports.DefaultFilters = DefaultFilters;
