export class DefaultFunctions {
	// http://twig.sensiolabs.org/doc/functions/range.html
	static range(low: number, high: number, step: number = 1) {
		var out = [];
		var current = low;
		while (current <= high) {
			out.push(current);
			current += step;
		}
		return out;
	}
	
	// http://twig.sensiolabs.org/doc/functions/cycle.html
	static cycle(list: any[], index: number) {
		return list[index % list.length]
	}

	// http://twig.sensiolabs.org/doc/functions/constant.html
	static constant(name: string) {
		throw (new Error("Not implemented"));
	}

	// http://twig.sensiolabs.org/doc/functions/random.html
	static random(values: any) {
		if (values === undefined || values === null) return Math.round(Math.random() * 99999999);
		if ((values.prototype == Array.prototype) || (values.prototype == String.prototype)) {
			return values[Math.round(Math.random() * (values.length - 1))];
		}
		return Math.round(Math.random() * values);
	}

	// http://twig.sensiolabs.org/doc/functions/attribute.html
	static attribute(object: any, method: any, arguments?: any[]) {
		throw (new Error("Not implemented"));
	}

	// http://twig.sensiolabs.org/doc/functions/block.html
	static block(name: string) {
		var that = this;
		return that.captureOutput(() => {
			that.putBlock('block_' + name);
		});
	}

	// http://twig.sensiolabs.org/doc/functions/parent.html
	static parent() {
		throw (new Error("Not implemented"));
	}

	// http://twig.sensiolabs.org/doc/functions/dump.html
	static dump(object: any) {
		return JSON.stringify(object);
	}

	// http://twig.sensiolabs.org/doc/functions/date.html
	static date(date?, timezone?) {
		throw (new Error("Not implemented"));
	}

	// http://twig.sensiolabs.org/doc/functions/template_from_string.html
	static template_from_string(template: string) {
		throw (new Error("Not implemented"));
	}	
}