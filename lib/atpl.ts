///<reference path='imports.d.ts'/>
///<reference path='TemplateProvider.ts'/>

export import TemplateParser = module('./parser/TemplateParser');
import TemplateProvider = module('./TemplateProvider');
import LanguageContext = module('./LanguageContext');
import Default = module('./lang/Default');
import fs = module('fs');
var FileSystemTemplateProvider = TemplateProvider.FileSystemTemplateProvider;

var registryTemplateParser = {};

export interface IOptions {
	path?: string;
	root?: string;
	cache?: bool;
	content?: string;
}

export interface IOptionsExpress {
	settings: {
		//'x-powered-by': bool;
		etag: bool;
		env: string;
		views: string;
		//'jsonp callback name': string;
		//'json spaces': number;
		//'view engine': string;
	};
	_locals();
	cache: bool;
}

var languageContext = new LanguageContext.LanguageContext();

function internalCompile(options: IOptions, absolutePath = false) {
	if (options.root === undefined) options.root = '';

	// options.cache

	if (registryTemplateParser[options.root] === undefined) {
		Default.register(languageContext);

		var templateParser = new TemplateParser.TemplateParser(
			new FileSystemTemplateProvider(options.root),
			languageContext
		);

		registryTemplateParser[options.root] = templateParser;
	}

	return function(params: any) {
		var cache = options.cache;
		
		if (params && params.settings) cache = params.settings['view cache'];

		return languageContext.templateConfig.setCacheTemporal(cache, () => {
			//console.log(options.path);
			//console.log(options.root);
			var templateParser = <TemplateParser.TemplateParser>registryTemplateParser[options.root];

			if (options.path === undefined) {
				if (options.content === undefined) throw (new Error("No content or path"));
				return templateParser.compileAndRenderStringToString(options.content, params);
			} else {
				if (absolutePath) {
					return templateParser.compileAndRenderToString(options.path, params);
				} else {
					if (options.path.indexOf(options.root) !== 0) throw (new Error("Path '" + options.path + "' not inside root '" + options.root + "'"));
					return templateParser.compileAndRenderToString(options.path.substr(options.root.length), params);
				}
			}
		});
	}
}

var rootPathCache = {};

function internalRender(filename: string, options: any/*IOptionsExpress*/, absolutePath = false): string {
	//console.log(filename);
	//console.log(options);
	//console.log(options._locals);
	//console.log(callback);

    options = options || {};
	if (options.settings === undefined) options.settings = {};

    var rootPath = options.settings['views'] || '.';
    if (rootPathCache[rootPath] === undefined) rootPathCache[rootPath] = fs.realpathSync(rootPath);

    var params: IOptions = {
        path: filename,
        root: rootPathCache[rootPath],
		cache: options.cache,
		content: options.content,
    };

    return internalCompile(params, absolutePath)(options);
}

export function internalCompileString(content: string, options: IOptions) {
	return function(params: any): string {
		//console.log('content: ' + JSON.stringify(content));
		//console.log('options: ' + JSON.stringify(options));
		//console.log('params: ' + JSON.stringify(params));
		params.content = content;
		params.path = params.filename;
		return internalRender(params.filename, params, true);
	}
}


export function express2Compile(templateString: string, options: any): (params: any) => string {
	options = options || {};
	if (options.settings === undefined) options.settings = {};
	return internalCompileString(templateString, options.settings['atpl options']);
}

function express3RenderFile(filename: string, options: any/*IOptionsExpress*/, callback: (err: Error, output?: string) => void) {
    // handle callback in options
    if ('function' == typeof options) {
        callback = options;
        options = {};
    }

    try {
    	callback(null, internalRender(filename, options));
    } catch (err) {
    	callback(err);
    }
}

export function registerExtension(items: any) { return languageContext.registerExtension(items); }
export function registerTags(items: any) { return languageContext.registerTags(items); }
export function registerFunctions(items: any) { return languageContext.registerFunctions(items); }
export function registerFilters(items: any) { return languageContext.registerFilters(items); }
export function registerTests(items: any) { return languageContext.registerTests(items); }

//Express 2x template engine compatibility required the following module export:
//
//exports.compile = function(templateString, options) {
//  return a Function;
//};
export var compile = express2Compile;

//Express 3x template engines should export the following:
//
//exports.__express = function(filename, options, callback) {
//  callback(err, string);
//};
export var __express = express3RenderFile;
