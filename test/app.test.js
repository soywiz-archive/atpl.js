var assert = require('assert');
var express = require("express");
var supertest = require('supertest');
var moment = require('moment');
var async = require('async');
var app = express();

app.engine('html', require('../lib/atpl').__express);
app.set('devel', false);
app.set('view engine', 'html');
app.set('view cache', true);
app.set('views', __dirname + '/../test/templates');

app.get('/simple', function(req, res) {
	res.render('simple', { name : 'Test' });
});

var test = supertest(app);

describe('app', function() {
	it('should work', function(done) {
		test
			.get('/simple')
			.end(function(err, res) {
				assert.equal(res.text, 'Hello Test!');
				done();
			})
		;
	});
});
