Install with NPM:

```
npm install atpl
```
	
Using with express:

```
app.set('view engine', 'atpl');
app.set('view options', { layout : false });
```

Supported syntax:

 * Inheritance
 * Simple if, for
 * Auto-escape

```
{% extends "file.atpl" %}
{% block name %}...{% endblock %}
{% for var in list %}...{% endfor %}
{% if condition %}...{% else %}...{% endif %}
{{ expression }}
```

Not-implemented-yet syntax:

 * for+else
 * if+elseif
 * Skip autoescape
 * Filters

```
{% if cond1 %}...{% elseif cond2 %}...{% else %}...{% endif %}
{% for var in list %}...{% else %}...{% endif %}
{{ expression|filter }}
```

Build status on Travis:

[![Build Status](https://secure.travis-ci.org/soywiz/atpl.js.png)](http://travis-ci.org/#!/soywiz/atpl.js)
