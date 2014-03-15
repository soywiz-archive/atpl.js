///<reference path='./imports.d.ts'/>

import assert = require('assert');
import atpl = require('../lib/atpl');

describe('standalone renderFile', () => {
    it('renderFileSync simple', () => {
        assert.equal('Hello test1!', atpl.renderFileSync(__dirname + '/templates', 'simple.html', { name: 'test1' }, false));
	});
    it('renderFile simple', (done) => {
        atpl.renderFile(__dirname + '/templates', 'simple.html', { name: 'test1' }, false, (err, result) => {
            assert.equal('Hello test1!', result);
            done();
        });
    });
} );
