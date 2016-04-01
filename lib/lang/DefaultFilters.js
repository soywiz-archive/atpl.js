"use strict";
var RuntimeContext_1 = require('../runtime/RuntimeContext');
var RuntimeUtils = require('../runtime/RuntimeUtils');
/**
 *
 */
var DefaultFilters = (function () {
    function DefaultFilters() {
    }
    /**
     * Filter that obtains the absolute value of a number.
     *
     * @param value Value
     *
     * @see http://twig.sensiolabs.org/doc/filters/abs.html
     */
    DefaultFilters.abs = function (value) {
        return Math.abs(value);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/batch.html
     */
    DefaultFilters.batch = function (_items, groupCount) {
        var items = RuntimeUtils.ensureArray(_items);
        var groupList = [];
        groupCount = RuntimeUtils.ensureNumber(groupCount);
        for (var n = 0; n < items.length; n += groupCount) {
            groupList.push(items.slice(n, n + groupCount));
        }
        return groupList;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/capitalize.html
     */
    DefaultFilters.capitalize = function (value) {
        return RuntimeUtils.capitalize(value);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/convert_encoding.html
     */
    DefaultFilters.convert_encoding = function (value, from, to) {
        throw new Error("Not implemented [no use on javascript that works with unicode]");
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/date.html
     */
    DefaultFilters.date = function (value, format, timezone) {
        return RuntimeUtils.date(format, value, timezone);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/date_modify.html
     */
    DefaultFilters.date_modify = function (value, modifier) {
        return RuntimeUtils.strtotime(modifier, value);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/default.html
     */
    DefaultFilters.$default = function (value, default_value) {
        return RuntimeUtils.$default(value, default_value);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/escape.html
     */
    DefaultFilters.e = function (value, strategy) {
        var runtimeContext = this;
        runtimeContext.currentAutoescape = strategy;
        return value;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/escape.html
     */
    DefaultFilters.escape = function (value, strategy) {
        if (strategy === void 0) { strategy = true; }
        var runtimeContext = this;
        runtimeContext.currentAutoescape = strategy;
        return value;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/format.html
     */
    DefaultFilters.format = function (format) {
        var parameters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parameters[_i - 1] = arguments[_i];
        }
        return RuntimeUtils.sprintf.apply(null, arguments);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/join.html
     */
    DefaultFilters.join = function (value, separator) {
        if (separator === void 0) { separator = ''; }
        if (!RuntimeUtils.defined(value))
            return '';
        if (value instanceof Array) {
            return value.join(separator);
        }
        else {
            return value;
        }
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/json_encode.html
     */
    DefaultFilters.json_encode = function (value) {
        //var runtimeContext: RuntimeContext.RuntimeContext = this;
        //runtimeContext.currentAutoescape = false;
        return RuntimeUtils.json_encode_circular(value);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/keys.html
     */
    DefaultFilters.keys = function (value) {
        if (!RuntimeUtils.defined(value))
            return [];
        if (RuntimeUtils.isString(value))
            return [];
        var keys = [];
        for (var key in value)
            keys.push(key);
        return keys;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/length.html
     */
    DefaultFilters.$length = function (value) {
        if (!RuntimeUtils.defined(value))
            return 0;
        return value.length;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/first.html
     */
    DefaultFilters.first = function (value) {
        if (!RuntimeUtils.defined(value))
            return undefined;
        if (RuntimeUtils.isArray(value))
            return value[0];
        if (RuntimeUtils.isString(value))
            return value.substr(0, 1);
        if (RuntimeUtils.isObject(value))
            for (var k in value)
                return value[k];
        return undefined;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/last.html
     */
    DefaultFilters.last = function (value) {
        if (!RuntimeUtils.defined(value))
            return undefined;
        if (RuntimeUtils.isArray(value))
            return value[value.length - 1];
        if (RuntimeUtils.isString(value))
            return value.substr(-1, 1);
        if (RuntimeUtils.isObject(value)) {
            var last;
            for (var k in value)
                last = value[k];
            return last;
        }
        return undefined;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/lower.html
     */
    DefaultFilters.lower = function (value) {
        return String(value).toLowerCase();
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/merge.html
     */
    DefaultFilters.merge = function (value, add) {
        if (RuntimeUtils.isArray(value)) {
            return value.concat(add);
        }
        else {
            var object = {};
            for (var key in value)
                object[key] = value[key];
            for (var key in add)
                object[key] = add[key];
            return object;
        }
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/nl2br.html
     */
    DefaultFilters.nl2br = function (value) {
        var runtimeContext = this;
        value = runtimeContext.getEscapedText(value);
        runtimeContext.currentAutoescape = false;
        return String(value).replace(/\n/g, '<br />\n');
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/number_format.html
     */
    DefaultFilters.number_format = function (value, decimal, decimal_point, decimal_sep) {
        if (decimal === void 0) { decimal = 0; }
        if (decimal_point === void 0) { decimal_point = '.'; }
        if (decimal_sep === void 0) { decimal_sep = ','; }
        return RuntimeUtils.number_format(value, decimal, decimal_point, decimal_sep);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/raw.html
     */
    DefaultFilters.raw = function (value) {
        var runtimeContext = this;
        runtimeContext.currentAutoescape = false;
        return value;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/replace.html
     */
    DefaultFilters.replace = function (value, replace_pairs) {
        return String(value).replace(new RegExp("(" + Object.keys(replace_pairs).map(function (item) { return RuntimeUtils.quoteRegExp(item); }).join('|') + ")", "g"), function (match) {
            return replace_pairs[match];
        });
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/reverse.html
     */
    DefaultFilters.reverse = function (value) {
        if (!RuntimeUtils.defined(value))
            return value;
        if (RuntimeUtils.isArray(value))
            return value.reverse();
        if (RuntimeUtils.isNumber(value))
            value = value.toString();
        if (RuntimeUtils.isString(value)) {
            var ret = '';
            for (var n = 0; n < value.length; n++)
                ret += value.charAt(value.length - n - 1);
            return ret;
        }
        //if (typeof value == 'string')
        throw (new Error("Not implemented filter [reverse] with value type [" + (typeof value) + ']'));
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/slice.html
     */
    DefaultFilters.slice = function (value, start, length, preserve_keys) {
        if (RuntimeUtils.isArray(value))
            return value.slice(start, start + length);
        if (RuntimeUtils.isNumber(value))
            value = value.toString();
        if (RuntimeUtils.isString(value))
            return value.substr(start, length);
        return value;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/sort.html
     */
    DefaultFilters.sort = function (value) {
        if (value instanceof Array)
            return value.sort();
        return value;
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/split.html
     */
    DefaultFilters.split = function (_value, delimiter, limit) {
        var value = RuntimeUtils.toString(_value);
        return RuntimeUtils.split(value, delimiter, limit);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/striptags.html
     */
    DefaultFilters.striptags = function (value) {
        return RuntimeUtils.strip_tags(value);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/title.html
     */
    DefaultFilters.title = function (value) {
        return RuntimeUtils.title(value);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/trim.html
     */
    DefaultFilters.trim = function (value, characters) {
        return RuntimeUtils.trim(value, characters);
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/upper.html
     */
    DefaultFilters.upper = function (value) {
        return String(value).toUpperCase();
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/url_encode.html
     */
    DefaultFilters.url_encode = function (value) {
        return RuntimeUtils.escapeUrlString(String(value)).replace('%20', '+');
    };
    /**
     *
     * @see http://twig.sensiolabs.org/doc/filters/spaceless.html
     */
    DefaultFilters.spaceless = function (value) {
        return RuntimeUtils.toString(value).replace(/>\s+</g, '><');
    };
    /**
     * @see http://twig.sensiolabs.org/doc/extensions/i18n.html
     */
    DefaultFilters.trans = function (value) {
        var runtimeContext = this;
        return runtimeContext.trans2(RuntimeContext_1.RuntimeContext.normalizeTrans(value), "", 1);
    };
    return DefaultFilters;
}());
exports.DefaultFilters = DefaultFilters;
