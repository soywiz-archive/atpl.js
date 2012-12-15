Install with NPM:

```
npm install atpl
```
	
Using with express:

```
app.set('view engine', 'atpl');
app.set('view options', { layout : false });
```

This project is designed to be compatible with twig.
So the documentation about tags, filters, functions and tests is on the twig page:
 * http://twig.sensiolabs.org/documentation

Supported syntax:

 * Inheritance
 * Simple if, for
 * Auto-escape
 * Skip autoescape (|raw)
 * Filters
 * Functions

```
{% extends "file.atpl" %}
{% extends cond ? "base1" : "base2" %}
{% block name %}...{% endblock %}
{% for var in list %}...{% endfor %}
{% if condition %}...{% else %}...{% endif %}
{{ expression }}
{{ expression|filter }}
{{ expression|filter(params) }}
{{ function(params) }}
```

Not-implemented-yet syntax:

 * for+else
 * if+elseif
 * Tests

```
{% if cond1 %}...{% elseif cond2 %}...{% else %}...{% endif %}
{% for var in list %}...{% else %}...{% endif %}
{{ var is even }}
```

Build status on Travis:

[![Build Status](https://secure.travis-ci.org/soywiz/atpl.js.png)](http://travis-ci.org/#!/soywiz/atpl.js)
