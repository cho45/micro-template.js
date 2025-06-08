micro-template.js
=================

[Demo page (Try in your browser!)](https://cho45.github.io/micro-template.js/misc/demo.html)

https://github.com/cho45/micro-template.js

micro-template is a template engine on JavaScript which like embed js.

This is inspired from [John Resig's template]( http://ejohn.org/blog/javascript-micro-templating/ ) but has more efficient feature:

* Better error messages: show line-number in runtime errors
* Support source map: debug is more easily on Chrome including syntax errors
* Well tested: tested on node.js
* Escape by default: all output is escaped by default for security

SYNOPSIS
--------

### on HTML

```ejs
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

```js
// foo.js
window.onload = function () {
    var html = template('tmpl1', {
        isFoo : true,
        foobar : 'foobar!!',
        foobaz : 'foobaz!!',
        html : '<marquee>Helloooo</marquee>'
    });
    console.log(html);
};
```

### on node.js:

```js
import { template } from 'micro-template';
template.get = function (id) { return require('fs').readFileSync('tmpl/' + id + '.tmpl', 'utf-8') };

const result = template('part1', {
  foo : 'bar',
  baz : 'piyo'
});
```

SYNTAX
------

* `<% … %>`: normal script part
* `<%= … %>`: escaped html output part
* `<%=raw …%>`: unescaped (almost dangerous) html output part


DESCRIPTION
-----------

### template(id or source , data)

If the first argument of template matches `/^[\w\-]+$/`, it is treated as `id` of template. In this case, use `document.getElementById(id).innerHTML` to get source.

Otherwise, the first argument is treated as source directly.


CUSTOM `get` FUNCTION
---------------------

By default, micro-template uses `document.getElementById(id).innerHTML` to get template source from id.

To override this behaviour, you can set function to `template.get`.

```js
import { template } from 'micro-template';
template.get = function (id) { return require('fs').readFileSync('tmpl/' + id + '.tmpl', 'utf-8') };
```

DEFINE DATA VARIABLE SCOPE
----------------------------

micro-template now always expands data variables as local variables in the template function. The template API only supports two arguments: the template source/id and the data object. All keys of the data object are available as local variables in the template code.

For example:

```js
const result = template('aaa <% foo %> bbb', { foo: 'bar' });
// result: 'aaa bar bbb'
```

You can access all properties of the data object directly as variables inside the template.

**Note:** The previous API that allowed calling `template(tmpl)` to return a function is removed. Always use the two-argument form: `template(tmpl, data)`.

EXTENDED FEATURES
-----------------

This package also provides `extended` function which includes `include` and `wrapper` function. Of course, this feature can be used on browsers by just copying and pasting `lib/micro-template.js`.

### include(name)

```js
import { extended as template } from 'micro-template';

template('view1', { foo : 'bar' });
```

```ejs
<!-- view1 -->
aaa
<% include('view2') %>
bbb
```

```html
<!-- view2 -->
Hello, World!
```

### wrapper(name, func)

```js
import { extended as template } from 'micro-template';

template('view1', { foo : 'bar' });
```

```ejs
<!-- view1 -->
<% wrapper('wrapper', function () { %>
<h1>Hello, World!</h1>
<% }) %>
```

```ejs
<!-- wrapper -->
<!DOCTYPE html>
<title><%= foo %></title>
<body><%=raw content %></body>
```

BENCHMARK
---------

node:

* node misc/benchmark.js

```log
> node --expose-gc ./misc/benchmark.js

clk: ~3.03 GHz
cpu: Apple M1
runtime: node 20.10.0 (arm64-darwin)

benchmark                         avg (min … max) p75 / p99    (min  top 1%)
------------------------------------------------- -------------------------------
micro-template                      24.54 µs/iter  23.04 µs                      
                           (21.83 µs … 230.92 µs)  67.67 µs                     
                          ( 56.00  b … 361.68 kb) 146.04 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

micro-template (template.variable)  24.65 µs/iter  24.65 µs   █                 
                            (24.52 µs … 25.17 µs)  24.75 µs ▅▅█   ▅█ ▅ ▅▅       ▅
                          (945.85  b … 952.58  b) 946.55  b ███▁▁▁██▁█▁██▁▁▁▁▁▁▁█

ejs.render pre compiled            342.25 µs/iter 347.42 µs                      
                          (328.13 µs … 617.17 µs) 384.12 µs  ▃                 
                          ( 11.10 kb … 645.10 kb)  72.46 kb ▂███▆▆▄▄▅▄▃▄▃▂▂▂▂▁▁▁▁

John Resig's tmpl                  222.23 µs/iter 229.08 µs                      
                          (207.71 µs … 428.33 µs) 267.04 µs                     
                          ( 26.91 kb … 438.41 kb) 101.27 kb ▃▄██▃▃▃▃▄▄▄▃▂▂▁▁▁▁▁▁▁

                                   ┌                                            ┐
                    micro-template ┤ 24.54 s
micro-template (template.variable) ┤ 24.65 s
           ejs.render pre compiled ┤■■■■■■■■■■■■■■■■■■■■■s ■■■■■■■■■■■■ 342.25 µ
                 John Resig's tmpl ┤■■■■■■■■■■■■■■ s■■■■■■ 222.23 µ
                                   └                                            ┘

summary
  micro-template
   1x faster than micro-template (template.variable)
   9.06x faster than John Resig's tmpl
   13.95x faster than ejs.render pre compiled
```

LICENSE
-------

MIT: https://cho45.github.io/mit-license
