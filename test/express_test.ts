///<reference path='./imports.d.ts'/>

import assert = module('assert');
import fs = module('fs');
var express = require('express');
import atpl = module('../lib/atpl');

describe('__express', function () {
	it('test cache:true for express', function () {
		var tmpFile = __dirname + '/__temp.tpl';
		fs.writeFileSync(tmpFile, '123');
		atpl.__express(tmpFile, { cache: true }, (err, data?) => {
			//console.log(err);
			fs.unlinkSync(tmpFile);
			assert.equal('123', data);
			fs.writeFileSync(tmpFile, '000');
			atpl.__express(tmpFile, { cache: true }, (err, data?) => {
				fs.unlinkSync(tmpFile);
				assert.equal('123', data);
			});
		});
	});
});
