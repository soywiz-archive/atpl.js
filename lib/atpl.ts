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

function internalCompile(options: IOptions) {
	if (registryTemplateParser[options.root] === undefined) {
		var languageContext = new LanguageContext.LanguageContext();
		Default.register(languageContext);

		var templateParser = new TemplateParser.TemplateParser(
			new FileSystemTemplateProvider(options.root, options.cache),
			languageContext
		);

		registryTemplateParser[options.root] = templateParser;
	}

	return function(params: any) {
		//console.log(options.path);
		//console.log(options.root);
		if (options.path.indexOf(options.root) !== 0) throw (new Error("Path '" + options.path + "' not inside root '" + options.root + "'"));
		return registryTemplateParser[options.root].compileAndRenderToString(options.path.substr(options.root.length), params);
	}
}

export function internalCompileString(content: string, options: IOptions) {
	return function(params: any): string {
		throw (new Error("Not implemented internalCompileString"));
	}
}


export function express2Compile(templateString: string, options: any): (params: any) => string {
	return internalCompileString(templateString, options.settings['atpl options']);
}

var rootPathCache = {};

function express3RenderFile(filename: string, options: any/*IOptionsExpress*/, callback: (err: Error, output: string) => void) {
    // handle callback in options
    if ('function' == typeof options) {
        callback = options;
        options = {};
    }

    //console.log(filename);
	//console.log(options);
	//console.log(options._locals);
	//console.log(callback);

    options = options || {};

    var rootPath = options.settings['views'];
    if (rootPathCache[rootPath] === undefined) rootPathCache[rootPath] = fs.realpathSync(rootPath);

    var params: IOptions = {
        path: filename,
        root: rootPathCache[rootPath],
		cache: options.cache,
    };

    try {
		var func = internalCompile(params);
    	var output = func(options);
    	callback(null, output);
    } catch (e) {
    	callback(e, '');
    }
}

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
