var TemplateParser = require('./parser/TemplateParser')
var TemplateProvider = require('./TemplateProvider')
var FileSystemTemplateProvider = TemplateProvider.FileSystemTemplateProvider;
var registryTemplateParser = {
};
function internalCompile(options) {
    if(registryTemplateParser[options.root] === undefined) {
        registryTemplateParser[options.root] = new TemplateParser.TemplateParser(new FileSystemTemplateProvider(options.root, options.cache));
    }
    return function (params) {
        return registryTemplateParser[options.root].compileAndRenderToString(options.path.substr(options.root.length), params);
    }
}
function internalCompileString(content, options) {
    return function (params) {
        throw (new Error("Not implemented internalCompileString"));
        return "";
    }
}
exports.internalCompileString = internalCompileString;
function express2Compile(templateString, options) {
    return internalCompileString(templateString, options.settings['atpl options']);
}
exports.express2Compile = express2Compile;
function express3RenderFile(filename, options, callback) {
    if('function' == typeof options) {
        callback = options;
        options = {
        };
    }
    options = options || {
    };
    var params = {
        path: filename,
        base: options.settings['views'],
        load: function (template) {
            callback(null, template.render(options));
        }
    };
    var view_options = options.settings['atpl options'];
    try  {
        var func = internalCompile(params);
        var output = func({
        });
        callback(null, output);
    } catch (e) {
        callback(e, '');
    }
}
exports.compile = express2Compile;
exports.__express = express3RenderFile;
