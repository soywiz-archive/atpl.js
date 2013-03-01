import RuntimeUtils = module('../runtime/RuntimeUtils');
import RuntimeContext = module('../runtime/RuntimeContext');
import util = module('util');

export class DefaultFunctions {
	// http://twig.sensiolabs.org/doc/functions/range.html
	static range(low: number, high: number, step: number = 1) {
		return RuntimeUtils.range(low, high, step);
	}
	
	// http://twig.sensiolabs.org/doc/functions/cycle.html
	static cycle(list: any[], index: number) {
		return list[index % list.length]
	}

	// http://twig.sensiolabs.org/doc/functions/constant.html
	static constant(name: string) {
		throw (new Error("Not implemented function [constant] [no use on javascript]"));
	}

	// http://twig.sensiolabs.org/doc/functions/include.html
	static include(name: string) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		runtimeContext.include(name);
	}

	// http://twig.sensiolabs.org/doc/functions/random.html
	static random(values: any) {
		if (values === undefined || values === null) {
			return RuntimeUtils.random();
		} else if (RuntimeUtils.isArray(values) || RuntimeUtils.isString(values)) {
			return values[RuntimeUtils.random(0, values.length)];
		} else {
			return RuntimeUtils.random(0, values);
		}
	}

	// http://twig.sensiolabs.org/doc/functions/attribute.html
	static attribute(object: any, method: any, arguments?: any[]) {
		throw (new Error("Not implemented function [attribute] [no use on javascript]"));
	}

	// http://twig.sensiolabs.org/doc/functions/block.html
	static block(name: string) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		return runtimeContext.captureOutput(() => {
			runtimeContext.putBlock('block_' + name);
		});
	}

	// http://twig.sensiolabs.org/doc/functions/parent.html
	static parent() {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		return runtimeContext.captureOutput(() => {
			runtimeContext.putBlockParent(runtimeContext.currentBlockName);
		});
	}

	// http://twig.sensiolabs.org/doc/functions/dump.html
	static dump(...objects: any[]) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		if (objects.length > 0) {
			var result = '';
			for (var n = 0; n < objects.length; n++) result += RuntimeUtils.inspect_json(objects[n]);
			return result;
		} else {
			return RuntimeUtils.inspect_json(runtimeContext.scope.getAll());
		}
	}

	// http://twig.sensiolabs.org/doc/functions/date.html
	static date(date?, timezone?) {
		if (timezone !== undefined) throw (new Error("Not implemented function [date] with [timezone] parameter"));
		return RuntimeUtils.strtotime(date);
	}

	// http://twig.sensiolabs.org/doc/functions/template_from_string.html
	static template_from_string(template: string) {
		throw (new Error("Not implemented function [template_from_string]"));
	}

	// https://github.com/soywiz/atpl.js/issues/13
	static inspect(object, showHidden?, depth?, color?) {
		return util.inspect(object, showHidden, depth, color);
	}
}
