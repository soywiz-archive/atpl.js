var TemplateConfig = require('./TemplateConfig')
var LanguageContext = (function () {
    function LanguageContext(templateConfig) {
        if (typeof templateConfig === "undefined") { templateConfig = undefined; }
        this.templateConfig = templateConfig;
        this.tags = {
        };
        this.functions = {
        };
        this.filters = {
        };
        this.tests = {
        };
        if(this.templateConfig === undefined) {
            this.templateConfig = new TemplateConfig.TemplateConfig(true);
        }
    }
    LanguageContext.prototype._registerSomethingItem = function (object, key, value) {
        object[key.replace(/^\$+/, '')] = value;
    };
    LanguageContext.prototype._registerSomething = function (object, list) {
        if(list !== undefined) {
            for(var key in list) {
                this._registerSomethingItem(object, key, list[key]);
            }
        }
    };
    LanguageContext.prototype.registerExtension = function (container) {
        this.registerTags(container.tags);
        this.registerFunctions(container.functions);
        this.registerFilters(container.filters);
        this.registerTests(container.tests);
    };
    LanguageContext.prototype.registerTags = function (tags) {
        this._registerSomething(this.tags, tags);
    };
    LanguageContext.prototype.registerFunctions = function (functions) {
        this._registerSomething(this.functions, functions);
    };
    LanguageContext.prototype.registerFilters = function (filters) {
        this._registerSomething(this.filters, filters);
    };
    LanguageContext.prototype.registerTests = function (tests) {
        this._registerSomething(this.tests, tests);
    };
    return LanguageContext;
})();
exports.LanguageContext = LanguageContext;
