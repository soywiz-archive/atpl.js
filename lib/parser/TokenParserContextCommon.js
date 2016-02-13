///<reference path='../imports.d.ts'/>
var RuntimeUtils = require('../runtime/RuntimeUtils');
var TokenParserContextCommon = (function () {
    function TokenParserContextCommon(info) {
        if (info === void 0) { info = {}; }
        this.sandbox = false;
        if (RuntimeUtils.isObject(info))
            for (var key in info)
                this[key] = info[key];
    }
    TokenParserContextCommon.prototype.serialize = function () {
        var ret = {};
        for (var key in this)
            ret[key] = this[key];
        return ret;
    };
    TokenParserContextCommon.prototype.setSandbox = function (callback) {
        this.sandbox = true;
        try {
            callback();
        }
        finally {
            this.sandbox = false;
        }
    };
    return TokenParserContextCommon;
})();
exports.TokenParserContextCommon = TokenParserContextCommon;
