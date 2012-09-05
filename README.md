micro-template.js
=================

https://github.com/cho45/micro-template.js

micro-template is a template engine on JavaScript which like embed js.

This is inspired from [John Resig's template]( http://ejohn.org/blog/javascript-micro-templating/ ) but has more efficient feature:

 * Better error messages: show line-number in runtime errors
 * Support source map: debug is more easily on Chrome including syntax errors
 * Well tested: tested on node.js
 * Escape by default: all output is escaped by default for security


SYNOPSIS
========

## on HTML

```
<!DOCTYPE html>
<html>
	<head>
		<title></title>
		<meta charset="utf-8"/>
		<script type="text/javascript" src="micro-template.js"></script>
		<script type="text/javascript" src="foo.js"></script>
	</head>
	<body>
		<script type="application/x-template" id="tmpl1">
			<div class='foobar' id="aaa">
				<% if (isFoo) { %>
				<%= foobar %>
				<% } else { %>
				<%= foobaz %>
				<% } %>

				<%=raw html %>
			</div>
		</script>
	</body>
</html>
```

```
// foo.js
window.onload = function () {
    var html = template('tmpl1', {         isFoo : true,
        foobar : 'foobar!!',
        foobaz : 'foobaz!!',
        html : '<marquee>Helloooo</marquee>'
    });
    console.log(html);
};
```

## on node.js:

```
var template = require('micro-template').template;
template.get = function (id) { return require('fs').readFileSync('tmpl/' + id + '.tmpl', 'utf-8') };

var result = template('part1', {
  foo : 'bar',
  baz : 'piyo'
});
```

SYNTAX
======

 * `<% … %>`: normal script part
 * `<%= … %>`: escaped html output part
 * `<%=raw …%>`: unescaped (almost dangerous) html output part


DESCRIPTION
===========

## template(id or source [, data ])

If the first argument of template matches `/^[\w\-]+$/`, it is treated as `id` of template. In this case, use `document.getElementById(id).innerHTML` to get source.

Otherwise, the first argument is treated as source directly.

The second argument is optional. If it was NOT supplied, `template()` returns `Function`, otherwise `String`.


CUSTOM `get` FUNCTION
=====================

By default, micro-template uses `document.getElementById(id).innerHTML` to get template source from id.

To override this behaviour, you can set function to `template.get`.

```
template.get = function (id) { return require('fs').readFileSync('tmpl/' + id + '.tmpl', 'utf-8') };
```

DEFINE DATA VARIABLE EXPLICITLY
================================

By default, micro-template uses `with` syntax to expand data variables. This behavior is almost convenience, but if you want to expressly fast template function, you can do without `with` by sepcify `template.varible`.

```
template.variable = 'tmpl';

var func = template('aaa <% tmpl.foo %> bbb');
var result = func({ foo : 'foo' });
```

`template.variable` is used to data variable name in template code. And `with` syntax is not used any more. So you can't refer to variable without `tmpl.` prefix in this case.

EXTENDED FEATURES
=================

This package also provides `extended` function which includes `include` and `wrapper` function. Of course, this feature can be used on browsers by just copying and pasting `lib/micro-template.js`.

## include(name)

```
var template = require('micro-template').extended;

template('view1', { foo : 'bar' });
```

```
<!-- view1 -->
aaa
<% include('view2') %>
bbb
```

```
<!-- view2 -->
Hello, World!
```

## wrapper(name, func)

```
var template = require('micro-template').extended;

template('view1', { foo : 'bar' });
```

```
<!-- view1 -->
<% wrapper('wrapper', function () { %>
<h1>Hello, World!</h1>
<% }) %>
```

```
<!-- wrapper -->
<!DOCTYPE html>
<title><%= foo %></title>
<body><%=raw content %></body>
```

BENCHMARK
=========

on Browsers:

 * http://jsdo.it/cho45/rjwe/fullscreen

node:

 * node misc/benchmark.js


LICENSE
=======

MIT: http://cho45.github.com/mit-license