///<reference path='./imports.d.ts'/>

import assert = module('assert');
import fs = module('fs');

import RuntimeUtils = module('../lib/runtime/RuntimeUtils');

describe('RuntimeUtils', () => {
	it('sprintf', () => {
		assert.equal(RuntimeUtils.sprintf('Hello %03d %s', 10, 'World'), 'Hello 010 World');
	});
	it('date', () => {
		assert.equal(RuntimeUtils.date('d-m-Y', new Date(2010, 3 - 1, 1)), '01-03-2010');
	});
});
