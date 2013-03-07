///<reference path='./imports.d.ts'/>

import assert = module('assert');
import atpl = module('../lib/atpl');

describe('express3', () => {
	it('invalid should fail', (done) => {
		atpl.__express('invalid.html', {
			settings: {
				views: __dirname + '/templates',
			},
			cache: false,
		}, (err, output?) => {
			assert.equal(String(err), "Error: Unexpected end of 'block' no any of ['endblock']");
			done();
		});
	});
});
