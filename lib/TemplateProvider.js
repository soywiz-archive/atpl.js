var fs = require('fs')

var utils = require('./utils')
var FileSystemTemplateProvider = (function () {
    function FileSystemTemplateProvider(basePath, cache) {
        if(cache === undefined) {
            cache = true;
        }
        this.basePath = utils.normalizePath(basePath);
        this.basePathComponents = this.basePath.split('/');
        this.cache = cache;
        this.registry = {
        };
    }
    FileSystemTemplateProvider.prototype.getAsync = function (path, callback) {
        var normalizedPath = utils.normalizePath(this.basePath + '/' + path);
        if(normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
            throw (new Error("Outside the Base Path"));
        }
        fs.readFile(normalizedPath, 'utf-8', function (err, data) {
            if(err) {
                throw err;
            }
            callback(data);
        });
    };
    FileSystemTemplateProvider.prototype.getSync = function (path) {
        var normalizedPath = utils.normalizePath(this.basePath + '/' + path);
        if(normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
            throw (new Error("Outside the Base Path"));
        }
        return fs.readFileSync(normalizedPath, 'utf-8');
    };
    return FileSystemTemplateProvider;
})();
exports.FileSystemTemplateProvider = FileSystemTemplateProvider;
var MemoryTemplateProvider = (function () {
    function MemoryTemplateProvider() {
        this.registry = {
        };
    }
    MemoryTemplateProvider.prototype.add = function (path, data) {
        this.registry[path] = data;
    };
    MemoryTemplateProvider.prototype.getAsync = function (path, callback) {
        callback(this.getSync(path));
    };
    MemoryTemplateProvider.prototype.getSync = function (path) {
        var data = this.registry[path];
        if(data === undefined) {
            throw (new Error("Can't find key '" + path + "'"));
        }
        return data;
    };
    return MemoryTemplateProvider;
})();
exports.MemoryTemplateProvider = MemoryTemplateProvider;
