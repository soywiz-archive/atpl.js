var fs = require('fs')

var RuntimeUtils = require('./runtime/RuntimeUtils')
var FileSystemTemplateProvider = (function () {
    function FileSystemTemplateProvider(basePath) {
        this.cacheObject = {
        };
        this.basePath = RuntimeUtils.normalizePath(basePath);
        this.basePathComponents = this.basePath.split('/');
    }
    FileSystemTemplateProvider.prototype.getSync = function (path, cache) {
        if(!cache) {
            delete this.cacheObject[path];
        }
        if(this.cacheObject[path] === undefined) {
            var normalizedPath = RuntimeUtils.normalizePath(this.basePath + '/' + path);
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
        this.registryCached = {
        };
    }
    MemoryTemplateProvider.prototype.add = function (path, data) {
        this.registry[path] = data;
    };
    MemoryTemplateProvider.prototype.getSync = function (path, cache) {
        if(!cache) {
            delete this.registryCached[path];
        }
        if(this.registryCached[path] === undefined) {
            this.registryCached[path] = this.registry[path];
        }
        var data = this.registryCached[path];
        if(data === undefined) {
            throw (new Error("Can't find key '" + path + "'"));
        }
        return data;
    };
    return MemoryTemplateProvider;
})();
exports.MemoryTemplateProvider = MemoryTemplateProvider;
