///<reference path='imports.d.ts'/>

import TemplateParser = module('./parser/TemplateParser');
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
Default.register(languageContext);

function internalCompile(options: IOptions, absolutePath = false) {
	if (options.root === undefined) options.root = '';

	// options.cache

	if (registryTemplateParser[options.root] === undefined) {
		var templateParser = new TemplateParser.TemplateParser(
			new FileSystemTemplateProvider(options.root),
			languageContext
		);

		registryTemplateParser[options.root] = templateParser;
	}

	return function(params: any) {
		var cache = options.cache;
		
		if (params && params.settings) {
			if (options.cache === undefined) {
				cache = params.settings['view cache'];
			}
		}

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
					var path = options.path.replace(/\\/g, '/');
					var root = options.root.replace(/\\/g, '/');
					if (!path.match(/[\/\\]/)) path = root + '/' + path;
					if (path.indexOf(root) !== 0) throw (new Error("Path '" + path + "' not inside root '" + root + "'"));
					return templateParser.compileAndRenderToString(path.substr(root.length), params);
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


export function express2Compile(templateString: string, options?: any): (params: any) => string {
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

    var err = null;
    var result = null;
    try {
    	result = internalRender(filename, options);
    	return callback(null, result);
    } catch (err) {
    	return callback(err, '');
    }
    //return callback(null, result);
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
