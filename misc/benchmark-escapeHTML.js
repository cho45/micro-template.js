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

const escapeHTML_self_all_with_fast_return = (function () {
	const regexp = /[<>"'&]/;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		let match = regexp.exec(str);
		if (match === null) return str;
		let result = str.slice(0, match.index);
		for (let i = match.index, len = str.length; i < len; i++) {
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
	const map = new Map([[`&`, `&amp;`], [`<`, `&lt;`], [`>`, `&gt;`], [`"`, `&#x22;`], [`'`, `&#x27;`]].map(([k, v]) => [k.charCodeAt(0), v]));
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
	const map = new Map([[`&`, `&amp;`], [`<`, `&lt;`], [`>`, `&gt;`], [`"`, `&#x22;`], [`'`, `&#x27;`]]);
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
	const map = new Map([[`&`, `&amp;`], [`<`, `&lt;`], [`>`, `&gt;`], [`"`, `&#x22;`], [`'`, `&#x27;`]]);
	const regexp = /[<>"'&]/g;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		return str.replace(regexp, (match) => map.get(match));
	};
})();

const escapeHTML_replace_obj = (function () {
	const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\x22': '&#x22;', '\x27': '&#x27;' };
	return function (string) { return ('' + string).replace(/[&<>\'\"]/g, function (_) { return map[_] }) };
})();


const escapeHTML_lookup = (function () {
	const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\x22': '&#x22;', '\x27': '&#x27;' };
	const lookup = [];
	for (let i = 0; i < 128; i++) {
		lookup[i] = map[String.fromCharCode(i)];
	}

	const regexp = /[<>"'&]/;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		let match = regexp.exec(str);
		if (match === null) return str;
		let result = str.slice(0, match.index);
		for (let i = match.index, len = str.length; i < len; i++) {
			const charCode = str.charCodeAt(i);
			let escaped;
			if (charCode < 128 && (escaped = lookup[charCode])) {
				result += escaped;
			} else {
				result += str[i];
			}
		}
		return result;
	};
})();

const escapeHTML_str_replace = (function () {
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		return str.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&#x22;')
			.replaceAll("'", '&#x27;');
	};
})();

const escapeHTML_indexof = (function () {
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		let i = 0, len = str.length;
		// Fast path: loop until we find a char to escape
		while (i < len) {
			const code = str.charCodeAt(i);
			if (code === 38 || code === 60 || code === 62 || code === 34 || code === 39) {
				break;
			}
			i++;
		}
		if (i === len) return str;

		let result = str.slice(0, i);
		while (i < len) {
			const code = str.charCodeAt(i);
			if (code === 38) { // &
				result += '&amp;';
			} else if (code === 60) { // <
				result += '&lt;';
			} else if (code === 62) { // >
				result += '&gt;';
			} else if (code === 34) { // "
				result += '&#x22;';
			} else if (code === 39) { // '
				result += '&#x27;';
			} else {
				result += str[i];
			}
			i++;
		}
		return result;
	};
})();


const escapeHTML_indexof_sliced = (function () {
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		let i = 0, len = str.length;
		while (i < len) {
			const code = str.charCodeAt(i);
			if (code === 38 || code === 60 || code === 62 || code === 34 || code === 39) {
				break;
			}
			i++;
		}
		if (i === len) return str;

		let result = str.slice(0, i);
		let last = i;
		while (i < len) {
			const code = str.charCodeAt(i);
			if (code === 38 || code === 60 || code === 62 || code === 34 || code === 39) {
				if (last !== i) {
					result += str.slice(last, i);
				}
				last = i + 1;
				if (code === 38) result += '&amp;';
				else if (code === 60) result += '&lt;';
				else if (code === 62) result += '&gt;';
				else if (code === 34) result += '&#x22;';
				else result += '&#x27;';
			}
			i++;
		}
		if (last !== i) result += str.slice(last, i);
		return result;
	};
})();


const escapeHTML_regex_sliced = (function () {
	const regexp = /[<>"'&]/;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		let match = regexp.exec(str);
		if (match === null) return str;

		let result = str.slice(0, match.index);
		let i = match.index;
		let len = str.length;
		let last = i;

		while (i < len) {
			const code = str.charCodeAt(i);
			if (code === 38 || code === 60 || code === 62 || code === 34 || code === 39) {
				if (last !== i) {
					result += str.slice(last, i);
				}
				last = i + 1;
				if (code === 38) result += '&amp;';
				else if (code === 60) result += '&lt;';
				else if (code === 62) result += '&gt;';
				else if (code === 34) result += '&#x22;';
				else result += '&#x27;';
			}
			i++;
		}
		if (last !== i) result += str.slice(last, i);
		return result;
	};
})();

const escapeHTML_regex_test_indexof = (function () {
	const regexp = /[<>"'&]/;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		if (!regexp.test(str)) return str;

		let i = 0, len = str.length;
		// Fast path: loop until we find a char to escape
		while (i < len) {
			const code = str.charCodeAt(i);
			if (code === 38 || code === 60 || code === 62 || code === 34 || code === 39) {
				break;
			}
			i++;
		}

		let result = str.slice(0, i);
		while (i < len) {
			const code = str.charCodeAt(i);
			if (code === 38) { // &
				result += '&amp;';
			} else if (code === 60) { // <
				result += '&lt;';
			} else if (code === 62) { // >
				result += '&gt;';
			} else if (code === 34) { // "
				result += '&#x22;';
			} else if (code === 39) { // '
				result += '&#x27;';
			} else {
				result += str[i];
			}
			i++;
		}
		return result;
	};
})();


// Verification
const testCases = [
	'Hello <world> & "everyone"\'s welcome!',
	'plain text',
	'<',
	'>',
	'&',
	'"',
	"'",
	'',
	'あいうえお',
];

testCases.forEach(testCase => {
	const expected = escapeHTML_self_all(testCase);
	[
		escapeHTML_self_all_with_fast_return,
		escapeHTML_self_case,
		escapeHTML_self_map,
		escapeHTML_self_map_k,
		escapeHTML_self_obj,
		escapeHTML_replace_map,
		escapeHTML_replace_obj,
		escapeHTML_lookup,
		escapeHTML_str_replace,
		escapeHTML_indexof,
		escapeHTML_indexof,
		escapeHTML_indexof_sliced,
		escapeHTML_regex_sliced,
		escapeHTML_regex_test_indexof
	].forEach(func => {
		const actual = func(testCase);
		assert.strictEqual(actual, expected, `Failed for ${func.name} with input "${testCase}"`);
	});
});
console.log('Verification passed');

const longPlain = 'a'.repeat(1000);
const longEscape = 'a'.repeat(500) + '<' + 'b'.repeat(499);

const benchmarkCases = [
	{ name: 'Short Escape', target: 'Hello <world> & "everyone"\'s welcome!' },
	{ name: 'Short Plain', target: 'plain text' },
	{ name: 'Long Escape', target: longEscape },
	{ name: 'Long Plain', target: longPlain },
];

barplot(() => {
	benchmarkCases.forEach(({ name, target }) => {
		// console.log(`\n=== ${name} ===`);
		summary(() => {
			bench(`[${name}] escapeHTML_self_case`, () => {
				escapeHTML_self_case(target);
			});
			bench(`[${name}] escapeHTML_self_map`, () => {
				escapeHTML_self_map(target);
			});
			bench(`[${name}] escapeHTML_self_map_k`, () => {
				escapeHTML_self_map_k(target);
			});
			bench(`[${name}] escapeHTML_self_obj`, () => {
				escapeHTML_self_obj(target);
			});
			bench(`[${name}] escapeHTML_replace_map`, () => {
				escapeHTML_replace_map(target);
			});
			bench(`[${name}] escapeHTML_replace_obj`, () => {
				escapeHTML_replace_obj(target);
			});
			bench(`[${name}] escapeHTML_self_all`, () => {
				escapeHTML_self_all(target);
			});
			bench(`[${name}] escapeHTML_self_all_with_fast_return`, () => {
				escapeHTML_self_all_with_fast_return(target);
			});
			bench(`[${name}] escapeHTML_lookup`, () => {
				escapeHTML_lookup(target);
			});
			bench(`[${name}] escapeHTML_str_replace`, () => {
				escapeHTML_str_replace(target);
			});
			bench(`[${name}] escapeHTML_indexof`, () => {
				escapeHTML_indexof(target);
			});
			bench(`[${name}] escapeHTML_indexof_sliced`, () => {
				escapeHTML_indexof_sliced(target);
			});
			bench(`[${name}] escapeHTML_regex_sliced`, () => {
				escapeHTML_regex_sliced(target);
			});
			bench(`[${name}] escapeHTML_regex_test_indexof`, () => {
				escapeHTML_regex_test_indexof(target);
			});
		});
	});
});


await run();

