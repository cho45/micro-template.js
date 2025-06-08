#!/usr/bin/env node

// node:test への移行
import test from 'node:test';
import assert from 'node:assert/strict';
import { template, extended } from '../lib/micro-template.js';
import fs from 'fs';

// template.get の上書き
template.get = function (id) { return fs.readFileSync('test/data-' + id + '.tmpl', 'utf-8') };

// --- template 基本テスト ---
test('template returns a function', (t) => {
	const a = template('<b><%= foo %></b><i><%= bar %></i>');
	assert.strictEqual(typeof a, 'function');
});

test('template renders with data', (t) => {
	const result = template('<b><%= foo %></b><i><%= bar %></i>', { foo: 'foo', bar: 'bar' });
	assert.strictEqual(result, '<b>foo</b><i>bar</i>');
});

test('template renders static html (single/double quote)', (t) => {
	assert.strictEqual(template("<a href='foo'>foo</a>", {}), "<a href='foo'>foo</a>");
	assert.strictEqual(template('<a href="foo">foo</a>', {}), '<a href="foo">foo</a>');
});

test('template supports if/raw', (t) => {
	assert.strictEqual(template('foo<% if ("a") { %><%= "aa" %>bar<% } %><%=raw "baz" %>', {}), 'fooaabarbaz');
	assert.strictEqual(template("foo<% if ('a') { %><%= 'aa' %>bar<% } %><%=raw 'baz' %>", {}), 'fooaabarbaz');
});

test('template renders with variable', (t) => {
	assert.strictEqual(template("<a href='foo'><%= foo %></a>", { foo: 'foo' }), "<a href='foo'>foo</a>");
	assert.strictEqual(template('<a href="foo"><%= foo %></a>', { foo: 'foo' }), '<a href="foo">foo</a>');
});

test('template binds this in forEach', (t) => {
	const result = template('<% array.forEach(function (i) { %><%= i %><% }, this) %>', { array: [1, 2, 3] });
	assert.strictEqual(result, '123');
});

test('template supports custom each', (t) => {
	const each = function (array, func) {
		for (let i = 0, len = array.length; i < len; i++) func.call(template.context, array[i]);
	};
	const result = template('<% each(array, function (i) { %><%= i %><% }) %>', { array: [1, 2, 3], each });
	assert.strictEqual(result, '123');
});

test('template.variable changes context variable', (t) => {
	template.variable = 'stash';
	const result = template('<b><%= stash.foo %></b><i><%= stash.bar %></i>', { foo: 'foo', bar: 'bar' });
	assert.strictEqual(result, '<b>foo</b><i>bar</i>');
	template.variable = null;
});

// --- エスケープ・raw ---
test('template escapes html', (t) => {
	const escaped = template('<%= html %>');
	assert.strictEqual(escaped({ html: '<foobar>' }), '&lt;foobar&gt;');
	assert.strictEqual(escaped({ html: '<">'}), '&lt;&#x22;&gt;');
	assert.strictEqual(escaped({ html: "<'>" }), '&lt;&#x27;&gt;');
});

test('template raw output', (t) => {
	const raw = template('<%=raw raw %>');
	assert.strictEqual(raw({ raw: '<foobar>' }), '<foobar>');
});

// --- ファイルテンプレート・エラー ---
test('template returns cached function for file', (t) => {
	const test1 = template('test1');
	assert.strictEqual(typeof test1, 'function');
	assert.strictEqual(template('test1'), test1);
});

test('template file: isFoo true', (t) => {
	const test1 = template('test1');
	const result = test1({
		isFoo: true,
		foobar: 'foo<b>ar',
		foobaz: 'foo<b>az',
		html: '<b>html</b>'
	});
	assert.strictEqual(result, "\nfoo&lt;b&gt;ar\n");
});

test('template file: isFoo false', (t) => {
	const test1 = template('test1');
	const result = test1({
		isFoo: false,
		foobar: 'foo<b>ar',
		foobaz: 'foo<b>az',
		html: '<b>html</b>'
	});
	assert.strictEqual(result, "\nfoo&lt;b&gt;az\n");
});

test('template file: throws isFoo undefined', (t) => {
	const test1 = template('test1');
	assert.throws(() => test1({}), e => e instanceof Error && /TemplateError: ReferenceError: isFoo is not defined \(on test1 line 1\)/.test(e.message));
});

test('template file: throws foobar undefined', (t) => {
	const test1 = template('test1');
	assert.throws(() => test1({ isFoo: true }), e => e instanceof Error && /TemplateError: ReferenceError: foobar is not defined \(on test1 line 2\)/.test(e.message));
});

test('template file: throws foobaz undefined', (t) => {
	const test1 = template('test1');
	assert.throws(() => test1({ isFoo: false }), e => e instanceof Error && /TemplateError: ReferenceError: foobaz is not defined \(on test1 line 4\)/.test(e.message));
});

// --- fizzbuzz ---
test('template file: fizzbuzz', (t) => {
	const fizzbuzz = template('fizzbuzz');
	const result = fizzbuzz({ n: 15 }).replace(/\s+/g, ' ');
	assert.strictEqual(result, ' 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz ');
});

// --- extended ---
test('extended basic', (t) => {
	const a = extended('<b><%= foo %></b><i><%= bar %></i>');
	assert.strictEqual(typeof a, 'function');
	assert.strictEqual(a({ foo: 'foo', bar: 'bar' }), '<b>foo</b><i>bar</i>');
});

test('extended includeA', (t) => {
	assert.strictEqual(extended('includeA', {}), 'aaa\nbbb\nccc\nbbb');
});

test('extended wrapperContent', (t) => {
	assert.strictEqual(extended('wrapperContent', { foo: 'foo', bar: 'bar' }), '111\n222\n\n333\nfoo\n444\n\n555\nbar\n666\n777');
});

test('extended wrapperContent throws foo undefined', (t) => {
	let error;
	assert.throws(() => {
		try {
			extended('wrapperContent', { bar: 'xxx' });
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.match(error.message, /TemplateError: ReferenceError: foo is not defined \(on wrapperContent line 4\)/);
});

test('extended wrapperContent throws bar undefined', (t) => {
	let error;
	assert.throws(() => {
		try {
			extended('wrapperContent', { foo: 'xxx' });
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.match(error.message, /TemplateError: ReferenceError: bar is not defined \(on wrapper line 4\) \(on wrapperContent line 6\)/);
});

// --- シングルクォート・エスケープ ---
test('template handles various quotes', (t) => {
	const quotes = [
		`\\`,
		`''`,
		'""',
		`\'\'`,
		'\"\"',
		`\\'\\'`,
		'\\"\\"',
	];
	for (const quote of quotes) {
		const a = template(quote);
		assert.strictEqual(a({}), quote);
	}
});

// --- エッジケース・追加テスト ---
test('empty template returns empty string', (t) => {
	const fn = template('');
	assert.strictEqual(typeof fn, 'function');
	assert.strictEqual(fn({}), '');
	assert.strictEqual(template('', {}), '');
});

test('plain text template returns as is', (t) => {
	const src = 'plain text only';
	assert.strictEqual(template(src, {}), src);
});

test('template with unclosed tag returns raw', (t) => {
	assert.strictEqual(template('<% foo', {}), '<% foo');
});

test('template with unclosed if block throws syntax error', (t) => {
	assert.throws(() => template('<% if (a) { %>foo', { a: true }), e => {
		return (e instanceof SyntaxError);
	});
});

test('escape all special chars', (t) => {
	const escaped = template('<%= html %>');
	assert.strictEqual(escaped({ html: '&<>\'"' }), '&amp;&lt;&gt;&#x27;&#x22;');
});

test('escape already escaped string', (t) => {
	const escaped = template('<%= html %>');
	assert.strictEqual(escaped({ html: '&amp;' }), '&amp;amp;');
});

test('output number, null, undefined, boolean', (t) => {
	const t1 = template('<%= foo %>');
	assert.strictEqual(t1({ foo: 0 }), '0');
	assert.strictEqual(t1({ foo: null }), 'null');
	assert.strictEqual(t1({ foo: undefined }), 'undefined');
	assert.strictEqual(t1({ foo: true }), 'true');
});

test('output object and array', (t) => {
	const t2 = template('<%= foo %>');
	assert.strictEqual(t2({ foo: { bar: 1 } }), '[object Object]');
	assert.strictEqual(t2({ foo: [1,2,3] }), '1,2,3');
});

test('reference not found throws', (t) => {
	const t3 = template('<%= notfound %>');
	assert.throws(() => t3({}), e =>
		e instanceof Error && /TemplateError: ReferenceError: notfound is not defined \(on template\(string\) line 1\)/.test(e.message)
	);
});

test('template with explicit throw', (t) => {
	const t4 = template('<% throw new Error("fail") %>');
	assert.throws(() => t4({}), e => e instanceof Error && /TemplateError: Error: fail/.test(e.message));
});

test('include circular reference throws', (t) => {
	const origGet = template.get;
	template.get = id => id === 'A' ? '<% include("B") %>' : '<% include("A") %>';
	const t5 = extended('A');
	assert.throws(() => t5({}), e => e instanceof Error && /Maximum call stack|stack|circular/i.test(e.message));
	template.get = origGet;
});

test('wrapper nested', (t) => {
	const origGet = template.get;
	template.get = id => id === 'outer' ? 'OUT<% wrapper("inner", function(){ %>IN<%= foo %><% }) %>OUT' : 'INNER<%=raw content %>INNER';
	const t6 = extended('outer');
	assert.strictEqual(t6({ foo: 'X' }), 'OUTINNERINXINNEROUT');
	template.get = origGet;
});

test('include/wrapper with missing args', (t) => {
	const origGet = template.get;
	template.get = id => id === 'inc' ? '<% include("B") %>' : '';
	const t7 = extended('inc');
	assert.throws(() => t7({}), e =>
		e instanceof Error && (/Maximum call stack|stack|circular|TemplateError/i.test(e.message))
	);
	template.get = origGet;
});

test('template id with special chars', (t) => {
	const origGet = template.get;
	template.get = id => id === 'foo-bar_123' ? 'OK' : '';
	assert.strictEqual(template('foo-bar_123', {}), 'OK');
	template.get = origGet;
});

test('template with ES6 syntax', (t) => {
	const t8 = template('<% let x = 1; const y = 2; %><%= x + y %>');
	assert.strictEqual(t8({}), '3');
});
