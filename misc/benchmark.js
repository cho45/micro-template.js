#!/usr/bin/env node

// ============================================================================
import assert from 'assert';
import { template } from '../lib/micro-template.js';
import ejs from 'ejs';
import fs from 'fs';
import os from 'os';

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
}).call(global);
// ============================================================================
const fizzbuzz = fs.readFileSync('test/data-fizzbuzz.tmpl', 'utf-8');
const fizzbuzzRaw1 = fizzbuzz.replace(/<%=/g, '<%=raw');
const fizzbuzzRaw2 = fizzbuzz.replace(/<%=/g, '<%-');
const fizzbuzzVar  = fizzbuzz.replace(/^/, '<% var n = stash.n; %>');
const ejsFunc = ejs.compile(fizzbuzzRaw2);

const output1 = template(fizzbuzz, {n: 30}).replace(/\s+/g, ' ');
const output2 = ejsFunc({n: 30 }).replace(/\s+/g, ' ');
template.variable = 'stash';
const output3 = template(fizzbuzzVar, {n: 30}).replace(/\s+/g, ' ');
assert.equal(output1, output2, 'output should be same');
assert.equal(output1, output3, 'output should be same');

benchmark({
	"micro-template" : function () {
		template.variable = null;
		template(fizzbuzzRaw1, {n : 300 });
	},
	"micro-template (escaped)" : function () {
		template.variable = null;
		template(fizzbuzz, {n : 300 });
	},
	"micro-template (without `with`)" : function () {
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
	for (let i = 0; i < 1000; i++) fun(); // warm up

	let now, count = 0, n = 500;
	const start = new Date().getTime();
	do {
		for (let i = 0; i < n; i++) fun();
		count += n;
		now = new Date().getTime();
	} while ( (now - start) < 1000);
	return (count / (now - start)) * 1000;
}

function benchmark (funcs) {
	console.log('  A larger number (count) means faster. A smaller number (msec) means faster.');
	console.log('%s (%s) %s %s %s %d cpus', os.type(), os.platform(), os.arch(), os.release(), os.cpus()[0].model, os.cpus().length);
	// console.log(os.cpus());

	const result = [];
	for (const key of Object.keys(funcs)) {
		console.log('running... %s', key);
		result.push({ name : key, counts : measure(funcs[key]) });
	}
	result.sort(function (a, b) { return b.counts - a.counts });

	console.log('=== result ===');

	for (var i = 0, it; (it = result[i]); i++) {
		console.log("%d: (%d msec) %s", it.counts.toFixed(1), (1000 / it.counts).toFixed(3), it.name);
	}
}
