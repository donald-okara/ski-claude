import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, formatHash } from '../src/hash.js';

test('parseHash reads a slide link', () => {
  assert.deepEqual(parseHash('#slide-7'), { view: 'deck', slide: 6 });
  assert.deepEqual(parseHash('#slide-999'), { view: 'deck', slide: 998 });
});
test('parseHash reads the presenter view', () => {
  assert.deepEqual(parseHash('#presenter'), { view: 'presenter', slide: null });
});
test('parseHash ignores anything else', () => {
  for (const h of ['', '#', '#slide-0', '#slide-abc', '#slide--3', '#slide-2.5', '#settings']) {
    assert.deepEqual(parseHash(h), { view: 'deck', slide: null });
  }
});
test('formatHash counts from 1', () => {
  assert.equal(formatHash(0), '#slide-1');
  assert.equal(formatHash(6), '#slide-7');
});
