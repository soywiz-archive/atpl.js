import RuntimeUtils = module('../runtime/RuntimeUtils');
import RuntimeContext = module('../runtime/RuntimeContext');
import TemplateParser = module('../parser/TemplateParser');
import util = module('util');

export class DefaultFunctions {
	/**
	 * Obtains a range of numbers
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/range.html
	 */
	static range(low: number, high: number, step: number = 1) {
		return RuntimeUtils.range(low, high, step);
	}
	
	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/cycle.html
	 */
	static cycle(list: any[], index: number) {
		return list[index % list.length];
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/constant.html
	 */
	static constant(name: string) {
		throw (new Error("Not implemented function [constant] [no use on javascript]"));
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/include.html
	 */
	static include(name: string) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		runtimeContext.include(name);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/random.html
	 */
	static random(values: any) {
		if (values === undefined || values === null) {
			return RuntimeUtils.random();
		} else if (RuntimeUtils.isArray(values) || RuntimeUtils.isString(values)) {
			return values[RuntimeUtils.random(0, values.length)];
		} else {
			return RuntimeUtils.random(0, values);
		}
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/attribute.html
	 */
	static attribute(object: any, method: any, _arguments?: any[]) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		return runtimeContext.accessCall(object, method, _arguments);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/block.html
	 */
	static block(name: string) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		return runtimeContext.captureOutput(() => {
			runtimeContext.putBlock('block_' + name);
		});
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/parent.html
	 */
	static parent() {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		return runtimeContext.autoescape(false, () => {
			return runtimeContext.captureOutput(() => {
				runtimeContext.putBlockParent(runtimeContext.currentBlockName);
			});
		});
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/dump.html
	 */
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

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/date.html
	 */
	static date(date?, timezone?) {
		if (timezone !== undefined) throw (new Error("Not implemented function [date] with [timezone] parameter"));
		return RuntimeUtils.strtotime(date);
	}

	/**
	 *
	 * @see http://twig.sensiolabs.org/doc/functions/template_from_string.html
	 */
	static template_from_string(template: string) {
		var runtimeContext: RuntimeContext.RuntimeContext = this;
		return runtimeContext.compileString(template);
	}

	/**
	 *
	 * @see https://github.com/soywiz/atpl.js/issues/13
	 */
	static inspect(object, showHidden?, depth?, color?) {
		return util.inspect(object, showHidden, depth, color);
	}
}
