var TemplateParser = require('./parser/TemplateParser')
var TemplateProvider = require('./TemplateProvider')
var LanguageContext = require('./LanguageContext')
var Default = require('./lang/Default')
var fs = require('fs')
var FileSystemTemplateProvider = TemplateProvider.FileSystemTemplateProvider;
var isWin = !!process.platform.match(/^win/);
function normalizePath(path) {
    path = path.replace(/\\/g, '/');
    if(isWin && path.match(/^[A-Za-z]:\//)) {
        path = path.substr(0, 1).toLowerCase() + path.substr(1);
    }
    return path;
}
var registryTemplateParser = {
};
var languageContext = new LanguageContext.LanguageContext();
Default.register(languageContext);
function internalCompile(options, absolutePath) {
    if (typeof absolutePath === "undefined") { absolutePath = false; }
    if(options.root === undefined) {
        options.root = '';
    }
    if(registryTemplateParser[options.root] === undefined) {
        var templateParser = new TemplateParser.TemplateParser(new FileSystemTemplateProvider(options.root), languageContext);
        registryTemplateParser[options.root] = templateParser;
    }
    return function (params) {
        var cache = options.cache;
        if(params && params.settings) {
            if(options.cache === undefined) {
                cache = params.settings['view cache'];
            }
        }
        return languageContext.templateConfig.setCacheTemporal(cache, function () {
            var templateParser = registryTemplateParser[options.root];
            if(options.path === undefined) {
                if(options.content === undefined) {
                    throw (new Error("No content or path"));
                }
                return templateParser.compileAndRenderStringToString(options.content, params);
            } else {
                if(absolutePath) {
                    return templateParser.compileAndRenderToString(options.path, params);
                } else {
                    var path = normalizePath(options.path);
                    var root = normalizePath(options.root);
                    if(!path.match(/[\/\\]/)) {
                        path = normalizePath(root + '/' + path);
                    }
                    if(path.indexOf(root) !== 0) {
                        throw (new Error("Path '" + path + "' not inside root '" + root + "'"));
                    }
                    return templateParser.compileAndRenderToString(path.substr(root.length), params);
                }
            }
        });
    };
}
var rootPathCache = {
};
function internalRenderSync(filename, options, absolutePath) {
    if (typeof absolutePath === "undefined") { absolutePath = false; }
    options = options || {
    };
    if(options.settings === undefined) {
        options.settings = {
        };
    }
    var rootPath = options.settings['views'] || '.';
    if(rootPathCache[rootPath] === undefined) {
        rootPathCache[rootPath] = fs.realpathSync(rootPath);
    }
    var params = {
        path: filename,
        root: rootPathCache[rootPath],
        cache: options.cache,
        content: options.content
    };
    return internalCompile(params, absolutePath)(options);
}
function internalRenderAsync(filename, options, done, absolutePath) {
    if (typeof absolutePath === "undefined") { absolutePath = false; }
    var result = internalRenderSync(filename, options, absolutePath);
    done(result);
}
function internalCompileString(content, options) {
    return function (params) {
        params.content = content;
        params.path = params.filename;
        return internalRenderSync(params.filename, params, true);
    };
}
exports.internalCompileString = internalCompileString;
function express2Compile(templateString, options) {
    options = options || {
    };
    if(options.settings === undefined) {
        options.settings = {
        };
    }
    return internalCompileString(templateString, options.settings['atpl options']);
}
exports.express2Compile = express2Compile;
function express3RenderFile(filename, options, callback) {
    if('function' == typeof options) {
        callback = options;
        options = {
        };
    }
    try  {
        internalRenderAsync(filename, options, function (result) {
            return callback(null, result);
        });
    } catch (err) {
        return callback(err, undefined);
    }
}
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
exports.compile = express2Compile;
exports.__express = express3RenderFile;
