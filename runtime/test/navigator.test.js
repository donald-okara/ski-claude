import { test } from 'node:test';
import assert from 'node:assert/strict';
import { next, previous, goTo } from '../src/navigator.js';

const counts = [0, 2, 0];

test('next reveals steps before leaving the slide', () => {
  assert.deepEqual(next({ slide: 1, step: 0 }, counts), { slide: 1, step: 1 });
  assert.deepEqual(next({ slide: 1, step: 2 }, counts), { slide: 2, step: 0 });
});
test('next stops at the last slide', () => {
  assert.deepEqual(next({ slide: 2, step: 0 }, counts), { slide: 2, step: 0 });
});
test('previous rewinds steps, then lands fully revealed', () => {
  assert.deepEqual(previous({ slide: 1, step: 2 }, counts), { slide: 1, step: 1 });
  assert.deepEqual(previous({ slide: 2, step: 0 }, counts), { slide: 1, step: 2 });
});
test('previous stops at the first slide', () => {
  assert.deepEqual(previous({ slide: 0, step: 0 }, counts), { slide: 0, step: 0 });
});
test('goTo clamps to the deck and resets the step', () => {
  assert.deepEqual(goTo(1, counts), { slide: 1, step: 0 });
  assert.deepEqual(goTo(99, counts), { slide: 2, step: 0 });
  assert.deepEqual(goTo(-5, counts), { slide: 0, step: 0 });
});
test('goTo rejects non-integers', () => {
  assert.equal(goTo(NaN, counts), null);
  assert.equal(goTo(1.5, counts), null);
});
test('an empty deck never moves', () => {
  assert.deepEqual(next({ slide: 0, step: 0 }, []), { slide: 0, step: 0 });
  assert.equal(goTo(0, []), null);
});
