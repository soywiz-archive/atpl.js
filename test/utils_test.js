///<reference path='./imports.d.ts'/>
var RuntimeUtils = require('../lib/runtime/RuntimeUtils');
var assert = require('assert');

describe('utils', function () {
    it('simple normalize path', function () {
        assert.equal(RuntimeUtils.normalizePath('/this/is//a/path/../test'), '/this/is/a/test');
        assert.equal(RuntimeUtils.normalizePath('this/is//a/path/../test'), 'this/is/a/test');
        assert.equal(RuntimeUtils.normalizePath('../../'), '');
        assert.equal(RuntimeUtils.normalizePath('C:\\htdocs\\atpl.js\\benchmarks/../test/templates'), 'C:/htdocs/atpl.js/test/templates');
    });
    it('path is inside', function () {
        assert.equal(true, RuntimeUtils.pathIsInside('/base', '/base'));
        assert.equal(true, RuntimeUtils.pathIsInside('/base/', '/base/'));
        assert.equal(true, RuntimeUtils.pathIsInside('/base', '/base/test'));
        assert.equal(true, RuntimeUtils.pathIsInside('/base', '/base/demo/../test'));
        assert.equal(false, RuntimeUtils.pathIsInside('/base', '/base/../test'));
        assert.equal(false, RuntimeUtils.pathIsInside('/base', '/base2'));
        assert.equal(false, RuntimeUtils.pathIsInside('/base/', '/base2/'));
    });
    it('interpretNumber', function () {
        assert.equal(0, RuntimeUtils.interpretNumber('0'));
        assert.equal(10, RuntimeUtils.interpretNumber('10'));
        assert.equal(0x10, RuntimeUtils.interpretNumber('0x10'));

        //assert.equal(0777 , RuntimeUtils.interpretNumber('0777'));
        assert.equal(511, RuntimeUtils.interpretNumber('0777'));
        assert.equal(7, RuntimeUtils.interpretNumber('0b111'));
        assert.equal(11.7, RuntimeUtils.interpretNumber('11.7'));
        assert.equal(0x333, RuntimeUtils.interpretNumber('333', 16));
    });
});
