import RuntimeUtils = module('../runtime/RuntimeUtils');
import utils = module('../utils');

export class DefaultFilters {
	/**
	 * Filter that obtains the absolute value of a number.
	 *
	 * @see http://twig.sensiolabs.org/doc/filters/abs.html
	 */
	static abs(value: number) {
		return Math.abs(value);
	}

	// http://twig.sensiolabs.org/doc/filters/capitalize.html
	static capitalize(value: string) {
		return RuntimeUtils.capitalize(value);
	}

	// http://twig.sensiolabs.org/doc/filters/convert_encoding.html
	static convert_encoding(value: string, from: string, to: string) {
		throw (new Error("Not implemented [no use on javascript that works with unicode]"));
	}

	// http://twig.sensiolabs.org/doc/filters/date.html
	static date(value: any, format?, timezone?) {
		return RuntimeUtils.date(format, value, timezone);
	}

	// http://twig.sensiolabs.org/doc/filters/date_modify.html
	static date_modify(value: any, modifier: any) {
		return RuntimeUtils.strtotime(modifier, value);
	}

	// http://twig.sensiolabs.org/doc/filters/default.html
	static $default(value: string, default_value: any) {
		return RuntimeUtils.$default(value, default_value);
	}

	// http://twig.sensiolabs.org/doc/filters/escape.html
	static e(value: string, strategy?: string) {
		this['currentAutoescape'] = strategy;
		return value;
	}
	static escape(value: string, strategy: any = true) {
		this['currentAutoescape'] = strategy;
		return value;
	}

	// http://twig.sensiolabs.org/doc/filters/format.html
	static format(format: string, ...parameters: any[]) {
		return RuntimeUtils.sprintf.apply(null, arguments);
	}

	// http://twig.sensiolabs.org/doc/filters/join.html
	static join(value: any, separator: string = '') {
		if (!RuntimeUtils.defined(value)) return '';
		if (value instanceof Array) {
			return value.join(separator);
		} else {
			return value;
		}
	}

	// http://twig.sensiolabs.org/doc/filters/json_encode.html
	static json_encode(value: any) {
		return RuntimeUtils.json_encode_circular(value);
	}

	// http://twig.sensiolabs.org/doc/filters/keys.html
	static keys(value: any) {
		if (!RuntimeUtils.defined(value)) return [];
		if (RuntimeUtils.isString(value)) return [];
		var keys = [];
		for (var key in value) keys.push(key);
		return keys;
	}

	// http://twig.sensiolabs.org/doc/filters/length.html
	static $length(value: any) {
		if (!RuntimeUtils.defined(value)) return 0;
		return value.length;
	}

	// http://twig.sensiolabs.org/doc/filters/first.html
	static first(value: any) {
		if (!RuntimeUtils.defined(value)) return undefined;
		if (RuntimeUtils.isArray(value)) return value[0];
		if (RuntimeUtils.isString(value)) return value.substr(0, 1);
		if (RuntimeUtils.isObject(value)) for (var k in value) return value[k];
		return undefined;
	}

	// http://twig.sensiolabs.org/doc/filters/last.html
	static last(value: any) {
		if (!RuntimeUtils.defined(value)) return undefined;
		if (RuntimeUtils.isArray(value)) return value[value.length - 1];
		if (RuntimeUtils.isString(value)) return value.substr(-1, 1);
		if (RuntimeUtils.isObject(value)) { var last; for (var k in value) last = value[k]; return last; }
		return undefined;
	}

	// http://twig.sensiolabs.org/doc/filters/lower.html
	static lower(value: any) {
		return String(value).toLowerCase();
	}

	// http://twig.sensiolabs.org/doc/filters/merge.html
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

	// http://twig.sensiolabs.org/doc/filters/nl2br.html
	static nl2br(value: any) {
		return String(value).replace(/\n/g, '<br />');
	}

	// http://twig.sensiolabs.org/doc/filters/number_format.html
	static number_format(value: any, decimal: number = 0, decimal_point: string = '.', decimal_sep: string = ',') {
		var precision = Math.pow(10, decimal);
		var zeroPad = (decimal > 0) ? Array(decimal - 1).join('0') : '';
		value = Math.round(value * precision) / precision;
		//console.log('***************');
		//console.log(value);
		var valueString = String(value);
		var partsString = valueString.split('.');
		var integerString = String(partsString[0]);
		var decimalString = String((partsString.length >= 2) ? partsString[1] : '0');
		var paddedDecimalString = (decimalString + zeroPad).substr(0, decimal);
		var outputString = '';
		//console.log(integerString);
		for (var n = integerString.length; n >= 0; n -= 3) {
			//console.log(n);
			if (n - 3 < 0) {
				//console.log('  ' + (3 + (n - 3)));
				outputString = integerString.substr(0, 3 + (n - 3)) + outputString;
			} else {
				outputString = integerString.substr(n - 3, 3) + outputString;
			}
			if (n - 3 > 0) outputString = decimal_sep + outputString;
		}
		if (decimal > 0) {
			outputString += decimal_point + paddedDecimalString;
		}
		return outputString;
	}

	// http://twig.sensiolabs.org/doc/filters/raw.html
	static raw(value: string) {
		this['currentAutoescape'] = false;
		return value;
	}

	// http://twig.sensiolabs.org/doc/filters/replace.html
	static replace(value: string, replace_pairs: any) {
		throw (new Error("Not implemented filter [replace]"));
	}

	// http://twig.sensiolabs.org/doc/filters/reverse.html
	static reverse(value: any) {
		if (!RuntimeUtils.defined(value)) return value;
		if (value instanceof Array) return value.reverse();
		if (RuntimeUtils.isNumber(value)) value = value.toString();
		if (RuntimeUtils.isString(value)) {
			var ret = '';
			for (var n = 0; n < value.length; n++) ret += value.charAt(value.length - n - 1);
			return ret;
		}
		//if (typeof value == 'string')
		throw (new Error("Not implemented filter [reverse] with value type [" + (typeof value) + ']'));
	}

	// http://twig.sensiolabs.org/doc/filters/slice.html
	static slice(value: any, start, length, preserve_keys?) {
		if (RuntimeUtils.isArray(value)) return (<any[]>value).slice(start, start + length);
		if (RuntimeUtils.isNumber(value)) value = value.toString();
		if (RuntimeUtils.isString(value)) return (<string>value).substr(start, length);
		return value;
	}

	// http://twig.sensiolabs.org/doc/filters/sort.html
	static sort(value: any) {
		if (value instanceof Array) return value.sort();
		return value;
	}

	// http://twig.sensiolabs.org/doc/filters/split.html
	static split(_value: any, delimiter: string, limit: number) {
		var value = RuntimeUtils.toString(_value);
		return RuntimeUtils.split(value, delimiter, limit);
	}

	// http://twig.sensiolabs.org/doc/filters/striptags.html
	static striptags(value: any) {
		return RuntimeUtils.strip_tags(value);
	}

	// http://twig.sensiolabs.org/doc/filters/title.html
	static title(value: any) {
		return RuntimeUtils.title(value);
	}

	// http://twig.sensiolabs.org/doc/filters/trim.html
	static trim(value: any, characters?: string) {
		if (characters !== undefined) {
			var regExpQuoted = '[' + utils.quoteRegExp(characters) + ']';
			var regExpStart = new RegExp('^' + regExpQuoted + '+', '');
			var regExpEnd = new RegExp('' + regExpQuoted + '+$', '');
			return String(value)
				.replace(regExpStart, '')
				.replace(regExpEnd, '')
			;
		} else {
			return String(value).trim();
		}
	}

	// http://twig.sensiolabs.org/doc/filters/upper.html
	static upper(value: any) {
		return String(value).toUpperCase();
	}

	// http://twig.sensiolabs.org/doc/filters/url_encode.html
	static url_encode(value: any) {
		throw (new Error("Not implemented filter [url_encode]"));
	}

	static spaceless(value: any) {
		return RuntimeUtils.toString(value).replace(/>\s+</g, '><');
	}
}
