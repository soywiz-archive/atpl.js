var assert = require('assert')
var tp = require('../lib/TemplateProvider')
var FileSystemTemplateProvider = tp.FileSystemTemplateProvider;
var MemoryTemplateProvider = tp.MemoryTemplateProvider;
describe('TemplateProvider', function () {
    it('test file system', function (done) {
        var templateProvider = new FileSystemTemplateProvider(__dirname + '/templates');
        assert.equal('Hello {{ name }}!', templateProvider.getSync('simple.html', false));
        done();
    });
    it('test memory', function () {
        var templateProvider = new MemoryTemplateProvider();
        try  {
            templateProvider.getSync('simple.atpl', false);
            assert.assert(false, '');
        } catch (e) {
        }
        var templateContent = 'Hello World!';
        templateProvider.add('simple.atpl', templateContent);
        assert.equal(templateContent, templateProvider.getSync('simple.atpl', false));
    });
});
