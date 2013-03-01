///<reference path='./imports.d.ts'/>

import ttlib  = module('../lib/lexer/TemplateTokenizer');
import assert = module('assert');
import fs     = module('fs');

var TemplateTokenizer = ttlib.TemplateTokenizer;

describe('TemplateTokenizer', function() {
	it('just plain text', function() {
		//console.log(assert);
		var templateTokenizer = new TemplateTokenizer('plain text');
		var tokens = templateTokenizer.tokenize();
		assert.equal(
			JSON.stringify([
				{ type: "text", value: "plain text", "offsetStart":0,"offsetEnd":10,"rawText":"plain text"}
			]),
			JSON.stringify(tokens)
		);
	});
	it('comments test', function() {
		var templateTokenizer = new TemplateTokenizer('plain text {# this is a comment #} Hello! {# this is another comment #} ');
		var tokens = templateTokenizer.tokenize();
		assert.equal(
			JSON.stringify([
				{ type: "text", value: "plain text ", "offsetStart": 0, "offsetEnd": 11, "rawText": "plain text " },
				{ type: "text", value: " Hello! ", "offsetStart": 34, "offsetEnd": 42, "rawText": " Hello! " },
				{ type: "text", value: " ", "offsetStart": 71, "offsetEnd": 72, "rawText": " " }
			]),
			JSON.stringify(tokens)
		);
	});
	it('with expression test', function() {
		var templateTokenizer = new TemplateTokenizer('{%extends base%} {{ 1 + 2 + 3 }} {{ "string" }}');
		var tokens = templateTokenizer.tokenize();
		var json_expected = [
			{"type":"block","value":[
				{ "type": "id", "value": "extends", "rawValue": "extends", "stringOffset": 2 },
				{ "type": "id", "value": "base", "rawValue": "base", "stringOffset": 10 }
			],"offsetStart":0,"offsetEnd":16,"rawText":"{%extends base%}"},
			{ "type": "text", "value": " ", "offsetStart": 16, "offsetEnd": 17, "rawText": " " },
			{"type":"expression","value":[
				{ "type": "number", "value": 1, "rawValue": "1", "stringOffset": 20 },
				{ "type": "operator", "value": "+", "rawValue": "+", "stringOffset": 22 },
				{ "type": "number", "value": 2, "rawValue": "2", "stringOffset": 24 },
				{ "type": "operator", "value": "+", "rawValue": "+", "stringOffset": 26 },
				{ "type": "number", "value": 3, "rawValue": "3", "stringOffset": 28 }
			], "offsetStart": 17, "offsetEnd": 32, "rawText": "{{ 1 + 2 + 3 }}"
			},
			{ "type": "text", "value": " ", "offsetStart": 32, "offsetEnd": 33, "rawText": " "},
			{ "type": "expression", "value": [{ "type": "string", "value": "string", "rawValue": "\"string\"", "stringOffset": 36 }], "offsetStart": 33, "offsetEnd": 47, "rawText": "{{ \"string\" }}" }
		];

		assert.equal(JSON.stringify(json_expected), JSON.stringify(tokens));
	});
});
