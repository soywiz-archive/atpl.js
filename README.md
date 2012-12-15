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
 
I have continued working on it because there are several projects implementing twig templates
but they are not implemented very well and lacks stuff like multiple inheritance or
nesting blocks, or are slow because doesn't perform dynamic recompilation.

This project will implement the full twig set and will be as fast as possible.

Supported syntax:

 * Inheritance
 * Simple if, for
 * if+elseif
 * for+else
 * Auto-escape
 * Skip autoescape (|raw)
 * Filters
 * Functions
 * Tests

```
{% autoescape %}
{% autoescape 'type' %}
{% extends "file.atpl" %}
{% extends cond ? "base1" : "base2" %}
{% block name %}...{% endblock %}
{% for var in list %}...{% endfor %}
{% for var in list %}...{% else %}...{% endfor %}
{% if condition %}...{% else %}...{% endif %}
{% if cond1 %}...{% elseif cond2 %}...{% else %}...{% endif %}
{{ expression }}
{{ expression|filter }}
{{ expression|filter(params) }}
{{ function(params) }}
{{ var is even }}
{{ var is sameas(var) }}
{{ var.array['access'] }}
```

Not-implemented-yet syntax:

 * ...

```
...
```

Build status on Travis:

[![Build Status](https://secure.travis-ci.org/soywiz/atpl.js.png)](http://travis-ci.org/#!/soywiz/atpl.js)
