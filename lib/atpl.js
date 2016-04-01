///<reference path='imports.d.ts'/>
"use strict";
var FileSystemTemplateProvider_1 = require('./provider/FileSystemTemplateProvider');
var LanguageContext_1 = require('./LanguageContext');
var TemplateParser_1 = require('./parser/TemplateParser');
var Default = require('./lang/Default');
var fs = require('fs');
var isWin = !!process.platform.match(/^win/);
function normalizePath(path) {
    path = path.replace(/\\/g, '/');
    if (isWin && path.match(/^[A-Za-z]:\//)) {
        path = path.substr(0, 1).toLowerCase() + path.substr(1);
    }
    return path;
}
var registryTemplateParser = {};
var languageContext = new LanguageContext_1.LanguageContext();
Default.register(languageContext);
function internalCompile(options, absolutePath) {
    if (absolutePath === void 0) { absolutePath = false; }
    if (options.root === undefined)
        options.root = '';
    // options.cache
    if (registryTemplateParser[options.root] === undefined) {
        var templateParser = new TemplateParser_1.TemplateParser(new FileSystemTemplateProvider_1.FileSystemTemplateProvider(options.root), languageContext);
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
            }
            else {
                if (absolutePath) {
                    return templateParser.compileAndRenderToString(options.path, params);
                }
                else {
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
function internalRenderSync(filename, options /*IOptionsExpress*/, absolutePath) {
    //console.log(filename);
    //console.log(options);
    //console.log(options._locals);
    //console.log(callback);
    if (absolutePath === void 0) { absolutePath = false; }
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
        content: options.content,
    };
    return internalCompile(params, absolutePath)(options);
}
function internalRenderAsync(filename, options /*IOptionsExpress*/, done, absolutePath) {
    if (absolutePath === void 0) { absolutePath = false; }
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
    return internalCompileString(templateString, options.settings['atpl options']);
}
exports.express2Compile = express2Compile;
/**
 *
 * @param filename
 * @param options
 * @param callback
 */
function express3RenderFile(filename, options /*IOptionsExpress*/, callback) {
    // handle callback in options
    if ('function' == typeof options) {
        callback = options;
        options = {};
    }
    try {
        internalRenderAsync(filename, options, function (result) {
            callback(null, result);
        });
    }
    catch (err) {
        callback(err, undefined);
    }
}
exports.express3RenderFile = express3RenderFile;
/**
 *
 */
function renderFileSync(viewsPath, filename, parameters, cache) {
    if (parameters === void 0) { parameters = {}; }
    if (cache === void 0) { cache = true; }
    if (registryTemplateParser[viewsPath] === undefined) {
        registryTemplateParser[viewsPath] = new TemplateParser_1.TemplateParser(new FileSystemTemplateProvider_1.FileSystemTemplateProvider(viewsPath), languageContext);
    }
    return languageContext.templateConfig.setCacheTemporal(cache, function () {
        //console.log(options.path);
        //console.log(options.root);
        var templateParser = registryTemplateParser[viewsPath];
        var path = normalizePath(filename);
        var root = normalizePath(viewsPath);
        if (!path.match(/[\/\\]/))
            path = normalizePath(root + '/' + path);
        if (path.indexOf(root) !== 0)
            throw (new Error("Path '" + path + "' not inside root '" + root + "'"));
        return templateParser.compileAndRenderToString(path.substr(root.length), parameters);
    });
}
exports.renderFileSync = renderFileSync;
function renderFile(viewsPath, filename, parameters, cache, done) {
    try {
        var result = renderFileSync(viewsPath, filename, parameters, cache);
        done(null, result);
    }
    catch (e) {
        done(e);
    }
}
exports.renderFile = renderFile;
function registerExtension(items) { return languageContext.registerExtension(items); }
exports.registerExtension = registerExtension;
function registerTags(items) { return languageContext.registerTags(items); }
exports.registerTags = registerTags;
function registerFunctions(items) { return languageContext.registerFunctions(items); }
exports.registerFunctions = registerFunctions;
function registerFilters(items) { return languageContext.registerFilters(items); }
exports.registerFilters = registerFilters;
function registerTests(items) { return languageContext.registerTests(items); }
exports.registerTests = registerTests;
//Express 2x template engine compatibility required the following module export:
//
//exports.compile = function(templateString, options) {
//  return a Function;
//};
exports.compile = express2Compile;
//Express 3x template engines should export the following:
//
//exports.__express = function(filename, options, callback) {
//  callback(err, string);
//};
exports.__express = express3RenderFile;
