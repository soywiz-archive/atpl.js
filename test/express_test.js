var assert = require('assert')
var fs = require('fs')
var express = require('express');
var atpl = require('../lib/atpl')
describe('__express', function () {
    it('test cache:true for express', function () {
        var tmpFile = __dirname + '/__temp.tpl';
        fs.writeFileSync(tmpFile, '123');
        atpl.__express(tmpFile, {
            cache: true
        }, function (err, data) {
            fs.unlinkSync(tmpFile);
            assert.equal('123', data);
            fs.writeFileSync(tmpFile, '000');
            atpl.__express(tmpFile, {
                cache: true
            }, function (err, data) {
                fs.unlinkSync(tmpFile);
                assert.equal('123', data);
            });
        });
    });
});
//@ sourceMappingURL=express_test.js.map
