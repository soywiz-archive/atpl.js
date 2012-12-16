export import DateFormat = module('./lib/DateFormat');
export import Format = module('./lib/Format');

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

export function sprintf() {
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

export function empty(value: any) {
	if (!defined(value)) return true;
	if (value.prototype == Array.prototype || value.prototype == String.prototype) return (value.length == 0);
	return false;
}

export function isString(obj) {
  return toString.call(obj) == '[object String]';
}