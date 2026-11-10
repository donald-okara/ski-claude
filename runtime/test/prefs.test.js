import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPrefs, savePrefs, stepTextScale } from '../src/prefs.js';

const defaults = { theme: 'light', textScale: 1 };
const fake = (value) => ({ getItem: () => value, setItem: () => {} });
const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };

test('loadPrefs reads saved values', () => {
  assert.deepEqual(loadPrefs(fake('{"theme":"dark","textScale":1.3}'), defaults), { theme: 'dark', textScale: 1.3 });
});
test('loadPrefs falls back when storage throws, is empty or holds garbage', () => {
  assert.deepEqual(loadPrefs(broken, defaults), defaults);
  assert.deepEqual(loadPrefs(fake(null), defaults), defaults);
  assert.deepEqual(loadPrefs(fake('not json'), defaults), defaults);
  assert.deepEqual(loadPrefs(fake('{"theme":"pink","textScale":9}'), defaults), defaults);
});
test('savePrefs never throws', () => {
  assert.doesNotThrow(() => savePrefs(broken, defaults));
});
test('stepTextScale steps, clamps and resets', () => {
  assert.equal(stepTextScale(1, 1), 1.1);
  assert.equal(stepTextScale(1.6, 1), 1.6);
  assert.equal(stepTextScale(0.7, -1), 0.7);
  assert.equal(stepTextScale(1.3, 0), 1);
  assert.equal(stepTextScale(1.1, 1), 1.2); // no 1.2000000000000002
});
