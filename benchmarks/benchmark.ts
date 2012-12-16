///<reference path='../lib/imports.d.ts'/>
///<reference path='../typescript-node-definitions/express3.d.ts'/>
///<reference path='../typescript-node-definitions/supertest.d.ts'/>
///<reference path='../typescript-node-definitions/moment.d.ts'/>
///<reference path='../typescript-node-definitions/async.d.ts'/>
import util = module("util");
import express3 = module("express3");
import atpl = module('../lib/atpl');
import supertest = module('supertest');
import moment = module('moment');
import async = module('async');

var express = require('express');
var app:express3.Application = express();

app.engine('html', atpl.__express);
app.set('devel', false);
app.set('view engine', 'html');
app.set('view cache', true);
app.set('views', __dirname + '/views');

app.get('/raw', (req, res) => {
	//res.render('simple', { name : 'Test' });
	res.send('Hello Test!');
});

app.get('/simple', (req, res) => {
	res.render('simple', { name : 'Test' });
});

app.get('/for', (req, res) => {
	res.render('for', { });
});

app.get('/simple_extends', (req, res) => {
	res.render('simple_extends', { });
});

var totalRequests = 1000;
var test = supertest(app);

function measure(path, done) {
	var start = moment();
	var requestCount = 0;

	function doRequest() {
		requestCount++;

		test
			.get(path)
			.end((err, res) => {
				if (requestCount > totalRequests) {
					var end = moment();
					console.log(path + ':' + end.diff(start));
					//console.log(res.text);
					return done();
				} else {
					process.nextTick(doRequest);
				}
			})
		;
	}

	process.nextTick(doRequest);
}

async.series([
	(done) => { measure('/raw', done); },
	(done) => { measure('/simple', done); },
	(done) => { measure('/for', done); },
	(done) => { measure('/simple_extends', done); },
], () => {
	process.exit(0);
});
