var assert = require('assert');
var express = require("express");
var atpl = require('../lib/atpl.js');
var fs = require('fs');

describe('__express', function () {
	it('test cache:true for express', function () {
		var tmpFile = __dirname + '/__temp.tpl';
		fs.writeFileSync(tmpFile, '123');
		atpl.__express(tmpFile, { cache: true }, function (err, data) {
			//console.log(err);
			fs.unlink(tmpFile);
			assert.equal('123', data);
			fs.writeFileSync(tmpFile, '000');
			atpl.__express(tmpFile, { cache: true }, function (err, data) {
				fs.unlink(tmpFile);
				assert.equal('123', data);
			});
		});
	});
});