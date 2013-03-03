import DateFormat = module('./lib/DateFormat');
import Format = module('./lib/Format');
import _strtotime = module('./lib/strtotime');
import util = module('util');
import utils = module('../utils');

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
	// http://kevin.vanzonneveld.net
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   improved by: Luke Godfrey
	// +      input by: Pul
	// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   bugfixed by: Onno Marsman
	// +      input by: Alex
	// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +      input by: Marc Palau
	// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +      input by: Brett Zamir (http://brett-zamir.me)
	// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   bugfixed by: Eric Nagel
	// +      input by: Bobby Drake
	// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   bugfixed by: Tomasz Wesolowski
	// +      input by: Evertjan Garretsen
	// +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
	// *     example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
	// *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
	// *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
	// *     returns 2: '<p>Kevin van Zonneveld</p>'
	// *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
	// *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
	// *     example 4: strip_tags('1 < 5 5 > 1');
	// *     returns 4: '1 < 5 5 > 1'
	// *     example 5: strip_tags('1 <br/> 1');
	// *     returns 5: '1  1'
	// *     example 6: strip_tags('1 <br/> 1', '<br>');
	// *     returns 6: '1  1'
	// *     example 7: strip_tags('1 <br/> 1', '<br><br/>');
	// *     returns 7: '1 <br/> 1'
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
	// http://kevin.vanzonneveld.net
	// +   original by: Brett Zamir (http://brett-zamir.me)
	// +      input by: travc
	// +      input by: Brett Zamir (http://brett-zamir.me)
	// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +      input by: Michael Grier
	// +   bugfixed by: Brett Zamir (http://brett-zamir.me)
	// +      input by: Ratheous
	// +      reimplemented by: Brett Zamir (http://brett-zamir.me)
	// +   bugfixed by: Joris
	// +      reimplemented by: Brett Zamir (http://brett-zamir.me)
	// %          note 1: This reflects PHP 5.3/6.0+ behavior
	// %        note 2: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
	// %        note 2: pages served as UTF-8
	// *     example 1: rawurlencode('Kevin van Zonneveld!');
	// *     returns 1: 'Kevin%20van%20Zonneveld%21'
	// *     example 2: rawurlencode('http://kevin.vanzonneveld.net/');
	// *     returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
	// *     example 3: rawurlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
	// *     returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'

	// Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
	// PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
	return encodeURIComponent(String(str))
		.replace(/!/g, '%21')
		.replace(/'/g, '%27')
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29')
		.replace(/\*/g, '%2A')
	;
}