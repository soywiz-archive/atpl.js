///<reference path='./imports.d.ts'/>

import utils  = module('../lib/utils');
import assert = module('assert');

describe('utils', () => {
	it('simple normalize path', () => {
		assert.equal(utils.normalizePath('/this/is//a/path/../test'), '/this/is/a/test');
		assert.equal(utils.normalizePath('this/is//a/path/../test'), 'this/is/a/test');
		assert.equal(utils.normalizePath('../../'), '');
		assert.equal(utils.normalizePath('C:\\htdocs\\atpl.js\\benchmarks/../test/templates'), 'C:/htdocs/atpl.js/test/templates');
		
	});
	it('path is inside', () => {
		assert.equal(true, utils.pathIsInside('/base', '/base'));
		assert.equal(true, utils.pathIsInside('/base/', '/base/'));
		assert.equal(true, utils.pathIsInside('/base', '/base/test'));
		assert.equal(true, utils.pathIsInside('/base', '/base/demo/../test'));
		assert.equal(false, utils.pathIsInside('/base', '/base/../test'));
		assert.equal(false, utils.pathIsInside('/base', '/base2'));
		assert.equal(false, utils.pathIsInside('/base/', '/base2/'));
	});
	it('interpretNumber', () => {
		assert.equal(0    , utils.interpretNumber('0'));
		assert.equal(10   , utils.interpretNumber('10'));
		assert.equal(0x10 , utils.interpretNumber('0x10'));
		//assert.equal(0777 , utils.interpretNumber('0777'));
		assert.equal(511, utils.interpretNumber('0777'));
		assert.equal(7    , utils.interpretNumber('0b111'));
		assert.equal(11.7 , utils.interpretNumber('11.7'));
		assert.equal(0x333, utils.interpretNumber('333', 16));
	});
});
