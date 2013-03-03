import DateFormat = module('./lib/DateFormat');
import Format = module('./lib/Format');
import util = module('util');

export function normalizePath(path) {
	var components = [];
	var notNormalizedComponents = path.split(/[\\\/]/g);
	path = path.replace(/\\/g, '/');
	for (var index in notNormalizedComponents) {
		var component = notNormalizedComponents[index];
		switch (component) {
			case '':
				break;
			case '.':
				break;
			case '..':
				if (components.length > 0) components.pop();
				break;
			default:
				components.push(component);
				break;
		}
	}
	var retval = components.join('/');
	if (path.match(/^\//)) {
		retval = '/' + retval;
	}
	return retval;
}

export function quoteRegExp(str: string): string {
	return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

export function pathIsInside(basePath, path) {
	basePath = normalizePath(basePath) + '/';
	path = normalizePath(path) + '/';

	return (path.substr(0, basePath.length) == basePath);
}

export function interpretNumber(number, radix?) {
	number = String(number);
	if (number == '0') return 0;
	if (radix === undefined) {
		if (number.substr(0, 2).toLowerCase() == '0x') return interpretNumber(number.substr(2), 16);
		if (number.substr(0, 2).toLowerCase() == '0b') return interpretNumber(number.substr(2), 2);
		if (number.substr(0, 1) == '0') return interpretNumber(number.substr(1), 8);
		radix = 10;
	}
	if (radix == 10) return parseFloat(number);
	return parseInt(number, radix);
}

export function ensureArray(value: any): any[] {
	if (isArray(value)) return value;
	return [value];
}

export function ensureNumber(value: any) {
	if (isNumber(value)) return value;
	return parseFloat(String(value));
}

export function capitalize(str: string) {
	str = String(str);
	return str.charAt(0).toUpperCase() + str.substr(1);
}

export function title(str: string) {
	return String(str).replace(/\w+/g, (word) => {
		return capitalize(word);
	});
}

export function trim(value: any, characters?: string) {
	if (characters !== undefined) {
		var regExpQuoted = '[' + quoteRegExp(characters) + ']';
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

export function number_format(value: any, decimal: number = 0, decimal_point: string = '.', decimal_sep: string = ',') {
	var precision = Math.pow(10, decimal);
	var zeroPad = (decimal > 0) ? Array(decimal + 1).join('0') : '';
	value = ensureNumber(value);
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

export function range(from: any, to: any, step: number = 1): any[] {
	if (isString(from) || isString(to)) {
		return rangeString(String(from), String(to), step);
	}
	return rangeNumbers(from, to, step);
}

export function strip_tags(input: string, allowed?: string): string {
	allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
	  commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
}

export function split(value: string, delimiter: string, limit?: number): string[]{
	if (delimiter == '') {
		if (limit === undefined) limit = 1;
		var ret = [];
		for (var n = 0; n < value.length; n += limit) ret.push(value.substr(n, limit));
		return ret;
	} else {
		if (limit === undefined) limit = 9999999999;
		var extraArray = value.split(delimiter).slice(limit - 1);
		var parts = value.split(delimiter, limit - 1);
		if (extraArray.length) parts.push(extraArray.join(delimiter));
		return parts;
	}
}

export function strtotime(text: any, now?: any): any {
	if (!text) return null;

	if (text instanceof Date) return text;

	text = String(text);

	// Unecessary spaces
	text = text.trim()
		.replace(/\s{2,}/g, ' ')
		.replace(/[\t\r\n]/g, '')
		.toLowerCase();

	var parse;
	var parsed;
	var match;

	var date;
	if (now instanceof Date) {
		date = now;
	} else if (now) {
		date = new Date(now * 1000);
	} else {
		date = new Date();
	}

	if (match = text.match(/^now\s*/i)) {
		text = text.substr(match[0].length);
		date = new Date();
	}

	if (!isNaN(parse = Date.parse(text))) {
		date = new Date(parse);
		text = '';
	}

	if (match = text.match(/^(\d{2,4})-(\d{2})-(\d{2})(?:\s(\d{1,2}):(\d{2})(?::\d{2})?)?(?:\.(\d+)?)?/)) {
		text = text.substr(match[0].length);
		var year = (<any>match[1] >= 0 && <any>match[1] <= 69) ? <any>(+match[1] + 2000) : <any>(match[1]);
		date = new Date(
			year,
			parseInt(match[2], 10) - 1,
			(<any>match[3]),
			(<any>match[4]) || 0,
			(<any>match[5]) || 0,
			(<any>match[6]) || 0,
			(<any>match[7]) || 0
		);
	}

	var days = { 'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6 };
	var ranges = { 'yea': 'FullYear', 'mon': 'Month', 'day': 'Date', 'hou': 'Hours', 'min': 'Minutes', 'sec': 'Seconds' };

	function lastNext(type, range, modifier) {
		var day = days[range];

		if (typeof (day) !== 'undefined') {
			var diff = day - date.getDay();

			if (diff === 0) diff = 7 * modifier;
			else if (diff > 0 && type === 'last') diff -= 7;
			else if (diff < 0 && type === 'next') diff += 7;

			date.setDate(date.getDate() + diff);
		}
	}
	function process(val: string) {
		//console.log(val);
		var split = val.match(/^([+-]?\d+)\s*(\w+)$/);
		var type = split[1];
		var range = split[2].substring(0, 3);
		var typeIsNumber = /\d+/.test(type);

		var ago = split[2] === 'ago';
		var num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);

		if (typeIsNumber)
			num *= parseInt(type, 10);

		if (ranges.hasOwnProperty(range))
			return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
		else if (range === 'wee')
			return date.setDate(date.getDate() + (num * 7));

		if (type === 'next' || type === 'last')
			lastNext(type, range, num);
		else if (!typeIsNumber)
			return false;

		return true;
	}

	var regex = '([+-]?\\d+\\s*' +
		'(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' +
		'|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' +
		'|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)|(last|next)\\s' +
		'(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' +
		'|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' +
		'|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))(\\sago)?';

	if (text.length > 0) {
		match = text.match(new RegExp(regex, 'gi'));
		if (!match)
			return false;

		for (var i = 0, len = match.length; i < len; i++)
			if (!process(match[i]))
				return false;

		// ECMAScript 5 only
		//if (!match.every(process))
		//	return false;
	}

	return (date.getTime() / 1000);
}

export function rangeNumbers(from: any, to: any, step: any = 1): number[] {
	var out = [];
	from = parseInt(from);
	to = parseInt(to);
	step = parseInt(step);
	if (step == 0) step = 1;
	while (from <= to) {
		//console.log(from + "/" + to + "/" + step);
		out.push(from);
		from += step;
	}
	return out;
}

export function rangeString(from: string, to: string, step: number = 1): string[] {
	return rangeNumbers(String(from).charCodeAt(0), String(to).charCodeAt(0), step).map((value, index, array) => {
		return '' + String.fromCharCode(value);
	});
}

export function random(min: number = 0, max: number = 2147483647): number {
	min = Math.round(min);
	max = Math.round(max);
	return Math.round(Math.random() * (max - min)) + min;
}

export function sprintf(..._arguments: any[]) {
	return Format.sprintf.apply(null, arguments);
}

export function date(format: string, date?: any, timezone?) {
	if (date === undefined) date = new Date();
	if (!(date instanceof Date)) {
		// Number (unix timestamp?)
		date = new Date(date * 1000);
	}
	return DateFormat.date(date, format);
}

export function defined(value: any) {
	return (value !== null) && (value !== undefined);
}

export function $default(value: any, default_value: any) {
	if (value === undefined || value === null) return default_value;
	return value;
}

export function empty(value: any) {
	if (value === null || value === undefined || value === false) return true;
	if (isArray(value) || isString(value)) return (value.length == 0);
	return false;
}

export function isNumber(obj: any): bool {
	return typeof obj == 'number';
}

export function toString(obj: any): string {
	if (!defined(obj)) return '';
	return '' + obj;
}

export function isString(obj: any): bool {
	return typeof obj == 'string';
}

export function isArray(obj: any): bool {
	if (!defined(obj)) return false;
	return obj instanceof Array;
}

export function isObject(obj: any): bool {
	return typeof obj === 'object';
}

export function inspect_json(obj) {
	return util.inspect(obj, false, null, false);
}

export function json_encode_circular(obj, already_encoded: any[] = undefined) {
	if (already_encoded === undefined) already_encoded = [];
	if (already_encoded.indexOf(obj) != -1) return 'null';
	var ret = '';
	if (isArray(obj)) {
		already_encoded.push(obj);
		for (var n = 0; n < obj.length; n++) {
			if (n != 0) ret += ',';
			ret += json_encode_circular(obj[n], already_encoded);
		}
		ret = '[' + ret + ']';
	} else if (isObject(obj)) {
		already_encoded.push(obj);
		for (var key in obj) {
			if (ret.length != 0) ret += ',';
			ret += JSON.stringify(key) + ':' + json_encode_circular(obj[key], already_encoded);
		}
		ret = '{' + ret + '}';
	} else {
		ret = JSON.stringify(obj);
	}
	return ret;
}

export function escapeHtmlEntities(text: string) {
	return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function escapeHtmlAttribute(text: string) {
	return String(text).replace(/[^a-zA-Z0-9,\.\-_]/g, (match) => {
		var chr = match;
		var ord = match.charCodeAt(0);
		if ((ord <= 0x1f && chr != "\t" && chr != "\n" && chr != "\r") || (ord >= 0x7f && ord <= 0x9f)) {
			return '&#xFFFD;';
		}
		switch (ord) {
			case 34: return '&quot;'; // quotation mark
			case 38: return '&amp;';  // ampersand
			case 60: return '&lt;';   // less-than sign
			case 62: return '&gt;';   // greater-than sign
		}
		return '&#x' + (('0000' + ord.toString(16)).substr((ord < 0x100) ? -2 : -4)) + ';';
	});
}

export function escapeJsString(text: string) {
	return text.replace(/\W/g, (match) => {
		switch (match) {
			case '\'': return '\\\'';
			case '"': return '\\\"';
			case ' ': return ' ';
			case "\n": return '\\n';
			case "\r": return '\\r';
			case "\t": return '\\t';
			default:
				var charCode = match.charCodeAt(0);
				//if (charCode <= 0xFF) return '\\x' + charCode.toString(16);
				var retCode = charCode.toString(16);
				while (retCode.length < 4) retCode = '0' + retCode;
				return '\\u' + retCode;
			break;
		}
	});
}

export function escapeCssString(text: string) {
	return text.replace(/\W/g, (match) => {
		return '\\' + match.charCodeAt(0).toString(16).toUpperCase() + ' ';
	});
}

// rawurlencode
export function escapeUrlString(str: string) {
	return encodeURIComponent(String(str)).replace(/[!'\(\)\*]/g, (match) => { return '%' + (('00' + match.charCodeAt(0).toString(16)).substr(-2)); });
}
