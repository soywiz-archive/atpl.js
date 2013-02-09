import DateFormat = module('./lib/DateFormat');
import Format = module('./lib/Format');
import _strtotime = module('./lib/strtotime');
import _strip_tags = module('./lib/strip_tags');
import util = module('util');

export function capitalize(str: string) {
	str = String(str);
	return str.charAt(0).toUpperCase() + str.substr(1);
}

export function title(str: string) {
	return String(str).replace(/\w+/g, (word) => {
		return capitalize(word);
	});
}

export function range(from: any, to: any, step: number = 1): any[] {
	if (isString(from) || isString(to)) {
		return rangeString(String(from), String(to), step);
	}
	return rangeNumbers(from, to, step);
}

export function strip_tags(input: string, allowed?: string): string {
	return _strip_tags.strip_tags(input, allowed);
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

export function strtotime(text: string, now?: any): any {
	return _strtotime.strtotime(text, now);
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
