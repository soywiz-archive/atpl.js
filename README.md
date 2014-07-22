Build status on Travis:

[![Version](https://badge.fury.io/js/atpl.svg)](https://www.npmjs.org/package/atpl)
[![Build Status](https://secure.travis-ci.org/soywiz/atpl.js.svg)](http://travis-ci.org/soywiz/atpl.js)

**Install with NPM:**

```
npm install atpl
```
	
**Using with express3:**

```
app.engine('html', require('atpl').__express);
app.set('devel', false);
app.set('view engine', 'html');
app.set('view cache', true);
app.set('views', __dirname + '/templates');

app.get('/simple', function(req, res) {
	res.render('simple', { name : 'Test' });
});
```

**Using as standalone:**
```
var atpl = require('atpl');
console.log(atpl.renderFileSync(__dirname + '/views', 'simple.html', { name: 'MyName' }, false));
atpl.renderFile(__dirname + '/views', 'simple.html', { name: 'MyName' }, false), function(err, result) {
	console.log(result);
});
```

**Typescript typings:** https://github.com/soywiz/atpl.js/blob/master/lib/atpl.d.ts

This project is designed to be compatible with twig.
So the documentation about tags, filters, functions and tests is on the twig page:

 * http://twig.sensiolabs.org/documentation
 
I have continued working on it because there are several projects implementing twig templates
but they are not implemented very well and lacks stuff like multiple inheritance or
nesting blocks, or are slow because doesn't perform dynamic recompilation.

This project will implement the full twig set and will be as fast as possible.

**Supported syntax:**

 * Inheritance
 * Conditional inheritance
 * Include
 * if+elseif+else
 * for+else+loop scope variable
 * Auto-escape
 * Escape (|e) (|e('js')) (|e('css'))...
 * Skip autoescape (|raw)
 * Filters (all twig filters but 'convert_encoding' that is not required because javascript strings are unicode)
 * Functions (all twig functions but 'constant')
 * Tests (all twig tests but 'constant')
 * Tags (all twig tags)
 * value in array
 * value in string
 * set a, b = 'a', 'b'
 * macro support (macro+import+from)
 * sandbox
 * use (horizontal reuse)

```
{% autoescape %}
{% autoescape 'type' %}
{% extends "file.atpl" %}
{% extends cond ? "base1" : "base2" %}
{% include "template" %}
{% include "template" with { 'foo' : 'bar' } only %}
{% block name %}...{% endblock %}
{% for var in list %}...{% endfor %}
{% for var in list %}...{% else %}...{% endfor %}
{% for key, value in list %}...{% else %}...{% endfor %}
{% for key, value in list if condition %}...{% else %}...{% endfor %}
{% for key in ['a', 'b', 'c'] %}{{ loop.index0 }}{% endfor %}
{% if condition %}...{% else %}...{% endif %}
{% if cond1 %}...{% elseif cond2 %}...{% else %}...{% endif %}
{% set a, b = 'a', 'b' %}
{{ expression }}
{{ expression|filter }}
{{ expression|filter(params) }}
{{ function(params) }}
{{ var is even }}
{{ var is not defined }}
{{ var is sameas(var) }}
{{ var.array['access'] }}
{{ 3 in [1, 2, 3, 4] }}
{{ {'key':'value','key2':'value2'} }}
```
