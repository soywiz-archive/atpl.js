"use strict";
var MemoryTemplateProvider = (function () {
    function MemoryTemplateProvider() {
        this.registry = {};
        this.registryCached = {};
    }
    MemoryTemplateProvider.prototype.add = function (path, data) {
        this.registry[path] = data;
    };
    MemoryTemplateProvider.prototype.getSync = function (path, cache) {
        if (!cache)
            delete this.registryCached[path];
        if (this.registryCached[path] === undefined)
            this.registryCached[path] = this.registry[path];
        var data = this.registryCached[path];
        if (data === undefined)
            throw (new Error("Can't find key '" + path + "'"));
        return data;
    };
    return MemoryTemplateProvider;
}());
exports.MemoryTemplateProvider = MemoryTemplateProvider;
