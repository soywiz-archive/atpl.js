var RuntimeUtils = require('../runtime/RuntimeUtils')
var DefaultFilters = (function () {
    function DefaultFilters() { }
    DefaultFilters.abs = /**
    * Filter that obtains the absolute value of a number.
    *
    * @see http://twig.sensiolabs.org/doc/filters/abs.html
    */
    function abs(value) {
        return Math.abs(value);
    };
    DefaultFilters.capitalize = // http://twig.sensiolabs.org/doc/filters/capitalize.html
    function capitalize(value) {
        return RuntimeUtils.capitalize(value);
    };
    DefaultFilters.convert_encoding = // http://twig.sensiolabs.org/doc/filters/convert_encoding.html
    function convert_encoding(value, from, to) {
        throw (new Error("Not implemented [no use on javascript that works with unicode]"));
    };
    DefaultFilters.date = // http://twig.sensiolabs.org/doc/filters/date.html
    function date(value, format, timezone) {
        return RuntimeUtils.date(format, value, timezone);
    };
    DefaultFilters.date_modify = // http://twig.sensiolabs.org/doc/filters/date_modify.html
    function date_modify(value, modifier) {
        throw (new Error("Not implemented filter [date_modify]"));
    };
    DefaultFilters.$default = // http://twig.sensiolabs.org/doc/filters/default.html
    function $default(value, default_value) {
        if(RuntimeUtils.empty(value)) {
            return default_value;
        }
        return value;
    };
    DefaultFilters.e = // http://twig.sensiolabs.org/doc/filters/escape.html
    function e(value, strategy) {
        this['currentAutoescape'] = strategy;
        return value;
    };
    DefaultFilters.escape = function escape(value, strategy) {
        if (typeof strategy === "undefined") { strategy = true; }
        this['currentAutoescape'] = strategy;
        return value;
    };
    DefaultFilters.format = // http://twig.sensiolabs.org/doc/filters/format.html
    function format(format) {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            parameters[_i] = arguments[_i + 1];
        }
        return RuntimeUtils.sprintf.apply(null, arguments);
    };
    DefaultFilters.join = // http://twig.sensiolabs.org/doc/filters/join.html
    function join(value, separator) {
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
    DefaultFilters.json_encode = // http://twig.sensiolabs.org/doc/filters/json_encode.html
    function json_encode(value) {
        return RuntimeUtils.json_encode_circular(value);
    };
    DefaultFilters.keys = // http://twig.sensiolabs.org/doc/filters/keys.html
    function keys(value) {
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
    DefaultFilters.$length = // http://twig.sensiolabs.org/doc/filters/length.html
    function $length(value) {
        if(!RuntimeUtils.defined(value)) {
            return 0;
        }
        return value.length;
    };
    DefaultFilters.lower = // http://twig.sensiolabs.org/doc/filters/lower.html
    function lower(value) {
        return String(value).toLowerCase();
    };
    DefaultFilters.merge = // http://twig.sensiolabs.org/doc/filters/merge.html
    function merge(value, add) {
        throw (new Error("Not implemented filter [merge]"));
    };
    DefaultFilters.nl2br = // http://twig.sensiolabs.org/doc/filters/nl2br.html
    function nl2br(value) {
        return String(value).replace(/\n/g, '<br />');
    };
    DefaultFilters.number_format = // http://twig.sensiolabs.org/doc/filters/number_format.html
    function number_format(value, decimal, decimal_point, decimal_sep) {
        if (typeof decimal === "undefined") { decimal = 0; }
        if (typeof decimal_point === "undefined") { decimal_point = '.'; }
        if (typeof decimal_sep === "undefined") { decimal_sep = ','; }
        throw (new Error("Not implemented filter [number_format]"));
    };
    DefaultFilters.raw = // http://twig.sensiolabs.org/doc/filters/raw.html
    function raw(value) {
        this['currentAutoescape'] = false;
        return value;
    };
    DefaultFilters.replace = // http://twig.sensiolabs.org/doc/filters/replace.html
    function replace(value, replace_pairs) {
        throw (new Error("Not implemented filter [replace]"));
    };
    DefaultFilters.reverse = // http://twig.sensiolabs.org/doc/filters/reverse.html
    function reverse(value) {
        if(!RuntimeUtils.defined(value)) {
            return value;
        }
        if(value instanceof Array) {
            return value.reverse();
        } else if(value instanceof String) {
            throw (new Error("Not implemented filter [reverse]"));
        }
    };
    DefaultFilters.slice = // http://twig.sensiolabs.org/doc/filters/slice.html
    function slice(value, start, length, preserve_keys) {
        if(value instanceof Array) {
            return value.slice(start, length);
        }
        if(value instanceof String) {
            return value.substr(start, length);
        }
        return value;
    };
    DefaultFilters.sort = // http://twig.sensiolabs.org/doc/filters/sort.html
    function sort(value) {
        if(value instanceof Array) {
            return value.sort();
        }
        return value;
    };
    DefaultFilters.split = // http://twig.sensiolabs.org/doc/filters/split.html
    function split(value, delimiter, limit) {
        throw (new Error("Not implemented filter [split]"));
    };
    DefaultFilters.strip_tags = // http://twig.sensiolabs.org/doc/filters/strip_tags.html
    function strip_tags(value) {
        throw (new Error("Not implemented filter [strip_tags]"));
    };
    DefaultFilters.title = // http://twig.sensiolabs.org/doc/filters/title.html
    function title(value) {
        return RuntimeUtils.title(value);
    };
    DefaultFilters.trim = // http://twig.sensiolabs.org/doc/filters/trim.html
    function trim(value, characters) {
        if(characters !== undefined) {
            throw (new Error("Not implemented filter [trim] with special characters"));
        }
        return String(value).trim();
    };
    DefaultFilters.upper = // http://twig.sensiolabs.org/doc/filters/upper.html
    function upper(value) {
        return String(value).toUpperCase();
    };
    DefaultFilters.url_encode = // http://twig.sensiolabs.org/doc/filters/url_encode.html
    function url_encode(value) {
        throw (new Error("Not implemented filter [url_encode]"));
    };
    return DefaultFilters;
})();
exports.DefaultFilters = DefaultFilters;
//@ sourceMappingURL=DefaultFilters.js.map
