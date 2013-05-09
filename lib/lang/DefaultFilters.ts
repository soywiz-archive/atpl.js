import RuntimeUtils = module('../runtime/RuntimeUtils');
import RuntimeContext = module('../runtime/RuntimeContext');

export class DefaultFilters {
	/**
	 * Filter that obtains the absolute value of a number.
	 *
	 * @param value Value
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/abs.html
	 */
	static abs(value: number) {
		return Math.abs(value);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/batch.html
	 */
	static batch(_items: any[], groupCount: number) {
		var items = RuntimeUtils.ensureArray(_items);
		var groupList = [];
		groupCount = RuntimeUtils.ensureNumber(groupCount);

		for (var n = 0; n < items.length; n += groupCount) {
			groupList.push(items.slice(n, n + groupCount));
		}

		return groupList;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/capitalize.html
	 */
	static capitalize(value: string) {
		return RuntimeUtils.capitalize(value);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/convert_encoding.html
	 */
	static convert_encoding(value: string, from: string, to: string) {
		throw (new Error("Not implemented [no use on javascript that works with unicode]"));
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/date.html
	 */
	static date(value: any, format?, timezone?) {
		return RuntimeUtils.date(format, value, timezone);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/date_modify.html
	 */
	static date_modify(value: any, modifier: any) {
		return RuntimeUtils.strtotime(modifier, value);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/default.html
	 */
	static $default(value: string, default_value: any) {
		return RuntimeUtils.$default(value, default_value);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/escape.html
	 */
	static e(value: string, strategy?: string) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		runtimeContext.currentAutoescape = strategy;
		return value;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/escape.html
	 */
	static escape(value: string, strategy: any = true) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		runtimeContext.currentAutoescape = strategy;
		return value;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/format.html
	 */
	static format(format: string, ...parameters: any[]) {
		return RuntimeUtils.sprintf.apply(null, arguments);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/join.html
	 */
	static join(value: any, separator: string = '') {
		if (!RuntimeUtils.defined(value)) return '';
		if (value instanceof Array) {
			return value.join(separator);
		} else {
			return value;
		}
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/json_encode.html
	 */
	static json_encode(value: any) {
		return RuntimeUtils.json_encode_circular(value);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/keys.html
	 */
	static keys(value: any) {
		if (!RuntimeUtils.defined(value)) return [];
		if (RuntimeUtils.isString(value)) return [];
		var keys = [];
		for (var key in value) keys.push(key);
		return keys;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/length.html
	 */
	static $length(value: any) {
		if (!RuntimeUtils.defined(value)) return 0;
		return value.length;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/first.html
	 */
	static first(value: any) {
		if (!RuntimeUtils.defined(value)) return undefined;
		if (RuntimeUtils.isArray(value)) return value[0];
		if (RuntimeUtils.isString(value)) return value.substr(0, 1);
		if (RuntimeUtils.isObject(value)) for (var k in value) return value[k];
		return undefined;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/last.html
	 */
	static last(value: any) {
		if (!RuntimeUtils.defined(value)) return undefined;
		if (RuntimeUtils.isArray(value)) return value[value.length - 1];
		if (RuntimeUtils.isString(value)) return value.substr(-1, 1);
		if (RuntimeUtils.isObject(value)) { var last; for (var k in value) last = value[k]; return last; }
		return undefined;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/lower.html
	 */
	static lower(value: any) {
		return String(value).toLowerCase();
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/merge.html
	 */
	static merge(value: any, add: any): any {
		if (RuntimeUtils.isArray(value)) {
			return (<any[]>value).concat(add);
		} else {
			var object = {};
			for (var key in value) object[key] = value[key];
			for (var key in add) object[key] = add[key];
			return object;
		}
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/nl2br.html
	 */
	static nl2br(value: any) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		value = runtimeContext.getEscapedText(value);
		runtimeContext.currentAutoescape = false;
		return String(value).replace(/\n/g, '<br />\n');
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/number_format.html
	 */
	static number_format(value: any, decimal: number = 0, decimal_point: string = '.', decimal_sep: string = ',') {
		return RuntimeUtils.number_format(value, decimal, decimal_point, decimal_sep);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/raw.html
	 */
	static raw(value: string) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		runtimeContext.currentAutoescape = false;
		return value;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/replace.html
	 */
	static replace(value: string, replace_pairs: any) {
		return String(value).replace(new RegExp("(" + Object.keys(replace_pairs).map(item => RuntimeUtils.quoteRegExp(item)).join('|') + ")", "g"), (match) => {
			return replace_pairs[match];
		});
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/reverse.html
	 */
	static reverse(value: any) {
		if (!RuntimeUtils.defined(value)) return value;
		if (RuntimeUtils.isArray(value)) return value.reverse();
		if (RuntimeUtils.isNumber(value)) value = value.toString();
		if (RuntimeUtils.isString(value)) {
			var ret = '';
			for (var n = 0; n < value.length; n++) ret += value.charAt(value.length - n - 1);
			return ret;
		}
		//if (typeof value == 'string')
		throw (new Error("Not implemented filter [reverse] with value type [" + (typeof value) + ']'));
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/slice.html
	 */
	static slice(value: any, start, length, preserve_keys?) {
		if (RuntimeUtils.isArray(value)) return (<any[]>value).slice(start, start + length);
		if (RuntimeUtils.isNumber(value)) value = value.toString();
		if (RuntimeUtils.isString(value)) return (<string>value).substr(start, length);
		return value;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/sort.html
	 */
	static sort(value: any) {
		if (value instanceof Array) return value.sort();
		return value;
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/split.html
	 */
	static split(_value: any, delimiter: string, limit: number) {
		var value = RuntimeUtils.toString(_value);
		return RuntimeUtils.split(value, delimiter, limit);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/striptags.html
	 */
	static striptags(value: any) {
		return RuntimeUtils.strip_tags(value);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/title.html
	 */
	static title(value: any) {
		return RuntimeUtils.title(value);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/trim.html
	 */
	static trim(value: any, characters?: string) {
		return RuntimeUtils.trim(value, characters);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/upper.html
	 */
	static upper(value: any) {
		return String(value).toUpperCase();
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/url_encode.html
	 */
	static url_encode(value: any) {
		return RuntimeUtils.escapeUrlString(String(value)).replace('%20', '+');
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/spaceless.html
	 */
	static spaceless(value: any) {
		return RuntimeUtils.toString(value).replace(/>\s+</g, '><');
	}
}
