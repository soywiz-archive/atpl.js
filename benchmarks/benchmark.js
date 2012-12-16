

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
app.set('views', __dirname + '/views');
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
var totalRequests = 1000;
var test = supertest(app);
function measure(path, done) {
    var start = moment();
    var requestCount = 0;
    function doRequest() {
        requestCount++;
        test.get(path).end(function (err, res) {
            if(requestCount > totalRequests) {
                var end = moment();
                console.log(path + ':' + end.diff(start));
                console.log(res.text);
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
