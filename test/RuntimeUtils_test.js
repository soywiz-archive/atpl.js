var assert = require('assert')

var RuntimeUtils = require('../lib/runtime/RuntimeUtils')
describe('RuntimeUtils', function () {
    it('sprintf', function () {
        assert.equal(RuntimeUtils.sprintf('Hello %03d %s', 10, 'World'), 'Hello 010 World');
    });
    it('date', function () {
        assert.equal(RuntimeUtils.date('d-m-Y', new Date(2010, 3 - 1, 1)), '01-03-2010');
    });
    it('strtotime', function () {
        assert.equal(RuntimeUtils.date('d-m-Y', RuntimeUtils.strtotime('+2days', new Date(2010, 3 - 1, 1))), '03-03-2010');
    });
    it('strtotime_base_time', function () {
        assert.equal(RuntimeUtils.date('d-m-Y', RuntimeUtils.strtotime('2013-02-09 + 2days')), '11-02-2013');
    });
    it('split', function () {
        assert.equal(JSON.stringify(RuntimeUtils.split('a,b,c,d,e,', ',', 2)), '["a","b,c,d,e,"]');
        assert.equal(JSON.stringify(RuntimeUtils.split('a,b,c,d,e,', ',')), '["a","b","c","d","e",""]');
        assert.equal(JSON.stringify(RuntimeUtils.split('abcde', '')), '["a","b","c","d","e"]');
        assert.equal(JSON.stringify(RuntimeUtils.split('abcde', '', 2)), '["ab","cd","e"]');
    });
});
