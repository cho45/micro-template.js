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
var fizzbuzz = require('fs').readFileSync('test/data-fizzbuzz.tmpl', 'utf-8')
var fizzbuzzRaw = fizzbuzz.replace(/<%=/g, '<%=raw');

var microtemplate = benchmark(function () {
	template(fizzbuzzRaw, {n : 300 });
});
console.log("micro-template.js: %d counts/sec", microtemplate);

var jrtmpl = benchmark(function () {
	tmpl(fizzbuzz, {n : 300 });
});
console.log("John Resig's tmpl: %d counts/sec", jrtmpl);

var microtemplateEscaped = benchmark(function () {
	template(fizzbuzz, {n : 300 });
});
console.log("micro-template.js (escaped): %d counts/sec", microtemplateEscaped);


// ============================================================================
// try n counts in 1sec
function benchmark (fun) {
	var now, start = new Date().getTime();
	var count = 0, n = 1000;
	do {
		for (var i = 0; i < n; i++) fun();
		count += n;
		now = new Date().getTime();
	} while ( (now - start) < 1000);
	return (count / (now - start)) * 1000;
}

