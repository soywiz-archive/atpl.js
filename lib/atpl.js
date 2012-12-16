var TemplateParser = require('./parser/TemplateParser')
var TemplateProvider = require('./TemplateProvider')
var fs = require('fs')
var FileSystemTemplateProvider = TemplateProvider.FileSystemTemplateProvider;
var registryTemplateParser = {
};
function internalCompile(options) {
    if(registryTemplateParser[options.root] === undefined) {
        registryTemplateParser[options.root] = new TemplateParser.TemplateParser(new FileSystemTemplateProvider(options.root, options.cache));
    }
    return function (params) {
        if(options.path.indexOf(options.root) !== 0) {
            throw (new Error("Path '" + options.path + "' not inside root '" + options.root + "'"));
        }
        return registryTemplateParser[options.root].compileAndRenderToString(options.path.substr(options.root.length), params);
    }
}
function internalCompileString(content, options) {
    return function (params) {
        throw (new Error("Not implemented internalCompileString"));
    }
}
exports.internalCompileString = internalCompileString;
function express2Compile(templateString, options) {
    return internalCompileString(templateString, options.settings['atpl options']);
}
exports.express2Compile = express2Compile;
var rootPathCache = {
};
function express3RenderFile(filename, options, callback) {
    if('function' == typeof options) {
        callback = options;
        options = {
        };
    }
    options = options || {
    };
    var rootPath = options.settings['views'];
    if(rootPathCache[rootPath] === undefined) {
        rootPathCache[rootPath] = fs.realpathSync(rootPath);
    }
    var params = {
        path: filename,
        root: rootPathCache[rootPath],
        cache: options.cache
    };
    try  {
        var func = internalCompile(params);
        var output = func(options);
        callback(null, output);
    } catch (e) {
        callback(e, '');
    }
}
exports.compile = express2Compile;
exports.__express = express3RenderFile;
