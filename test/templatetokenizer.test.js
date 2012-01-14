var ttlib  = require('../lib/templatetokenizer.js');
var assert = require('assert');
var fs     = require('fs');

TemplateTokenizer = ttlib.TemplateTokenizer;

module.exports = {
	'just plain text': function() {
		//console.log(assert);
		var templateTokenizer = new TemplateTokenizer('plain text');
		var tokens = templateTokenizer.tokenize();
		assert.equal('[{"type":"text","value":"plain text"}]', JSON.stringify(tokens));
	},
	'comments test': function() {
		var templateTokenizer = new TemplateTokenizer('plain text {# this is a comment #} Hello! {# this is another comment #} ');
		var tokens = templateTokenizer.tokenize();
		assert.equal(
			'[{"type":"text","value":"plain text "},{"type":"text","value":" Hello! "},{"type":"text","value":" "}]',
			JSON.stringify(tokens)
		);
	},
	'with expression test': function() {
		var templateTokenizer = new TemplateTokenizer('{%extends base%} {{ 1 + 2 + 3 }} {{ "string" }}');
		var tokens = templateTokenizer.tokenize();
		console.log(tokens);
	},
};