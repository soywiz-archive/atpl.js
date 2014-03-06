///<reference path='./imports.d.ts'/>
var assert = require('assert');
var atpl = require('../lib/atpl');

describe('express3', function () {
    it('invalid should fail', function (done) {
        atpl.__express('invalid.html', {
            settings: {
                views: __dirname + '/templates'
            },
            cache: false
        }, function (err, output) {
            assert.equal(String(err), "Error: Unexpected end of 'block' no any of ['endblock']");
            done();
        });
    });
});
