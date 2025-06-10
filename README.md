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

### template(id or source , data | array )

If the first argument of template matches `/^[\w\-]+$/`, it is treated as `id` of template. In this case, use `document.getElementById(id).innerHTML` to get source.

Otherwise, the first argument is treated as source directly.

If the second argument is an **Array**, it is treated as a list of property names for the data object. In this case, the template function will be compiled with these property names as its local variables, and the compiled function itself will be returned (not executed). This allows you to precompile a template for repeated use with the same set of variable names.

If the second argument is an **Object**, the template will be rendered immediately using the object's properties as local variables.


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

If the second argument is an **Array**, it is treated as a list of property names for the data object. In this case, the template function will be compiled with these property names as its local variables, and the function itself will be returned (not executed). This allows you to precompile a template for repeated use with the same set of variable names.

For example:

```js
const render = template('aaa <% foo %> bbb', ['foo']);
const result = render({ foo: 'bar' });
// result: 'aaa bar bbb'
```

You can access all properties of the data object directly as variables inside the template.

**Note:** The previous API that allowed calling `template(tmpl)` to return a function is removed. Always use the two-argument form: `template(tmpl, data)` or `template(tmpl, [prop1, prop2, ...])`.

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
[benchmark on perf.link]( https://perf.link/#eyJpZCI6IjdyMGN5dHJzazdvIiwidGl0bGUiOiJtaWNyby10ZW1wbGF0ZS5qcyB2cyBlanMiLCJiZWZvcmUiOiJpbXBvcnQgeyBleHRlbmRlZCBhcyB0ZW1wbGF0ZSB9IGZyb20gXCJodHRwczovL2NobzQ1LmdpdGh1Yi5pby9taWNyby10ZW1wbGF0ZS5qcy9saWIvbWljcm8tdGVtcGxhdGUuanNcIjtcbmltcG9ydCBlanMgZnJvbSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9lanMvZWpzLmpzLytlc20nO1xuXG5jb25zdCBURU1QTEFURSA9IGBcbjwlIGZvciAodmFyIGkgPSAxOyBpIDw9IG47IGkrKykgeyAlPlxuXHQ8JT0gIGkgKyAnID0nICU%2BXG5cdDwlIGlmIChpICUgMTUgPT0gMCkgeyAlPlxuXHRGaXp6QnV6elxuXHQ8JSB9IGVsc2UgeyAlPlxuXHRcdDwlIGlmIChpICUgMyA9PSAwKSB7ICU%2BXG5cdFx0Rml6elxuXHRcdDwlIH0gZWxzZSB7ICU%2BXG5cdFx0XHQ8JSBpZiAoaSAlIDUgPT0gMCkgeyAlPlxuXHRcdFx0QnV6elxuXHRcdFx0PCUgfSBlbHNlIHsgJT5cblx0XHRcdDwlPSBpICU%2BXG5cdFx0XHQ8JSB9ICU%2BXG5cdFx0PCUgfSAlPlxuXHQ8JSB9ICU%2BXG5cdC9cbjwlIH0gJT5cbmAudHJpbSgpO1xuXG5jb25zdCBjb21waWxlZE1UID0gdGVtcGxhdGUoVEVNUExBVEUsIFsgJ24nIF0pO1xuY29uc3QgY29tcGlsZWRFanMgPSBlanMuY29tcGlsZShURU1QTEFURSk7XG4iLCJ0ZXN0cyI6W3sibmFtZSI6Im1pY3JvLXRlbXBsYXRlLmpzIGNvbXBpbGVkIiwiY29kZSI6ImNvbXBpbGVkTVQoeyBuIDogMTAwMCB9KTsiLCJydW5zIjpbOTE2MSw5NDgzLDExMDk2LDExNDE5LDEwNDE5LDEwODcwLDEwOTY3LDEwNjEyLDEwMjI1LDExMDk2LDExMTI5LDEwNTQ4LDEyNDUxLDExNDE5LDExNzc0LDEyMTI5LDEwNzQxLDExMjU4LDExNDE5LDEwOTY3LDEwOTM1LDk3NzQsNDkwMyw5ODM4LDEwODcwLDExMzg3LDExNDgzLDExNTQ4LDk5NjcsMTA1MTYsOTgwNiw3NjQ1LDEwOTM1LDExNDE5LDExMjU4LDExNDUxLDEwODcwLDExMjI1LDExMzIyLDEwNTgwLDEwMzIyLDEwMzg3LDEwODcwLDEwNTgwLDExNDE5LDEwODcwLDEwOTY3LDEwODcwLDEwMjkwLDExMjkwLDExMDY0LDEwNTE2LDEwNzA5LDExMTkzLDEwOTAzLDExMTI5LDEwMzIyLDExMDMyLDEwMzIyLDExMDAwLDEwNzQxLDk4MzgsMTAzODcsMTEyOTAsMTA4MzgsMTA0MTksMTExOTMsMTA3NDEsMTA4NzAsMTA5MDMsMTExOTMsMTEwMzIsMTA3MDksMTAxNjEsMTA1MTYsMTExOTMsOTg3MCwxMTQxOSw4Nzc0LDExMjU4LDExMjU4LDExNDE5LDEwNDgzLDEwODA2LDExMzU0LDEwODcwLDEwODcwLDExMDY0LDEwODA2LDEwMzIyLDEwNjc3LDEwODcwLDEwNzc0LDEwNTgwLDEwOTY3LDk5MDMsMTAwMzIsMTA0NTEsMTA1NDgsMTA1NDhdLCJvcHMiOjEwNzA5fSx7Im5hbWUiOiJtaWNyby10ZW1wbGF0ZS5qcyIsImNvZGUiOiJ0ZW1wbGF0ZShURU1QTEFURSwgeyBuIDogMTAwMCB9KTsiLCJydW5zIjpbOTI5MCw5MjU4LDEwNDE5LDEwOTY3LDEwMjU4LDEwNTQ4LDEwOTY3LDEwMjU4LDEwNzA5LDEwMDk2LDExMTI5LDEwOTY3LDEwNTgwLDExNDUxLDEyMTkzLDExOTY3LDEwMDMyLDExNjc3LDEwMTYxLDEwMzIyLDExNjQ1LDk5MDMsMzg3MCwxMTAwMCwxMDU4MCwxMDkwMywxMDkzNSwxMTI1OCwxMDg3MCwxMDQxOSwxMDk2Nyw5MjU4LDEwODcwLDEwOTAzLDEwNjQ1LDEwODcwLDEwNTgwLDEwOTM1LDEwODcwLDEwMzU0LDEwNzQxLDEwOTM1LDExMTI5LDEwODM4LDExMTYxLDEwMDMyLDEwNzc0LDEwNTgwLDEwNzA5LDExMjI1LDEwODcwLDEwMDk2LDEwOTAzLDEwOTAzLDEwOTY3LDEwNTgwLDEwNTgwLDExMDMyLDEwMzg3LDEwODM4LDExMDAwLDEwMjU4LDEwNzc0LDEwMzIyLDEwMjkwLDEwMzg3LDEwOTM1LDEwMjU4LDEwODA2LDEwODcwLDExMDAwLDEwNTQ4LDEwMTI5LDExMTkzLDEwMzg3LDEwNTQ4LDk3NDEsNDcwOSw4MzIyLDExOTM1LDExMjI1LDExMjI1LDkzODcsMTA4NzAsMTExMjksMTAyMjUsMTA3NDEsMTEyNTgsMTA2NDUsOTkwMywxMDU4MCwxMDY0NSwxMDQ4MywxMDE2MSwxMDY0NSwxMDA5NiwxMDcwOSwxMDQxOSwxMDQxOSwxMDUxNl0sIm9wcyI6MTA1MTh9LHsibmFtZSI6ImVqcyIsImNvZGUiOiJjb21waWxlZEVqcyh7IG4gOiAxMDAwIH0pOyIsInJ1bnMiOls0ODMsNTE2LDUxNiw1NDgsNTE2LDU0OCw1MTYsNTE2LDUxNiw1MTYsNTQ4LDU0OCw1MTYsNTQ4LDU0OCw1NDgsNTE2LDUxNiw1NDgsNTE2LDU0OCw0ODMsMzIyLDU0OCw1MTYsNTE2LDU0OCw1NDgsNTE2LDUxNiw1MTYsMzU0LDUxNiw1NDgsNTE2LDU0OCw1NDgsNTE2LDU0OCw1MTYsNTE2LDQ4Myw1MTYsNTE2LDU0OCw1NDgsNTE2LDQ4Myw1MTYsNDgzLDU0OCw1NDgsNTQ4LDUxNiw1NDgsNTE2LDUxNiw1MTYsNTE2LDUxNiw1MTYsNTQ4LDUxNiw1NDgsNTQ4LDUxNiw1MTYsNTE2LDUxNiw1MTYsNTQ4LDUxNiw1MTYsNTE2LDUxNiw1MTYsNDgzLDU4MCw0MTksNTQ4LDUxNiw1NDgsNDgzLDU0OCw1NDgsNTE2LDUxNiw1NDgsNTE2LDQ4Myw1MTYsNTE2LDUxNiw1MTYsNTE2LDUxNiw1MTYsNTE2LDQ4Myw1NDhdLCJvcHMiOjUxOX1dLCJ1cGRhdGVkIjoiMjAyNS0wNi0xMFQxMjo1NjoyMi4xODdaIn0%3D )

node:

* node misc/benchmark.js


```
> node --expose-gc ./misc/benchmark.js

 1 = 1 / 2 = 2 / 3 = Fizz / 4 = 4 / 5 = Buzz / 6 = Fizz / 7 = 7 / 8 = 8 / 9 = Fizz / 10 = Buzz / 11 = 11 / 12 = Fizz / 13 = 13 / 14 = 14 / 15 = FizzBuzz / 16 = 16 / 17 = 17 / 18 = Fizz / 19 = 19 / 20 = Buzz / 21 = Fizz / 22 = 22 / 23 = 23 / 24 = Fizz / 25 = Buzz / 26 = 26 / 27 = Fizz / 28 = 28 / 29 = 29 / 30 = FizzBuzz / 
clk: ~3.01 GHz
cpu: Apple M1
runtime: node 20.10.0 (arm64-darwin)

benchmark                         avg (min … max) p75 / p99    (min  top 1%)
------------------------------------------------- -------------------------------
micro-template                      21.13 µs/iter  19.88 µs ▇                   
                           (18.79 µs … 343.21 µs)  49.29 µs                     
                          ( 12.35 kb … 365.21 kb) 108.72 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

micro-template pre compiled         20.22 µs/iter  19.98 µs                      
                            (19.76 µs … 22.35 µs)  21.46 µs                     
                          (  1.92 kb …   1.94 kb)   1.92 kb ▅█▅█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▅

micro-template (not cached)         29.17 µs/iter  27.50 µs ▄                   
                           (26.21 µs … 311.92 µs)  58.13 µs                     
                          (  2.14 kb … 378.82 kb) 123.25 kb ██▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

micro-template (template.variable)  20.91 µs/iter  20.00 µs                      
                           (19.12 µs … 219.87 µs)  30.67 µs                     
                          (  2.98 kb … 492.50 kb) 108.87 kb ▁█▇▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

ejs.render pre compiled            430.88 µs/iter 432.54 µs                      
                          (421.38 µs … 642.92 µs) 477.00 µs ▂                  
                          ( 18.84 kb … 830.84 kb)  99.63 kb ███▇▆▄▃▃▂▂▂▂▂▁▂▁▁▁▁▁▁

John Resig's tmpl                  239.00 µs/iter 238.17 µs                      
                          (232.62 µs … 424.21 µs) 274.75 µs                     
                          ( 33.55 kb … 470.89 kb) 126.63 kb ███▄▂▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁

                                   ┌                                            ┐
                    micro-template ┤ 21.13 s
       micro-template pre compiled ┤ 20.22 s
       micro-template (not cached) ┤■ 29.17sµ
micro-template (template.variable) ┤ 20.91 s
           ejs.render pre compiled ┤■■■■■■■■■■■■■■■■■■■■■s ■■■■■■■■■■■■ 430.88 µ
                 John Resig's tmpl ┤■■■■■■■■■■■■■s ■■■■ 239.00 µ
                                   └                                            ┘

summary

  micro-template pre compiled
   1.03x faster than micro-template (template.variable)
   1.05x faster than micro-template
   1.44x faster than micro-template (not cached)
   11.82x faster than John Resig's tmpl
   21.31x faster than ejs.render pre compiled
```

LICENSE
-------

MIT: https://cho45.github.io/mit-license
