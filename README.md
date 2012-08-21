micro-template.js
=================

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

Start script part with `<%` and end with `%>`.

