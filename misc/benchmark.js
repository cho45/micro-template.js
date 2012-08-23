#!/usr/bin/env node

// ============================================================================
var template = require('../lib/micro-template.js').template;

// ============================================================================
// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
  
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
      
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
    
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();
// ============================================================================
var ejs = require('ejs');

// ============================================================================
var fizzbuzz = require('fs').readFileSync('test/data-fizzbuzz.tmpl', 'utf-8');

(function () {
	var fizzbuzzRaw = fizzbuzz.replace(/<%=/g, '<%=raw');
	var result = benchmark(function () {
		template(fizzbuzzRaw, {n : 300 });
	});
	console.log("micro-template.js: %d counts/sec", result);
})();

(function () {
	var result = benchmark(function () {
		template(fizzbuzz, {n : 300 });
	});
	console.log("micro-template.js (escaped): %d counts/sec", result);
})();

(function () {
	var fizzbuzzRaw = fizzbuzz.replace(/<%=/g, '<%-');
	var result = benchmark(function () {
		ejs.render(fizzbuzzRaw, {n : 300 });
	});
	console.log("ejs.render: %d counts/sec", result);
})();

(function () {
	var result = benchmark(function () {
		ejs.render(fizzbuzz, {n : 300 });
	});
	console.log("ejs.render (escaped): %d counts/sec", result);
})();

(function () {
	var fizzbuzzRaw = fizzbuzz.replace(/<%=/g, '<%-');
	var fun = ejs.compile(fizzbuzzRaw);
	var result = benchmark(function () {
		fun({n : 300});
	});
	console.log("pre ejs.compile: %d counts/sec", result);
})();

(function () {
	var fun = ejs.compile(fizzbuzz);
	var result = benchmark(function () {
		fun({n : 300});
	});
	console.log("pre ejs.compile (escaped): %d counts/sec", result);
})();

(function () {
	var result = benchmark(function () {
		tmpl(fizzbuzz, {n : 300 });
	});
	console.log("John Resig's tmpl: %d counts/sec", result);
})();


// ============================================================================
// try n counts in 1sec
function benchmark (fun) {
	var now, start = new Date().getTime();
	var count = 0, n = 500;
	do {
		for (var i = 0; i < n; i++) fun();
		count += n;
		now = new Date().getTime();
	} while ( (now - start) < 500);
	return (count / (now - start)) * 1000;
}

