///<reference path='imports.d.ts'/>
"use strict";
var TemplateConfig = (function () {
    function TemplateConfig(cache) {
        if (cache === void 0) { cache = true; }
        this.cache = cache;
    }
    TemplateConfig.prototype.setCacheTemporal = function (value, callback) {
        var oldValue = this.cache;
        this.cache = value;
        try {
            return callback();
        }
        finally {
            this.cache = oldValue;
        }
    };
    TemplateConfig.prototype.getCache = function () {
        return this.cache;
    };
    return TemplateConfig;
}());
exports.TemplateConfig = TemplateConfig;
