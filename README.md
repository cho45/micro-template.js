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
		<script type="module">
			import { extended as template } from './lib/micro-template.js';
			console.log('micro-template.js loaded', template);
			console.log('Template example:', template('tmpl1', { isFoo: true, foobar: "a", foobaz: "b" }));
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

online:
[benchmark on perf.link](https://perf.link/#eyJpZCI6IjdyMGN5dHJzazdvIiwidGl0bGUiOiJtaWNyby10ZW1wbGF0ZS5qcyB2cyBlanMiLCJiZWZvcmUiOiJpbXBvcnQgeyBleHRlbmRlZCBhcyB0ZW1wbGF0ZSB9IGZyb20gXCJodHRwczovL2NobzQ1LmdpdGh1Yi5pby9taWNyby10ZW1wbGF0ZS5qcy9saWIvbWljcm8tdGVtcGxhdGUuanNcIjtcbmltcG9ydCBlanMgZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9lanMvZWpzLmpzLytlc20nO1xuXG5jb25zdCBURU1QTEFURSA9IGBcbjwlIGZvciAodmFyIGkgPSAxOyBpIDw9IG47IGkrKykgeyAlPlxuXHQ8JT0gIGkgKyAnID0nICU%2BXG5cdDwlIGlmIChpICUgMTUgPT0gMCkgeyAlPlxuXHRGaXp6QnV6elxuXHQ8JSB9IGVsc2UgeyAlPlxuXHRcdDwlIGlmIChpICUgMyA9PSAwKSB7ICU%2BXG5cdFx0Rml6elxuXHRcdDwlIH0gZWxzZSB7ICU%2BXG5cdFx0XHQ8JSBpZiAoaSAlIDUgPT0gMCkgeyAlPlxuXHRcdFx0QnV6elxuXHRcdFx0PCUgfSBlbHNlIHsgJT5cblx0XHRcdDwlPSBpICU%2BXG5cdFx0XHQ8JSB9ICU%2BXG5cdFx0PCUgfSAlPlxuXHQ8JSB9ICU%2BXG5cdC9cbjwlIH0gJT5cbmAudHJpbSgpO1xuXG5jb25zdCBjb21waWxlZEVqcyA9IGVqcy5jb21waWxlKFRFTVBMQVRFKTsiLCJ0ZXN0cyI6W3sibmFtZSI6Im1pY3JvLXRlbXBsYXRlLmpzIiwiY29kZSI6InRlbXBsYXRlKFRFTVBMQVRFLCB7IG4gOiAxMDAwIH0pOyIsInJ1bnMiOlsxMjQ1NCwxMTYzNiwxNDAwMCwxMzM2MywxMzQ1NCwxMjgxOCwxMjgxOCwxMjU0NSwxMjcyNywxMzE4MSwxMzAwMCwxMjE4MSwxMjM2MywxMjU0NSwxMjAwMCwxMTM2MywxMzI3MiwxMzQ1NCwxMjgxOCwxMjE4MSwxMjM2MywxMzgxOCwxMjcyNywxMjQ1NCwxMzAwMCwxMzgxOCwxNDM2MywxMzAwMCwxMjYzNiwxMDkwOSwxMzQ1NCwxMTU0NSwxMzA5MCwxMjgxOCwxMTcyNywxMTgxOCwxMjkwOSwxMTE4MSwxMjcyNywxMzI3MiwxMjM2MywxMTU0NSwxMzU0NSwxMzI3MiwxNDA5MCwxMzYzNiwxMjQ1NCwxMzU0NSwxMjkwOSwxMjU0NSwxMzAwMCwxMjAwMCwxMjQ1NCwxMjgxOCwxMzM2MywxMjM2MywxMjI3MiwxMjkwOSwxMjgxOCwxMzkwOSwxMzA5MCwxMjI3MiwxMzQ1NCwxMzQ1NCwxMjI3MiwxMzE4MSwxMzYzNiwxMjQ1NCwxMjU0NSwxMjA5MCwxMzA5MCwxMTgxOCwxMzM2MywxMjA5MCwxMjYzNiwxMjQ1NCwxMzYzNiwxMDQ1NCwxMTM2MywxMTYzNiwxMDgxOCwxMjAwMCwxMzkwOSwxMjcyNywxMjQ1NCwxMTgxOCwxMzI3MiwxMjU0NSwxMjcyNywxMzQ1NCwxMjI3MiwxMTAwMCwxMjcyNywxMjQ1NCwxMjgxOCwxMjYzNiwxMzYzNiwxMjM2MywxMjgxOCwxNDE4MV0sIm9wcyI6MTI2OTJ9LHsibmFtZSI6ImVqcyIsImNvZGUiOiJjb21waWxlZEVqcyh7IG4gOiAxMDAwIH0pOyIsInJ1bnMiOls5MDksOTA5LDkwOSw4MTgsOTA5LDkwOSw5MDksOTA5LDkwOSw4MTgsOTA5LDkwOSw4MTgsOTA5LDkwOSw5MDksOTA5LDkwOSw5MDksODE4LDgxOCw5MDksOTA5LDkwOSw5MDksOTA5LDkwOSw4MTgsODE4LDgxOCw3MjcsNzI3LDkwOSw5MDksOTA5LDkwOSw5MDksODE4LDkwOSw5MDksOTA5LDkwOSw5MDksOTA5LDkwOSw5MDksOTA5LDkwOSw5MDksODE4LDkwOSw5MDksOTA5LDkwOSw5MDksOTA5LDkwOSw5MDksOTA5LDkwOSw5MDksOTA5LDkwOSw5MDksODE4LDkwOSw5MDksOTA5LDkwOSw5MDksOTA5LDkwOSw5MDksOTA5LDkwOSw4MTgsOTA5LDgxOCw4MTgsOTA5LDgxOCw4MTgsOTA5LDkwOSw5MDksOTA5LDkwOSw4MTgsOTA5LDkwOSw4MTgsOTA5LDkwOSw5MDksODE4LDkwOSw5MDksOTA5LDgxOCw5MDldLCJvcHMiOjg4N31dLCJ1cGRhdGVkIjoiMjAyNS0wNi0xMFQxMToyMzoyMS43MTlaIn0%3D )

node:

* node misc/benchmark.js

```
> node --expose-gc ./misc/benchmark.js

clk: ~3.04 GHz
cpu: Apple M1
runtime: node 20.10.0 (arm64-darwin)

benchmark                         avg (min … max) p75 / p99    (min  top 1%)
------------------------------------------------- -------------------------------
micro-template                      24.53 µs/iter  23.04 µs                      
                           (21.83 µs … 243.04 µs)  65.54 µs                     
                          ( 80.00  b … 341.16 kb) 146.07 kb ██▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

micro-template (not cached)         32.47 µs/iter  30.17 µs                      
                           (28.75 µs … 333.62 µs)  93.33 µs                     
                          (  3.81 kb … 606.79 kb) 159.79 kb █▅▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

micro-template (template.variable)  24.58 µs/iter  23.13 µs                      
                           (21.92 µs … 216.00 µs)  65.12 µs                     
                          ( 22.73 kb … 497.89 kb) 146.28 kb ██▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ejs.render pre compiled            348.73 µs/iter 352.79 µs   ▃                 
                          (332.54 µs … 574.04 µs) 393.13 µs                     
                          (  5.10 kb … 613.10 kb)  72.51 kb ▂▂███▆▅▄▄▄▃▄▃▂▂▂▂▂▁▁▁

John Resig's tmpl                  226.28 µs/iter 231.58 µs  █                  
                          (214.42 µs … 436.08 µs) 268.42 µs  █                 
                          ( 18.88 kb … 442.88 kb) 101.19 kb ████▆▄▄▅▆▅▄▄▃▂▂▂▁▁▁▁▁

                                   ┌                                            ┐
                    micro-template ┤ 24.53 s
       micro-template (not cached) ┤■ 32.47sµ
micro-template (template.variable) ┤ 24.58 s
           ejs.render pre compiled ┤■■■■■■■■■■■■■■■■■■■■■s ■■■■■■■■■■■■ 348.73 µ
                 John Resig's tmpl ┤■■■■■■■■■■■■■■ s■■■■■■ 226.28 µ
                                   └                                            ┘

summary
  micro-template
   1x faster than micro-template (template.variable)
   1.32x faster than micro-template (not cached)
   9.22x faster than John Resig's tmpl
   14.22x faster than ejs.render pre compiled
```

LICENSE
-------

MIT: https://cho45.github.io/mit-license
