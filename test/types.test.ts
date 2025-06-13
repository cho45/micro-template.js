import { template, extended } from '../lib/micro-template';

// 正常系: Record<string, any>
const html: string = template('tmpl', { foo: 1 });

// 正常系: Array<string> オーバーロード
const fn = template('tmpl', ['foo']);
const html2: string = fn({ foo: 1 });

// extended: Record<string, any>
const html3: string = extended('tmpl', { foo: 1 });

// extended: Array<string> オーバーロード
const fn2 = extended('tmpl', ['foo']);
const html4: string = fn2({ foo: 1 });

// 型エラー系（コメントアウト、必要なら @ts-expect-error で有効化）
// @ts-expect-error
template('tmpl', 123);
// @ts-expect-error
extended('tmpl', 123);
