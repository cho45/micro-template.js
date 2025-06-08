#!/usr/bin/env node

// ============================================================================
import assert from 'assert';
import { template } from '../lib/micro-template.js';
import ejs from 'ejs';
import fs from 'fs';
import { bench, run, summary, barplot } from 'mitata';

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
const fizzbuzzVar  = fizzbuzz.replace(/^/, '<% var n = stash.n; %>');
const ejsFunc = ejs.compile(fizzbuzz);

const output1 = template(fizzbuzz, {n: 30}).replace(/\s+/g, ' ');
const output2 = ejsFunc({n: 30 }).replace(/\s+/g, ' ');
template.variable = 'stash';
const output3 = template(fizzbuzzVar, {n: 30}).replace(/\s+/g, ' ');
assert.equal(output1, output2, 'output should be same');
assert.equal(output1, output3, 'output should be same');

barplot(() => {
	summary(() => {
		bench('micro-template', () => {
			template.variable = null;
			template(fizzbuzz, { n: 300 });
		});
		bench('micro-template (without `with`)', () => {
			template.variable = 'stash';
			template(fizzbuzzVar, { n: 300 });
		});
		bench('ejs.render pre compiled', () => {
			ejsFunc({ n: 300 });
		});
	});
});

await run();

