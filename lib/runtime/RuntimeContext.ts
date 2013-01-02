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
				this.write(RuntimeContext.escapeJsString(text));
			break;
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

	include(name: string) {
		var IncludeTemplate = new ((this.templateParser.compile(name, this)).class)();
		IncludeTemplate.__main(this);
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
		}
		return this.scope.get(key);
	}

	scopeSet(key, value) {
		return this.scope.set(key, value);
	}

	access(object: any, key: any) {
		if (object === undefined || object === null) return null;
		if (object instanceof Function) object = object();
		var ret = object[key];
		//if (ret instanceof Function) ret = ret();
		return ret;
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

	ternaryShortcut(value: any, _default: any) {
		return value ? value : _default;
	}

	static escapeHtmlEntities(text: string) {
		return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	static escapeJsString(text: string) {
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

		/*
		function _twig_escape_js_callback($matches)
		{
			$char = $matches[0];

			// \xHH
			if (!isset($char[1])) {
				return '\\x'.strtoupper(substr('00'.bin2hex($char), -2));
			}

			// \uHHHH
			$char = twig_convert_encoding($char, 'UTF-16BE', 'UTF-8');

			return '\\u'.strtoupper(substr('0000'.bin2hex($char), -4));
		}
		*/
	}
}