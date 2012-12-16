var RuntimeUtils = require('../runtime/RuntimeUtils')
var DefaultFilters = (function () {
    function DefaultFilters() { }
    DefaultFilters.abs = function abs(value) {
        return Math.abs(value);
    }
    DefaultFilters.capitalize = function capitalize(value) {
        return RuntimeUtils.capitalize(value);
    }
    DefaultFilters.convert_encoding = function convert_encoding(value, from, to) {
        throw (new Error("Not implemented [no use on javascript that works with unicode]"));
    }
    DefaultFilters.date = function date(value, format, timezone) {
        throw (new Error("Not implemented filter [date]"));
    }
    DefaultFilters.date_modify = function date_modify(value, modifier) {
        throw (new Error("Not implemented filter [date_modify]"));
    }
    DefaultFilters.$default = function $default(value, default_value) {
        if(value === null || value === undefined) {
            return default_value;
        }
        return value;
    }
    DefaultFilters.e = function e(value, strategy, charset) {
        return DefaultFilters.escape(value, strategy, charset);
    }
    DefaultFilters.escape = function escape(value, strategy, charset) {
        if (typeof strategy === "undefined") { strategy = true; }
        if (typeof charset === "undefined") { charset = 'utf-8'; }
        this['currentAutoescape'] = strategy;
        return value;
    }
    DefaultFilters.format = function format(format) {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            parameters[_i] = arguments[_i + 1];
        }
        throw (new Error("Not implemented filter [format]"));
    }
    DefaultFilters.join = function join(value, separator) {
        if (typeof separator === "undefined") { separator = ''; }
        if(value === null || value === undefined) {
            return '';
        }
        if(value instanceof Array) {
            return value.join(separator);
        } else {
            return value;
        }
    }
    DefaultFilters.json_encode = function json_encode(value) {
        return JSON.stringify(value);
    }
    DefaultFilters.keys = function keys(value) {
        var keys = [];
        for(var key in value) {
            keys.push(key);
        }
        return keys;
    }
    DefaultFilters.length = function length(value) {
        if(value === null || value === undefined) {
            return 0;
        }
        return value.length;
    }
    DefaultFilters.lower = function lower(value) {
        return String(DefaultFilters.lower).toLowerCase();
    }
    DefaultFilters.merge = function merge(value, add) {
        throw (new Error("Not implemented filter [merge]"));
    }
    DefaultFilters.nl2br = function nl2br(value) {
        return String(value).replace(/\n/g, '<br />');
    }
    DefaultFilters.number_format = function number_format(value, decimal, decimal_point, decimal_sep) {
        if (typeof decimal === "undefined") { decimal = 0; }
        if (typeof decimal_point === "undefined") { decimal_point = '.'; }
        if (typeof decimal_sep === "undefined") { decimal_sep = ','; }
        throw (new Error("Not implemented filter [number_format]"));
    }
    DefaultFilters.raw = function raw(value) {
        this['currentAutoescape'] = false;
        return value;
    }
    DefaultFilters.replace = function replace(value, replace_pairs) {
        throw (new Error("Not implemented filter [replace]"));
    }
    DefaultFilters.reverse = function reverse(value) {
        if(value !== undefined && value !== null) {
            if(value instanceof Array) {
                return value.reverse();
            } else {
                if(value instanceof String) {
                    throw (new Error("Not implemented filter [reverse]"));
                }
            }
        }
        return value;
    }
    DefaultFilters.slice = function slice(value, start, length, preserve_keys) {
        if(value instanceof Array) {
            return value.slice(start, length);
        }
        if(value instanceof String) {
            return value.substr(start, length);
        }
        return value;
    }
    DefaultFilters.sort = function sort(value) {
        if(value instanceof Array) {
            return value.sort();
        }
        return value;
    }
    DefaultFilters.split = function split(value, delimiter, limit) {
        throw (new Error("Not implemented filter [split]"));
    }
    DefaultFilters.strip_tags = function strip_tags(value) {
        throw (new Error("Not implemented filter [strip_tags]"));
    }
    DefaultFilters.title = function title(value) {
        return RuntimeUtils.title(value);
    }
    DefaultFilters.trim = function trim(value, characters) {
        if(characters !== undefined) {
            throw (new Error("Not implemented filter [trim] with special characters"));
        }
        return String(value).trim();
    }
    DefaultFilters.upper = function upper(value) {
        return String(DefaultFilters.upper).toUpperCase();
    }
    DefaultFilters.url_encode = function url_encode(value) {
        throw (new Error("Not implemented filter [url_encode]"));
    }
    return DefaultFilters;
})();
exports.DefaultFilters = DefaultFilters;
