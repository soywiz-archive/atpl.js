///<reference path='../imports.d.ts'/>

import RuntimeUtils = module('./RuntimeUtils');
import LanguageContext = module('../LanguageContext');
//import TemplateParser = module('../parser/TemplateParser');
import Scope = module('./Scope');

export class RuntimeContext {
	output: string = '';
	scope: Scope.Scope;
	currentAutoescape: any = true;
	defaultAutoescape: any = true;
	currentBlockName: string = 'none';
	removeFollowingSpaces: bool = false;

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

	compileString(templateString: string) {
		return this.templateParser.compileString(templateString, this);
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

	createScope(inner: () => void, only: bool = false) {
		if (only) {
			var oldScope = this.scope;
			try {
				this.scope = new Scope.Scope({});
				inner();
			} finally {
				this.scope = oldScope;
			}
		} else {
			this.scope.createScope(inner);
		}
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

	trimSpaces() {
		this.output = this.output.replace(/\s+$/, '');
		this.removeFollowingSpaces = true;
	}

	write(text: string) {
		if (text === undefined || text === null) return;
		if (this.removeFollowingSpaces) {
			text = text.replace(/^\s+/, '');
			this.removeFollowingSpaces = (text.match(/^\s+$/) != null);
		}
		this.output += text;
	}

	writeExpression(text: any) {
		if (text === undefined || text === null) return;
		if (!RuntimeUtils.isString(text)) text = JSON.stringify(text);
		//console.log(this.currentAutoescape);
		switch (this.currentAutoescape) {
			case false: this.write(text); break;
			case 'js': this.write(RuntimeUtils.escapeJsString(text)); break;
			case 'css': this.write(RuntimeUtils.escapeCssString(text)); break;
			case 'url': this.write(RuntimeUtils.escapeUrlString(text)); break;
			case 'html_attr': this.write(RuntimeUtils.escapeHtmlAttribute(text)); break;
			case 'html': case true: case undefined: this.write(RuntimeUtils.escapeHtmlEntities(text)); break;
			default: throw (new Error('Invalid escaping strategy "' + this.currentAutoescape + '"(valid ones: html, js, url, css, and html_attr).'));
		}
		this.currentAutoescape = this.defaultAutoescape;
	}

	$call(functionList: any, $function: any, $arguments: any[]) {
		if (functionList !== undefined && functionList !== null) {
			//console.log('call:' + $function);
			if (RuntimeUtils.isString($function)) $function = functionList[$function];
			return this.$call2($function, $arguments);
		}
		return null;
	}

	$call2($function: any, $arguments: any[]) {
		if ($function !== undefined && $function !== null) {
			if ($function instanceof Function) {
				return $function.apply(this, $arguments);
			}
		}
		return null;
	}

	callContext($context: any, $functionName: any, $arguments: any[]) {
		if ($context !== undefined && $context !== null)
		{
			var $function = $context[$functionName];
			if ($function instanceof Function) {
				return $function.apply($context, $arguments);
			}
		}
		return null;
	}

	call($function: any, $arguments: any[]) {
		if (this.languageContext.functions[$function] === undefined) {
			//console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
			return this.$call2(this.scope.get($function), $arguments);
		} else {
			return this.$call(this.languageContext.functions, $function, $arguments);
		}
	}

	filter($function: any, $arguments: any[]) {
		return this.$call(this.languageContext.filters, $function, $arguments);
	}

	test($function: any, $arguments: any[]) {
		return this.$call(this.languageContext.tests, $function, $arguments);
	}

	include(info: any, scope: any = {}, only: bool = false) {
		this.createScope(() => {
			if (scope !== undefined) this.scope.setAll(scope);
			if (RuntimeUtils.isString(info)) {
				var name = <string>info;
				var IncludeTemplate = new ((this.templateParser.compile(name, this)).class )();
				IncludeTemplate.__main(this);
			} else {
				var IncludeTemplate = new (info.class )();
				IncludeTemplate.__main(this);
			}
		}, only);
	}

	import(name: string) {
		var IncludeTemplate = new ((this.templateParser.compile(name, this)).class)();
		//console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<");
		//console.log(IncludeTemplate.macros);
		//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
		return IncludeTemplate.macros;
		//return 'Hello World!';
	}

	fromImport(name: string, pairs: any[]) {
		var keys = this.import(name);
		pairs.forEach((pair) => {
			var from = pair[0];
			var to = pair[1];
			//console.log(from + " : " + to);
			this.scope.set(to, keys[from]);
		});
	}

	extends(name: string) {
		var ParentTemplateInfo = (this.templateParser.compile(name, this));
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
			throw (new Error("Can't find block '" + name + "' in '" + Current.name + ":" + this.currentBlockName + "'"));
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

	autoescape(temporalValue: any, callback: () => void, setCurrentAfter: bool = false) {
		if (temporalValue === undefined) temporalValue = true;
		var prevDefault = this.defaultAutoescape;
		
		this.defaultAutoescape = temporalValue;
		try {
			this.currentAutoescape = this.defaultAutoescape;
			//console.log(this.currentAutoescape);
			return callback();
		} finally {
			this.defaultAutoescape = prevDefault;
			if (setCurrentAfter) this.currentAutoescape = prevDefault;
		}
	}

	scopeGet(key) {
		switch (key) {
			case '_self':
				// FIXME?: Probably not CurrentTemplate but the template that contains this functions.
				return this.CurrentTemplate.macros;
			case '_context':
				// INFO: This will be SLOW.
				return this.scope.getAll();
		}
		return this.scope.get(key);
	}

	scopeSet(key, value) {
		return this.scope.set(key, value);
	}

	slice(object: any, left: any, right: any):any {
		if (RuntimeUtils.isString(object)) {
			return (<String>object).substr(left, right);
		}
		if (RuntimeUtils.isArray(object)) {
			return (<any[]>object).slice(left, right);
		}
		return undefined;
	}

	access(object: any, key: any) {
		if (object === undefined || object === null) return null;
		if (object instanceof Function) object = object();
		var ret = object[key];
		return ret;
	}

	accessCall(object: any, key: any, _arguments: any[]) {
		var ret = this.access(object, key);
		if (ret instanceof Function) ret = (<Function>ret).apply(object, _arguments);
		return ret;
	}

	emptyList(value: any) {
		if (value === undefined || value === null) return true;
		if (value instanceof Array || value instanceof String) return (value.length == 0);
		return false;
	}

	inArray(value: any, array: any) {
		if (array instanceof Array) return array.indexOf(value) != -1;
		if (RuntimeUtils.isString(value) && RuntimeUtils.isString(array)) {
			return (<string>array).indexOf(<string>value) != -1;
		}
		return false;
	}

	ternaryShortcut(value: any, _default: any) {
		return value ? value : _default;
	}
}
