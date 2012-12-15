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
	if ((from.substr) || (to.substr)) {
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