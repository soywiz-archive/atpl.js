///<reference path='imports.d.ts'/>

import { FileSystemTemplateProvider} from './provider/FileSystemTemplateProvider';
import { LanguageContext } from './LanguageContext';
import { TemplateParser } from './parser/TemplateParser';

import Default = require('./lang/Default');
import fs = require('fs');
var isWin = process.platform ? !!process.platform.match(/^win/) : false;

function normalizePath(path:string) {
	path = path.replace(/\\/g, '/');
	if (isWin && path.match(/^[A-Za-z]:\//)) {
		path = path.substr(0, 1).toLowerCase() + path.substr(1);
	}
	return path;
}

var registryTemplateParser: { [name:string]:any; } = {};

export interface IOptions {
	path?: string;
	root?: string;
	cache?: boolean;
	content?: string;
}

export interface IOptionsExpress {
	settings: {
		//'x-powered-by': boolean;
		etag: boolean;
		env: string;
		views: string;
		//'jsonp callback name': string;
		//'json spaces': number;
		//'view engine': string;
	};
	_locals(): void;
	cache: boolean;
}

var languageContext = new LanguageContext();
Default.register(languageContext);

function internalCompile(options: IOptions, absolutePath = false) {
	if (options.root === undefined) options.root = '';

	// options.cache

	if (registryTemplateParser[options.root] === undefined) {
		var templateParser = new TemplateParser(
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
			var templateParser = <TemplateParser>registryTemplateParser[options.root];

			if (options.path === undefined) {
				if (options.content === undefined) throw (new Error("No content or path"));
				return templateParser.compileAndRenderStringToString(options.content, params);
			} else {
				if (absolutePath) {
					return templateParser.compileAndRenderToString(options.path, params);
				} else {
					var path = normalizePath(options.path);
					var root = normalizePath(options.root);
					if (!path.match(/[\/\\]/)) path = normalizePath(root + '/' + path);
					if (path.indexOf(root) !== 0) throw (new Error("Path '" + path + "' not inside root '" + root + "'"));
					return templateParser.compileAndRenderToString(path.substr(root.length), params);
				}
			}
		});
	}
}

var rootPathCache: { [name:string]:string; } = {};

function internalRenderSync(filename: string, options: any/*IOptionsExpress*/, absolutePath = false): string {
	//console.log(filename);
	//console.log(options);
	//console.log(options._locals);
	//console.log(callback);

    options = options || {};
	if (options.settings === undefined) options.settings = {};

    var rootPath = options.settings['views'] || '.';
    if (rootPathCache[rootPath] === undefined) rootPathCache[rootPath] = <any>fs.realpathSync(rootPath);

    var params: IOptions = {
        path: filename,
        root: rootPathCache[rootPath],
		cache: options.cache,
		content: options.content,
    };

    return internalCompile(params, absolutePath)(options);
}

function internalRenderAsync(filename: string, options: any/*IOptionsExpress*/, done: (result: string) => void , absolutePath = false): void {
	var result = internalRenderSync(filename, options, absolutePath);
	done(result);
}

export function internalCompileString(content: string, options: IOptions) {
	return function(params: any): string {
		//console.log('content: ' + JSON.stringify(content));
		//console.log('options: ' + JSON.stringify(options));
		//console.log('params: ' + JSON.stringify(params));
		params.content = content;
		params.path = params.filename;
		return internalRenderSync(params.filename, params, true);
	}
}


export function express2Compile(templateString: string, options?: any): (params: any) => string {
	options = options || {};
	if (options.settings === undefined) options.settings = {};
	return internalCompileString(templateString, options.settings['atpl options']);
}

/**
 *
 * @param filename
 * @param options
 * @param callback
 */
export function express3RenderFile(filename: string, options: any/*IOptionsExpress*/, callback: (err: Error, output?: string) => void) {
    // handle callback in options
    if ('function' == typeof options) {
        callback = options;
        options = {};
    }

    try {
    	internalRenderAsync(filename, options, function (result) {
    		callback(null, result);
    	});
    } catch (err) {
    	callback(err, undefined);
    }
}

/**
 *
 */
export function renderFileSync(viewsPath: string, filename: string, parameters: any = {}, cache: boolean = true):string
{
    if (registryTemplateParser[viewsPath] === undefined) {
        registryTemplateParser[viewsPath] = new TemplateParser(new FileSystemTemplateProvider(viewsPath), languageContext);
    }

    return languageContext.templateConfig.setCacheTemporal(cache, () => {
        //console.log(options.path);
        //console.log(options.root);
        var templateParser = <TemplateParser>registryTemplateParser[viewsPath];

        var path = normalizePath(filename);
        var root = normalizePath(viewsPath);
        if (!path.match(/[\/\\]/)) path = normalizePath(root + '/' + path);
        if (path.indexOf(root) !== 0) throw (new Error("Path '" + path + "' not inside root '" + root + "'"));
        return templateParser.compileAndRenderToString(path.substr(root.length), parameters);
    });
}

export function renderFile(viewsPath: string, filename: string, parameters: any, cache: boolean, done: (err: Error, result?: string) => void): void {
    try {
        var result = renderFileSync(viewsPath, filename, parameters, cache);
        done(null, result);
    } catch (e) {
        done(e);
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
