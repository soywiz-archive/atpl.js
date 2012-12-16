Install with NPM:

```
npm install atpl
```
	
Using with express3:

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

This project is designed to be compatible with twig.
So the documentation about tags, filters, functions and tests is on the twig page:

 * http://twig.sensiolabs.org/documentation
 
I have continued working on it because there are several projects implementing twig templates
but they are not implemented very well and lacks stuff like multiple inheritance or
nesting blocks, or are slow because doesn't perform dynamic recompilation.

This project will implement the full twig set and will be as fast as possible.

Supported syntax:

 * Inheritance
 * Include
 * Simple if, for
 * if+elseif
 * for+else
 * Auto-escape
 * Skip autoescape (|raw)
 * Filters
 * Functions
 * Tests
 * value in array

```
{% autoescape %}
{% autoescape 'type' %}
{% extends "file.atpl" %}
{% extends cond ? "base1" : "base2" %}
{% include "template" %}
{% block name %}...{% endblock %}
{% for var in list %}...{% endfor %}
{% for var in list %}...{% else %}...{% endfor %}
{% for key, value in list %}...{% else %}...{% endfor %}
{% for key, value in list if condition %}...{% else %}...{% endfor %}
{% if condition %}...{% else %}...{% endif %}
{% if cond1 %}...{% elseif cond2 %}...{% else %}...{% endif %}
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

Not-implemented-yet syntax:

 * a, b = 'a', 'b'
 * loop variable in for loops

```
...
```

Build status on Travis:

[![Build Status](https://secure.travis-ci.org/soywiz/atpl.js.png)](http://travis-ci.org/#!/soywiz/atpl.js)
