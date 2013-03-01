///<reference path='../imports.d.ts'/>

import RuntimeUtils = module('./RuntimeUtils');
import LanguageContext = module('../LanguageContext');
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
			case 'js': this.write(RuntimeContext.escapeJsString(text)); break;
			case 'css': this.write(RuntimeContext.escapeCssString(text)); break;
			case 'url': this.write(RuntimeContext.escapeUrlString(text)); break;
			case 'html_attr': this.write(RuntimeContext.escapeHtmlAttribute(text)); break;
			case 'html': case true: case undefined: this.write(RuntimeContext.escapeHtmlEntities(text)); break;
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
		if (RuntimeUtils.isString(value) && RuntimeUtils.isString(array)) {
			return (<string>array).indexOf(<string>value) != -1;
		}
		return false;
	}

	ternaryShortcut(value: any, _default: any) {
		return value ? value : _default;
	}

	static escapeHtmlEntities(text: string) {
		return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	static escapeHtmlAttribute(text: string) {
		return String(text).replace(/[^a-zA-Z0-9,\.\-_]/g, (match) => {
			var chr = match;
			var ord = match.charCodeAt(0);
			if ((ord <= 0x1f && chr != "\t" && chr != "\n" && chr != "\r") || (ord >= 0x7f && ord <= 0x9f)) {
				return '&#xFFFD;';
			}
			switch (ord) {
				case 34: return '&quot;'; // quotation mark
				case 38: return '&amp;';  // ampersand
				case 60: return '&lt;';   // less-than sign
				case 62: return '&gt;';   // greater-than sign
			}
			return '&#x' + (('0000' + ord.toString(16)).substr((ord < 0x100) ? -2 : -4)) + ';';
		});
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
	}

	static escapeCssString(text: string) {
		return text.replace(/\W/g, (match) => {
			return '\\' + match.charCodeAt(0).toString(16).toUpperCase() + ' ';
		});
	}

	static escapeUrlString(str: string) {
		// http://kevin.vanzonneveld.net
		// +   original by: Brett Zamir (http://brett-zamir.me)
		// +      input by: travc
		// +      input by: Brett Zamir (http://brett-zamir.me)
		// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +      input by: Michael Grier
		// +   bugfixed by: Brett Zamir (http://brett-zamir.me)
		// +      input by: Ratheous
		// +      reimplemented by: Brett Zamir (http://brett-zamir.me)
		// +   bugfixed by: Joris
		// +      reimplemented by: Brett Zamir (http://brett-zamir.me)
		// %          note 1: This reflects PHP 5.3/6.0+ behavior
		// %        note 2: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
		// %        note 2: pages served as UTF-8
		// *     example 1: rawurlencode('Kevin van Zonneveld!');
		// *     returns 1: 'Kevin%20van%20Zonneveld%21'
		// *     example 2: rawurlencode('http://kevin.vanzonneveld.net/');
		// *     returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
		// *     example 3: rawurlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
		// *     returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'
		str = (str + '').toString();

		// Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
		// PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
		return encodeURIComponent(str)
			.replace(/!/g, '%21')
			.replace(/'/g, '%27')
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29')
			.replace(/\*/g, '%2A')
		;
	}
}
