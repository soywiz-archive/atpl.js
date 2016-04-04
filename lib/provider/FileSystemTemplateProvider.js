"use strict";
var fs = require('fs');
var RuntimeUtils = require('../runtime/RuntimeUtils');
var FileSystemTemplateProvider = (function () {
    function FileSystemTemplateProvider(basePath) {
        this.cacheObject = {};
        this.basePath = RuntimeUtils.normalizePath(basePath);
        this.basePathComponents = this.basePath.split('/');
        //console.log(this.basePath);
        //process.exit(0);
    }
    FileSystemTemplateProvider.prototype.getSync = function (path, cache) {
        if (!cache)
            delete this.cacheObject[path];
        //console.log(path);
        if (this.cacheObject[path] === undefined) {
            var normalizedPath = RuntimeUtils.normalizePath(path);
            if (normalizedPath.indexOf(this.basePath) === -1) {
                normalizedPath = this.basePath + '/' + normalizedPath;
            }
            if (normalizedPath.split('/').slice(0, this.basePathComponents.length) == this.basePathComponents) {
                throw (new Error("Outside the Base Path"));
            }
            this.cacheObject[path] = fs.readFileSync(normalizedPath, 'utf-8').replace(/^\uFEFF/, '');
        }
        return this.cacheObject[path];
    };
    return FileSystemTemplateProvider;
}());
exports.FileSystemTemplateProvider = FileSystemTemplateProvider;
