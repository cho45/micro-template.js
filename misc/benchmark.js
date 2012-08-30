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
var fizzbuzzRaw1 = fizzbuzz.replace(/<%=/g, '<%=raw');
var fizzbuzzRaw2 = fizzbuzz.replace(/<%=/g, '<%-');
var fizzbuzzVar  = fizzbuzz.replace(/^/, '<% var n = stash.n; %>');
var ejsFunc = ejs.compile(fizzbuzzRaw2);

benchmark({
	"micro-template" : function () {
		template.variable = null;
		template(fizzbuzzRaw1, {n : 300 });
	},
	"micro-template (escaped)" : function () {
		template.variable = null;
		template(fizzbuzz, {n : 300 });
	},
	"micro-template (template.variable)" : function () {
		template.variable = 'stash';
		template(fizzbuzzVar, {n : 300 });
	},
	"John Resig's tmpl" : function () {
		tmpl(fizzbuzz, {n : 300 });
	},
	"ejs.render": function () {
		ejs.render(fizzbuzzRaw2, {n : 300 });
	},
	"ejs.render pre compiled": function () {
		ejsFunc({n : 300});
	}
});


// ============================================================================
// try n counts in 1sec
function measure (fun) {
	var now, start = new Date().getTime();
	var count = 0, n = 500;
	do {
		for (var i = 0; i < n; i++) fun();
		count += n;
		now = new Date().getTime();
	} while ( (now - start) < 1000);
	return (count / (now - start)) * 1000;
}

function benchmark (funcs) {
	var os = require('os');
	console.log('%s (%s) %s %s', os.type(), os.platform(), os.arch(), os.release());
	console.log(os.cpus());

	var empty = 1000 / measure(function () {});
	console.log('empty function call: %d msec', empty);

	var result = [];
	for (var key in funcs) if (funcs.hasOwnProperty(key)) {
		console.log('running... %s', key);
		result.push({ name : key, counts : measure(funcs[key]) });
	}
	result.sort(function (a, b) { return b.counts - a.counts });

	console.log('=== result ===');

	for (var i = 0, it; (it = result[i]); i++) {
		console.log("%d: (%d msec) %s", it.counts.toFixed(1), (1000 / it.counts - (empty * it.counts)).toFixed(3), it.name);
	}
}
