///<reference path='../imports.d.ts'/>

import DefaultFunctions = module('../lang/functions/DefaultFunctions');
import DefaultFilters = module('../lang/filters/DefaultFilters');
import DefaultTests = module('../lang/tests/DefaultTests');
import Scope = module('./Scope');

export class RuntimeContext {
	output: string = '';
	private scope: Scope.Scope;
	functions: any = {};
	filters: any = {};
	tests: any = {};
	currentAutoescape: any = true;
	defaultAutoescape: any = true;
	CurrentTemplate: any;

	constructor(public templateParser: any, scopeData: any) {
		this.scope = new Scope.Scope(scopeData);

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

	setTemplate(CurrentTemplate: any) {
		this.CurrentTemplate = CurrentTemplate;
	}

	createScope(inner: () => void) {
		this.scope.createScope(inner);
	}

	captureOutput(callback: () => void) {
		var oldOutput = this.output;
		this.output = '';
		try {
			callback();
			return this.output;
		} finally {
			this.output = oldOutput;
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

	test($function: any, $arguments: any[]) {
		return this.$call(this.tests, $function, $arguments);
	}

	extends(name: string) {
		var ParentTemplateInfo = (this.templateParser.compile(name));
		var ParentTemplate = new (ParentTemplateInfo.class)();

		for (var key in ParentTemplate) if (this.CurrentTemplate[key] === undefined) this.CurrentTemplate[key] = ParentTemplate[key];
		this.CurrentTemplate['__parent'] = ParentTemplate;
		this.CurrentTemplate['__main'] = ParentTemplate['__main'];
		return this.CurrentTemplate.__main(this);
	}

	putBlock(name: string) {
		var method = (this.CurrentTemplate[name]);
		if (method === undefined) {
			console.log(this.CurrentTemplate['__proto__']);
			throw (new Error("Can't find block '" + name + "'"));
		}
		return method(this);
	}

	autoescape(temporalValue: any, callback: () => void) {
		if (temporalValue === undefined) temporalValue = true;
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