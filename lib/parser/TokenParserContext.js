///<reference path='../imports.d.ts'/>
"use strict";
var RuntimeUtils = require('../runtime/RuntimeUtils');
var TokenParserContext = (function () {
    function TokenParserContext(common, sandboxPolicy) {
        this.common = common;
        this.sandboxPolicy = sandboxPolicy;
        this.blocksOutput = {};
        this.macrosOutput = {};
        this.afterMainNodes = [];
    }
    TokenParserContext.prototype.iterateBlocks = function (callback) {
        for (var name in this.blocksOutput)
            callback(this.blocksOutput[name], name);
    };
    TokenParserContext.prototype.iterateMacros = function (callback) {
        for (var name in this.macrosOutput)
            callback(this.macrosOutput[name], name);
    };
    TokenParserContext.prototype.iterateAfterMainNodes = function (callback) {
        this.afterMainNodes.forEach(callback);
    };
    TokenParserContext.prototype.setBlock = function (blockName, node) {
        return this.blocksOutput[blockName] = node;
    };
    TokenParserContext.prototype.setMacro = function (macroName, node) {
        return this.macrosOutput[macroName] = node;
    };
    TokenParserContext.prototype.addAfterMainNode = function (node) {
        this.afterMainNodes.push(node);
    };
    return TokenParserContext;
}());
exports.TokenParserContext = TokenParserContext;
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
}());
exports.TokenParserContextCommon = TokenParserContextCommon;
