///<reference path='./imports.d.ts'/>

import assert = require('assert');
import atpl = require('../lib/atpl');

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
} );
