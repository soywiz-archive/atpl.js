///<reference path='./imports.d.ts'/>
var assert = require('assert');
var atpl = require('../lib/atpl');
describe('standalone renderFile', function () {
    it('renderFileSync simple', function () {
        assert.equal('Hello test1!', atpl.renderFileSync(__dirname + '/templates', 'simple.html', { name: 'test1' }, false));
    });
    it('renderFile simple', function (done) {
        atpl.renderFile(__dirname + '/templates', 'simple.html', { name: 'test1' }, false, function (err, result) {
            assert.equal('Hello test1!', result);
            done();
        });
    });
});
