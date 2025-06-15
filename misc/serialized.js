#!/usr/bin/env node
import { extended as template } from '../_serialized.js';

const result = template('main', { foo: 'world', baz: 'baz!' });
console.log('render result:', result);
