#!/usr/bin/env node

import assert from 'assert';
import { bench, run, summary, barplot } from 'mitata';

const escapeHTML_self_all = (function () {
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		let result = '';
		for (let i = 0, len = str.length; i < len; i++) {
			switch (str.charCodeAt(i)) {
				case 60: result += '&lt;'; break; // <
				case 62: result += '&gt;'; break; // >
				case 34: result += '&#x22;'; break; // "
				case 39: result += '&#x27;'; break; // '
				case 38: result += '&amp;'; break; // &
				default: result += str[i]; break;
			}
		}
		return result;
	};
})();

const escapeHTML_self_case = (function () {
	const regexp = /[<>"'&]/g;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		regexp.lastIndex = 0;
		let match = regexp.exec(str);
		if (match === null) return str;
		let result = '', lastIndex = 0, e;
		do {
			switch (str.charCodeAt(match.index)) {
				case 60: e = '&lt;'; break; // <
				case 62: e = '&gt;'; break; // >
				case 34: e = '&#x22;'; break; // "
				case 39: e = '&#x27;'; break; // '
				case 38: e = '&amp;'; break; // &
				default: e = ''; break;
			}
			result += str.slice(lastIndex, match.index) + e;
			lastIndex = regexp.lastIndex;
		} while ((match = regexp.exec(str)) !== null);
		return result + str.slice(lastIndex);
	};
})();

const escapeHTML_self_map = (function () {
	const map  = new Map([ [ `&`, `&amp;` ], [ `<`, `&lt;` ], [ `>`, `&gt;` ], [ `"`, `&#x22;` ], [ `'`, `&#x27;` ] ].map(([k, v]) => [k.charCodeAt(0), v]));
	const regexp = /[<>"'&]/g;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		regexp.lastIndex = 0;
		let match = regexp.exec(str);
		if (match === null) return str;
		let result = '', lastIndex = 0;
		do {
			result += str.slice(lastIndex, match.index) + map.get(str.charCodeAt(match.index));
			lastIndex = regexp.lastIndex;
		} while ((match = regexp.exec(str)) !== null);
		return result + str.slice(lastIndex);
	};
})();

const escapeHTML_self_map_k = (function () {
	const map  = new Map([ [ `&`, `&amp;` ], [ `<`, `&lt;` ], [ `>`, `&gt;` ], [ `"`, `&#x22;` ], [ `'`, `&#x27;` ] ]);
	const regexp = /[<>"'&]/g;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		regexp.lastIndex = 0;
		let match = regexp.exec(str);
		if (match === null) return str;
		let result = '', lastIndex = 0;
		do {
			result += str.slice(lastIndex, match.index) + map.get(match[0]);
			lastIndex = regexp.lastIndex;
		} while ((match = regexp.exec(str)) !== null);
		return result + str.slice(lastIndex);
	};
})();

const escapeHTML_self_obj = (function () {
	const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\x22': '&#x22;', '\x27': '&#x27;' };
	const regexp = /[<>"'&]/g;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		regexp.lastIndex = 0;
		let match = regexp.exec(str);
		if (match === null) return str;
		let result = '', lastIndex = 0;
		do {
			result += str.slice(lastIndex, match.index) + map[str.charAt(match.index)];
			lastIndex = regexp.lastIndex;
		} while ((match = regexp.exec(str)) !== null);
		return result + str.slice(lastIndex);
	};
})();

const escapeHTML_replace_map = (function () {
	const map  = new Map([ [ `&`, `&amp;` ], [ `<`, `&lt;` ], [ `>`, `&gt;` ], [ `"`, `&#x22;` ], [ `'`, `&#x27;` ] ]);
	const regexp = /[<>"'&]/g;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		return str.replace(regexp, (match) => map.get(match));
	};
})();

const escapeHTML_replace_obj = (function () {
	const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\x22': '&#x22;', '\x27': '&#x27;' };
	return function (string) { return (''+string).replace(/[&<>\'\"]/g, function (_) { return map[_] }) };
})();


const target = 'Hello <world> & "everyone"\'s welcome!'.repeat(1000);
barplot(() => {
	summary(() => {
		bench('escapeHTML_self_case', () => {
			escapeHTML_self_case(target);
		});
		bench('escapeHTML_self_map', () => {
			escapeHTML_self_map(target);
		});
		bench('escapeHTML_self_map_k', () => {
			escapeHTML_self_map_k(target);
		});
		bench('escapeHTML_self_obj', () => {
			escapeHTML_self_obj(target);
		});
		bench('escapeHTML_replace_map', () => {
			escapeHTML_replace_map(target);
		});
		bench('escapeHTML_replace_obj', () => {
			escapeHTML_replace_obj(target);
		});
		bench('escapeHTML_self_all', () => {
			escapeHTML_self_all(target);
		});
	});
});

await run();

