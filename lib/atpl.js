///<reference path='imports.d.ts'/>
var TemplateParser = require('./parser/TemplateParser');
var TemplateProvider = require('./TemplateProvider');
var LanguageContext = require('./LanguageContext');
var Default = require('./lang/Default');
var fs = require('fs');
var FileSystemTemplateProvider = TemplateProvider.FileSystemTemplateProvider;
var isWin = !!process.platform.match(/^win/);

function normalizePath(path) {
    path = path.replace(/\\/g, '/');
    if (isWin && path.match(/^[A-Za-z]:\//)) {
        path = path.substr(0, 1).toLowerCase() + path.substr(1);
    }
    return path;
}

var registryTemplateParser = {};

var languageContext = new LanguageContext.LanguageContext();
Default.register(languageContext);

function internalCompile(options, absolutePath) {
    if (typeof absolutePath === "undefined") { absolutePath = false; }
    if (options.root === undefined)
        options.root = '';

    // options.cache
    if (registryTemplateParser[options.root] === undefined) {
        var templateParser = new TemplateParser.TemplateParser(new FileSystemTemplateProvider(options.root), languageContext);

        registryTemplateParser[options.root] = templateParser;
    }

    return function (params) {
        var cache = options.cache;

        if (params && params.settings) {
            if (options.cache === undefined) {
                cache = params.settings['view cache'];
            }
        }

        return languageContext.templateConfig.setCacheTemporal(cache, function () {
            //console.log(options.path);
            //console.log(options.root);
            var templateParser = registryTemplateParser[options.root];

            if (options.path === undefined) {
                if (options.content === undefined)
                    throw (new Error("No content or path"));
                return templateParser.compileAndRenderStringToString(options.content, params);
            } else {
                if (absolutePath) {
                    return templateParser.compileAndRenderToString(options.path, params);
                } else {
                    var path = normalizePath(options.path);
                    var root = normalizePath(options.root);
                    if (!path.match(/[\/\\]/))
                        path = normalizePath(root + '/' + path);
                    if (path.indexOf(root) !== 0)
                        throw (new Error("Path '" + path + "' not inside root '" + root + "'"));
                    return templateParser.compileAndRenderToString(path.substr(root.length), params);
                }
            }
        });
    };
}

var rootPathCache = {};

function internalRenderSync(filename, options /*IOptionsExpress*/ , absolutePath) {
    //console.log(filename);
    //console.log(options);
    //console.log(options._locals);
    //console.log(callback);
    if (typeof absolutePath === "undefined") { absolutePath = false; }
    options = options || {};
    if (options.settings === undefined)
        options.settings = {};

    var rootPath = options.settings['views'] || '.';
    if (rootPathCache[rootPath] === undefined)
        rootPathCache[rootPath] = fs.realpathSync(rootPath);

    var params = {
        path: filename,
        root: rootPathCache[rootPath],
        cache: options.cache,
        content: options.content
    };

    return internalCompile(params, absolutePath)(options);
}

function internalRenderAsync(filename, options /*IOptionsExpress*/ , done, absolutePath) {
    if (typeof absolutePath === "undefined") { absolutePath = false; }
    var result = internalRenderSync(filename, options, absolutePath);
    done(result);
}

function internalCompileString(content, options) {
    return function (params) {
        //console.log('content: ' + JSON.stringify(content));
        //console.log('options: ' + JSON.stringify(options));
        //console.log('params: ' + JSON.stringify(params));
        params.content = content;
        params.path = params.filename;
        return internalRenderSync(params.filename, params, true);
    };
}
exports.internalCompileString = internalCompileString;

function express2Compile(templateString, options) {
    options = options || {};
    if (options.settings === undefined)
        options.settings = {};
    return exports.internalCompileString(templateString, options.settings['atpl options']);
}
exports.express2Compile = express2Compile;

/**
*
* @param filename
* @param options
* @param callback
*/
function express3RenderFile(filename, options /*IOptionsExpress*/ , callback) {
    // handle callback in options
    if ('function' == typeof options) {
        callback = options;
        options = {};
    }

    try  {
        internalRenderAsync(filename, options, function (result) {
            callback(null, result);
        });
    } catch (err) {
        callback(err, undefined);
    }
}
exports.express3RenderFile = express3RenderFile;

function registerExtension(items) {
    return languageContext.registerExtension(items);
}
exports.registerExtension = registerExtension;
function registerTags(items) {
    return languageContext.registerTags(items);
}
exports.registerTags = registerTags;
function registerFunctions(items) {
    return languageContext.registerFunctions(items);
}
exports.registerFunctions = registerFunctions;
function registerFilters(items) {
    return languageContext.registerFilters(items);
}
exports.registerFilters = registerFilters;
function registerTests(items) {
    return languageContext.registerTests(items);
}
exports.registerTests = registerTests;

//Express 2x template engine compatibility required the following module export:
//
//exports.compile = function(templateString, options) {
//  return a Function;
//};
exports.compile = exports.express2Compile;

//Express 3x template engines should export the following:
//
//exports.__express = function(filename, options, callback) {
//  callback(err, string);
//};
exports.__express = exports.express3RenderFile;
