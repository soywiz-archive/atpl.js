///<reference path='../imports.d.ts'/>

import RuntimeUtils = module('./RuntimeUtils');
export import LanguageContext = module('../LanguageContext');
import Scope = module('./Scope');

export class RuntimeContext {
	output: string = '';
	private scope: Scope.Scope;
	currentAutoescape: any = true;
	defaultAutoescape: any = true;
	currentBlockName: string = 'none';

	LeafTemplate: any;
	CurrentTemplate: any;
	RootTemplate: any;

	constructor(public templateParser: any, scopeData: any, public languageContext: LanguageContext.LanguageContext) {
		this.scope = new Scope.Scope(scopeData);
	}

	setTemplate(Template: any) {
		this.LeafTemplate = Template;
		this.CurrentTemplate = Template;
		this.RootTemplate = Template;
	}

	setCurrentBlock(template: any, name: string, callback: () => void) {
		var BackCurrentTemplate = this.CurrentTemplate;
		var BackCurrentBlockName = this.currentBlockName;

		//console.log("setCurrentBlock('" + template.name + "', '" + name + "')");

		this.CurrentTemplate = template;
		this.currentBlockName = name;
		try {
			return callback();
		} finally {
			this.CurrentTemplate = BackCurrentTemplate;
			this.currentBlockName = BackCurrentBlockName;
		}
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
		if (!RuntimeUtils.isString(text)) text = JSON.stringify(text);
		//console.log(this.currentAutoescape);
		switch (this.currentAutoescape) {
			case false:
				this.write(text);
			break;
			case 'js':
				throw (new Error("Not implemented"));
			case 'css':
				throw (new Error("Not implemented"));
			case 'url':
				throw (new Error("Not implemented"));
			case 'html_attr':
				throw (new Error("Not implemented"));
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
			if (RuntimeUtils.isString($function)) $function = functionList[$function];
			//console.log('call:' + $function);
			if ($function instanceof Function) {
				return $function.apply(this, $arguments);
				//console.log('called!');
			}
		}
		return null;
	}

	call($function: any, $arguments: any[]) {
		return this.$call(this.languageContext.functions, $function, $arguments);
	}

	filter($function: any, $arguments: any[]) {
		return this.$call(this.languageContext.filters, $function, $arguments);
	}

	test($function: any, $arguments: any[]) {
		return this.$call(this.languageContext.tests, $function, $arguments);
	}

	include(name: string) {
		var IncludeTemplate = new ((this.templateParser.compile(name)).class)();
		IncludeTemplate.__main(this);
	}

	extends(name: string) {
		var ParentTemplateInfo = (this.templateParser.compile(name));
		var ParentTemplate = new (ParentTemplateInfo.class)();

		//for (var key in ParentTemplate) if (this.CurrentTemplate[key] === undefined) this.CurrentTemplate[key] = ParentTemplate[key];
		this.RootTemplate['__proto__']['__proto__'] = ParentTemplate;
		this.RootTemplate = ParentTemplate;
		this.LeafTemplate['__parent'] = ParentTemplate;
		this.LeafTemplate['__main'] = ParentTemplate['__main'];
		return this.LeafTemplate.__main(this);
	}

	each(list: any, callback: (key, value) => void ) {
		var index = 0;
		var length = list.length;
		for (var k in list) {
			this.scope.set('loop', {
				'index0': index,
				'index': index + 1,
				'revindex0': length - index,
				'revindex': length - index - 1,
				'first': index == 0,
				'last': index == length - 1,
				'parent': this.scope.getParent(),
				'length': length,
			})
			callback(k, list[k]);
			index++;
		}
	}

	range(low: any, high: any, step: any) {
		var out = RuntimeUtils.range(low, high, step);
		//console.log(out);
		return out;
	}

	private _putBlock(Current: any, name: string) {
		var method = (Current[name]);
		if (method === undefined) {
			console.log(Current['__proto__']);
			throw (new Error("Can't find block '" + name + "'"));
		}
		return method.call(Current, this);
	}

	putBlock(name: string) {
		return this._putBlock(this.LeafTemplate, name);
	}

	putBlockParent(name: string) {
		//console.log('RootTemplate: ' + this.RootTemplate.name);
		//console.log('LeafTemplate: ' + this.LeafTemplate.name);
		//console.log('CurrentTemplate: ' + this.CurrentTemplate.name);
		return this._putBlock(this.CurrentTemplate['__proto__']['__proto__'], name);
		//throw (new Error("Not implemented"));
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

	emptyList(value: any) {
		if (value === undefined || value === null) return true;
		if (value instanceof Array || value instanceof String) return (value.length == 0);
		return false;
	}

	inArray(value: any, array: any) {
		if (array instanceof Array) return array.indexOf(value) != -1;
		return false;
	}

	static escapeHtmlEntities(text: string) {
		return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}
}