

var atpl = require('../lib/atpl')
var supertest = require('supertest')
var moment = require('moment')
var async = require('async')
var express = require('express');
var app = express();
app.engine('html', atpl.__express);
app.set('devel', false);
app.set('view engine', 'html');
app.set('view cache', true);
app.set('views', __dirname + '/../test/templates');
app.get('/raw', function (req, res) {
    res.send('Hello Test!');
});
app.get('/simple', function (req, res) {
    res.render('simple', {
        name: 'Test'
    });
});
app.get('/for', function (req, res) {
    res.render('for', {
    });
});
app.get('/simple_extends', function (req, res) {
    res.render('simple_extends', {
    });
});
var startMeasure = 200;
var totalRequests = 2000;
var test = supertest(app);
function roundDecimals(number, decimals) {
    var disp = Math.pow(10, decimals);
    return Math.round(number * disp) / disp;
}
function measure(path, done) {
    var start = moment();
    var requestCount = 0;
    var measure = true;
    function doRequest() {
        requestCount++;
        test.get(path).end(function (err, res) {
            if(requestCount == startMeasure) {
                start = moment();
            }
            if(requestCount > totalRequests) {
                var end = moment();
                if(measure) {
                    var measuredRequests = (totalRequests - startMeasure);
                    console.log(path + '(' + measuredRequests + '): total: ' + end.diff(start) + 'ms; per request: ' + roundDecimals(end.diff(start) / measuredRequests, 3) + "ms");
                }
                return done();
            } else {
                process.nextTick(doRequest);
            }
        });
    }
    process.nextTick(doRequest);
}
async.series([
    function (done) {
        measure('/raw', done);
    }, 
    function (done) {
        measure('/simple', done);
    }, 
    function (done) {
        measure('/for', done);
    }, 
    function (done) {
        measure('/simple_extends', done);
    }, 
    
], function () {
    process.exit(0);
});
