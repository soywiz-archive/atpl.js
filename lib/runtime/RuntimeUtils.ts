import util = require('util');

export function inspect(object: any, showHidden?: boolean, depth?: number, color?: boolean): string {
     return util.inspect(object, showHidden, depth, color);
}

export function normalizePath(path:string) {
	var components:string[] = [];
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

export function pathIsInside(basePath:string, path:string) {
	basePath = normalizePath(basePath) + '/';
	path = normalizePath(path) + '/';

	return (path.substr(0, basePath.length) == basePath);
}

export function interpretNumber(number:string, radix?:number):number {
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
		var ret:string[] = [];
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

export function strtotime(_text: string|Date, now?: Date|number): any {
	if (!_text) return null;

	if (_text instanceof Date) return _text;

	var text = String(_text);

	// Unecessary spaces
	text = text.trim()
		.replace(/\s{2,}/g, ' ')
		.replace(/[\t\r\n]/g, '')
		.toLowerCase();

	var parse:number;
	//var parsed: any;
	var match:RegExpMatchArray;

	var date:Date;
	if (now instanceof Date) {
		date = now;
	} else if (now) {
		date = new Date(<number>now * 1000);
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

	var days: { [key:string]:number; } = { 'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6 };
	var ranges: { [key:string]:any; } = { 'yea': 'FullYear', 'mon': 'Month', 'day': 'Date', 'hou': 'Hours', 'min': 'Minutes', 'sec': 'Seconds' };

	function lastNext(type:string, range:string, modifier:number) {
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

		if (ranges.hasOwnProperty(range)) {
			return (<any>date)['set' + ranges[range]](
				((<any>date)['get' + ranges[range]])() + num
			);
		} else if (range === 'wee') {
			return date.setDate(date.getDate() + (num * 7));
		}

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
	var out:number[] = [];
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

export var __sprintf = (function () {
	function get_type(variable: any) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
	}
	function str_repeat(input: any, multiplier: number) {
		for (var output: any[] = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */ }
		return output.join('');
	}

	var str_format:any = function () {
		if (!str_format.cache.hasOwnProperty(arguments[0])) {
			str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
		}
		return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
	};

	str_format.format = function (parse_tree:any, argv:any) {
		var cursor = 1, tree_length = parse_tree.length, node_type:string = '', arg: any, output:any = [];
		var i:any, k:any, match:any, pad:any, pad_character:any, pad_length:any;
		
		for (i = 0; i < tree_length; i++) {
			node_type = get_type(parse_tree[i]);
			if (node_type === 'string') {
				output.push(parse_tree[i]);
			}
			else if (node_type === 'array') {
				match = parse_tree[i]; // convenience purposes only
				if (match[2]) { // keyword argument
					arg = argv[cursor];
					for (k = 0; k < match[2].length; k++) {
						if (!arg.hasOwnProperty(match[2][k])) {
							throw (sprintf('[sprintf] property "%s" does not exist', match[2][k]));
						}
						arg = arg[match[2][k]];
					}
				}
				else if (match[1]) { // positional argument (explicit)
					arg = argv[match[1]];
				}
				else { // positional argument (implicit)
					arg = argv[cursor++];
				}

				if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
					throw (sprintf('[sprintf] expecting number but found %s', get_type(arg)));
				}
				switch (match[8]) {
					case 'b': arg = arg.toString(2); break;
					case 'c': arg = String.fromCharCode(arg); break;
					case 'd': arg = parseInt(arg, 10); break;
					case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
					case 'f': arg = match[7] ? parseInt(parseFloat(arg).toFixed(match[7])) : parseFloat(arg); break;
					case 'o': arg = arg.toString(8); break;
					case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
					case 'u': arg = Math.abs(arg); break;
					case 'x': arg = arg.toString(16); break;
					case 'X': arg = arg.toString(16).toUpperCase(); break;
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

	str_format.cache = {};

	str_format.parse = function (fmt:string) {
		var _fmt = fmt, match: any = [], parse_tree:string[] = [], arg_names = 0, field_match: any;
		while (_fmt) {
			if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
				parse_tree.push(match[0]);
			}
			else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
				parse_tree.push('%');
			}
			else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
				if (match[2]) {
					arg_names |= 1;
					var field_list:string[] = [];
					var replacement_field = match[2];
					var field_match:any = [];
					if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
						field_list.push(field_match[1]);
						while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
							if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
								field_list.push(field_match[1]);
							}
							else {
								throw ('[sprintf] huh?');
							}
						}
					}
					else {
						throw ('[sprintf] huh?');
					}
					match[2] = field_list;
				}
				else {
					arg_names |= 2;
				}
				if (arg_names === 3) {
					throw ('[sprintf] mixing positional and named placeholders is not (yet) supported');
				}
				parse_tree.push(match);
			}
			else {
				throw ('[sprintf] huh?');
			}
			_fmt = _fmt.substring(match[0].length);
		}
		return parse_tree;
	};

	return str_format;
})();

export function sprintf(..._arguments: any[]) {
	return __sprintf.apply(null, arguments);
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

export function isNumber(obj: any): boolean {
	return typeof obj == 'number';
}

export function toString(obj: any): string {
	if (!defined(obj)) return '';
	return '' + obj;
}

export function isString(obj: any): boolean {
	return typeof obj == 'string';
}

export function isArray(obj: any): boolean {
	if (!defined(obj)) return false;
	return obj instanceof Array;
}

export function isObject(obj: any): boolean {
	return typeof obj === 'object';
}

export function inspect_json(obj:any) {
	return util.inspect(obj, false, null, false);
}

export function json_encode_circular(obj:any, already_encoded: any[] = undefined) {
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

export function getOrdinalFor(intNum:number) {
	return (((intNum = Math.abs(intNum) % 100) % 10 == 1 && intNum != 11) ? "st"
            : (intNum % 10 == 2 && intNum != 12) ? "nd" : (intNum % 10 == 3
            && intNum != 13) ? "rd" : "th");
}
export function getISO8601Year(aDate:any) {
	var d: any = new Date(aDate.getFullYear() + 1, 0, 4);
	if ((d - aDate) / 86400000 < 7 && (aDate.getDay() + 6) % 7 < (d.getDay() + 6) % 7)
		return d.getFullYear();
	if (aDate.getMonth() > 0 || aDate.getDate() >= 4)
		return aDate.getFullYear();
	return aDate.getFullYear() - (((aDate.getDay() + 6) % 7 - aDate.getDate() > 2) ? 1 : 0);
}
export function getISO8601Week(aDate:any) {
	// Get a day during the first week of the year.
	var d:any = new Date(getISO8601Year(aDate), 0, 4);
	// Get the first monday of the year.
	d.setDate(d.getDate() - (d.getDay() + 6) % 7);
	return Math.floor((aDate - d) / 604800000) + 1;
}

var date_shortDays = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
var date_fullDays = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
var date_shortMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
var date_fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");

export function date(format:any, date:any, timezone?:any) {
	if (date === undefined) date = new Date();
	if (!(date instanceof Date)) {
		// Number (unix timestamp?)
		date = new Date(date * 1000);
	}

	if (typeof format !== "string" || /^\s*$/.test(format))
		return date + "";
	var jan1st: any = new Date(date.getFullYear(), 0, 1);
	var me: any = date;
	return format.replace(/[dDjlNSwzWFmMntLoYyaABgGhHisu]/g, (option:string):any => {
		switch (option) {
			case "d": return ("0" + me.getDate()).replace(/^.+(..)$/, "$1"); // Day of the month, 2 digits with leading zeros
			case "D": return date_shortDays[me.getDay()]; // A textual representation of a day, three letters
			case "j": return me.getDate(); // Day of the month without leading zeros
			case "l": return date_fullDays[me.getDay()]; // A full textual representation of the day of the week
			case "N": return (me.getDay() + 6) % 7 + 1; // ISO-8601 numeric representation of the day of the week
			case "S": return getOrdinalFor(me.getDate()); // English ordinal suffix for the day of the month, 2 characters
			case "w": return me.getDay(); // Numeric representation of the day of the week
			case "z": return Math.ceil((jan1st - me) / 86400000); // The day of the year (starting from 0)
			case "W": return ("0" + getISO8601Week(me)).replace(/^.(..)$/, "$1"); // ISO-8601 week number of year, weeks starting on Monday
			case "F": return date_fullMonths[me.getMonth()]; // A full textual representation of a month, such as January or March
			case "m": return ("0" + (me.getMonth() + 1)).replace(/^.+(..)$/, "$1"); // Numeric representation of a month, with leading zeros
			case "M": return date_shortMonths[me.getMonth()]; // A short textual representation of a month, three letters
			case "n": return me.getMonth() + 1; // Numeric representation of a month, without leading zeros
			case "t": return new Date(me.getFullYear(), me.getMonth() + 1, -1).getDate(); // Number of days in the given month
			case "L": return new Date(me.getFullYear(), 1, 29).getDate() == 29 ? 1 : 0;// Whether it's a leap year
			// ISO-8601 year number. This has the same value as Y, except that if the
			// ISO week number (W) belongs to the previous or next year, that year is
			// used instead.
			case "o": return getISO8601Year(me);
			case "Y": return me.getFullYear(); // A full numeric representation of a year, 4 digits
			case "y": return (me.getFullYear() + "").replace(/^.+(..)$/, "$1"); // A two digit representation of a year
			case "a": return me.getHours() < 12 ? "am" : "pm"; // Lowercase Ante meridiem and Post meridiem
			case "A": return me.getHours() < 12 ? "AM" : "PM"; // Uppercase Ante meridiem and Post meridiem
			case "B": return Math.floor((((me.getUTCHours() + 1) % 24) + me.getUTCMinutes() / 60 + me.getUTCSeconds() / 3600) * 1000 / 24); // Swatch Internet time
			case "g": return me.getHours() % 12 != 0 ? me.getHours() % 12 : 12; // 12-hour format of an hour without leading zeros
			case "G": return me.getHours(); // 24-hour format of an hour without leading zeros
			case "h": return ("0" + (me.getHours() % 12 != 0 ? me.getHours() % 12 : 12)).replace(/^.+(..)$/, "$1"); // 12-hour format of an hour with leading zeros
			case "H": return ("0" + me.getHours()).replace(/^.+(..)$/, "$1"); // 24-hour format of an hour with leading zeros
			case "i": return ("0" + me.getMinutes()).replace(/^.+(..)$/, "$1"); // Minutes with leading zeros
			case "s": return ("0" + me.getSeconds()).replace(/^.+(..)$/, "$1"); // Seconds, with leading zeros
			case "u": return me.getMilliseconds(); // Milliseconds
			default: return "";
		}
	});
}

export function inArray(value: any, array: any) {
	if (array instanceof Array) return array.indexOf(value) != -1;
	if (isString(value) && isString(array)) {
		return (<string>array).indexOf(<string>value) != -1;
	}
	return false;
}

export function getFunctionParameterNames(func: Function): string[] {
	var funStr = func.toString();
	return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}

export function callFunctionWithNamedArguments($context: any, $function: Function, $arguments: any[], $namedArguments: string[]) {
	if ($namedArguments !== null && $namedArguments !== undefined) {
		var argumentNames = getFunctionParameterNames($function);
		var namedPairs:{ [name:string]:string; } = {};
		var unnamedList:string[] = [];
		//console.log('------------------');
		for (var n = 0; n < $arguments.length; n++) {
			//console.log($namedArguments[n]);
			if ($namedArguments[n] === null) {
				unnamedList.push($arguments[n]);
			} else {
				namedPairs[$namedArguments[n]] = $arguments[n];
			}
		}
		$arguments = [];
		//console.log(namedPairs);
		//console.log(unnamedList);
		argumentNames.forEach(argumentName => {
			if ($namedArguments.indexOf(argumentName) != -1) {
				$arguments.push(namedPairs[argumentName]);
			} else {
				$arguments.push(unnamedList.shift());
			}
		});
	}
	return $function.apply($context, $arguments);
}