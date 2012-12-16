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

function express3RenderFile(filename: string, options: any, callback: (err: Error, output: string) => void) {
    // handle callback in options
    if ('function' == typeof options) {
        callback = options;
        options = {};
    }

    options = options || {};

    var params = {
        path: filename,
        base: options.settings['views'],
        load: function(template) {
            // render and return template
            callback(null, template.render(options));
        }
    };

    // mixin any options provided to the express app.
    var view_options = options.settings['atpl options'];

    try {
		var func = internalCompile(params);
    	var output = func({});
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
