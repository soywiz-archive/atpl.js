var fs = require('fs')

var utils = require('./utils')
var FileSystemTemplateProvider = (function () {
    function FileSystemTemplateProvider(basePath, cache) {
        if (typeof cache === "undefined") { cache = true; }
        this.cache = cache;
        this.cacheObject = {
        };
        this.basePath = utils.normalizePath(basePath);
        this.basePathComponents = this.basePath.split('/');
    }
    FileSystemTemplateProvider.prototype.getSync = function (path) {
        if(this.cacheObject[path] === undefined) {
            var normalizedPath = utils.normalizePath(this.basePath + '/' + path);
            if(normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
                throw (new Error("Outside the Base Path"));
            }
            this.cacheObject[path] = fs.readFileSync(normalizedPath, 'utf-8').replace(/^\uFEFF/, '');
        }
        return this.cacheObject[path];
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
