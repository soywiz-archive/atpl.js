///<reference path='../_typings.d.ts'/>
import util = require("util");
import express = require("express");
import atpl = require('../lib/atpl');
import supertest = require('supertest');
import moment = require('moment');
import async = require('async');

var app: express.Application = express();

declare var setImmediate: (callback) => void;

function nextTick(callback: () => void ): void {
	if (setImmediate !== undefined) {
		setImmediate(callback);
	} else {
		//setTimeout(callback, 0);
		process.nextTick(callback);
	}
}

app.engine('html', atpl.__express);
app.set('devel', false);
app.set('view engine', 'html');
app.set('view cache', true);
app.set('views', __dirname + '/../test/templates');

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

var startMeasure = 200;
var totalRequests = 2000;
var test = supertest(app);

function roundDecimals(number: number, decimals: number) {
	var disp = Math.pow(10, decimals);
	return Math.round(number * disp) / disp;
}

function measure(path, done) {
	var start = (<any>moment)();
	var requestCount = 0;
	var measure = true;

	function doRequest() {
		requestCount++;

		test
			.get(path)
			.end((err, res) => {
				if (requestCount == startMeasure) {
                    start = (<any>moment)();
				}
				if (requestCount > totalRequests) {
                    var end = (<any>moment)();
					if (measure) {
						var measuredRequests = (totalRequests - startMeasure);
						console.log(path + '(' + measuredRequests + '): total: ' + end.diff(start) + 'ms; per request: ' + roundDecimals(end.diff(start) / measuredRequests, 3) + "ms");
						//console.log(res.text);
					}
					return done();
				} else {
					nextTick(doRequest);
				}
			})
		;
	}

	nextTick(doRequest);
}

async.series([
	(done) => { measure('/raw', done); },
	(done) => { measure('/simple', done); },
	(done) => { measure('/for', done); },
	(done) => { measure('/simple_extends', done); },
], () => {
	process.exit(0);
});
