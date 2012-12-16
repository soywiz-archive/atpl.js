///<reference path='imports.d.ts'/>

export import TemplateParser = module('./parser/TemplateParser');
import TemplateProvider = module('./TemplateProvider');
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
		registryTemplateParser[options.root] = new TemplateParser.TemplateParser(
			new FileSystemTemplateProvider(options.root, options.cache)
		);
	}

	return function(params: any) {
		return registryTemplateParser[options.root].compileAndRenderToString(options.path.substr(options.root.length), params);
	}
}

export function internalCompileString(content: string, options: IOptions) {
	return function(params: any) {
		throw (new Error("Not implemented internalCompileString"));
		return "";
	}
}


export function express2Compile(templateString: string, options: any): (params: any) => string {
	return internalCompileString(templateString, options.settings['atpl options']);
}

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

    var params: IOptions = {
        path: filename,
        root: options.settings['views'],
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
