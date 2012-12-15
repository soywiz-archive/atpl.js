///<reference path='../imports.d.ts'/>

import DefaultFunctions = module('../lang/functions/DefaultFunctions');
import DefaultFilters = module('../lang/filters/DefaultFilters');
import DefaultTests = module('../lang/tests/DefaultTests');

export class RuntimeContext {
	output: string = '';
	scope: any = {};
	functions: any = {};
	filters: any = {};
	tests: any = {};
	currentAutoescape: any = true;
	defaultAutoescape: any = true;

	constructor() {
		for (var key in DefaultFunctions.DefaultFunctions) {
			this.functions[key.replace(/^\$+/, '')] = DefaultFunctions.DefaultFunctions[key];
		}

		for (var key in DefaultFilters.DefaultFilters) {
			this.filters[key.replace(/^\$+/, '')] = DefaultFilters.DefaultFilters[key];
		}

		for (var key in DefaultTests.DefaultTests) {
			this.tests[key.replace(/^\$+/, '')] = DefaultTests.DefaultTests[key];
		}
	}

	createScope(inner: () => void) {
		var newScope = {};
		var oldScope = this.scope;
		newScope['__proto__'] = oldScope;
		this.scope = newScope;
		try {
			inner();
		} finally {
			this.scope = oldScope;
		}
	}

	write(text: any) {
		if (text === undefined || text === null) return;
		this.output += text;
	}

	writeExpression(text: any) {
		if (text === undefined || text === null) return;
		if (!text.substr) text = JSON.stringify(text);
		//console.log(this.currentAutoescape);
		switch (this.currentAutoescape) {
			case false:
				this.write(text);
			break;
			case 'js':
				throw (new Error("Not implemented"));
			break;
			case 'css':
				throw (new Error("Not implemented"));
			break;
			case 'url':
				throw (new Error("Not implemented"));
			break;
			case 'html_attr':
				throw (new Error("Not implemented"));
			break;
			default:
			case true:
			case 'html':
				this.write(RuntimeContext.escapeHtmlEntities(text));
			break;
		}
		this.currentAutoescape = this.defaultAutoescape;
	}

	$call(functionList: any, $function: any, $arguments: any[]) {
		if ($function !== undefined && $function !== null) {
			//console.log('call:' + $function);
			if ($function.substr) $function = functionList[$function];
			//console.log('call:' + $function);
			if ($function instanceof Function) {
				return $function.apply(this, $arguments);
				//console.log('called!');
			}
		}
		return null;
	}

	call($function: any, $arguments: any[]) {
		return this.$call(this.functions, $function, $arguments);
	}

	filter($function: any, $arguments: any[]) {
		return this.$call(this.filters, $function, $arguments);
	}

	autoescape(temporalValue: any, callback: () => void) {
		var prevDefault = this.defaultAutoescape;
		
		this.defaultAutoescape = temporalValue;
		try {
			this.currentAutoescape = this.defaultAutoescape;
			//console.log(this.currentAutoescape);
			callback();
		} finally {
			this.defaultAutoescape = prevDefault;
		}
	}

	access(object: any, key: any) {
		if (object === undefined || object === null) return null;
		return object[key];
	}

	static escapeHtmlEntities(text: string) {
		return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
}