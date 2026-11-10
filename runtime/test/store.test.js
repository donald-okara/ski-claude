import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/store.js';

test('set merges and notifies once with state and prev', () => {
  const store = createStore({ slide: 0, step: 0 });
  const calls = [];
  store.subscribe((s, p) => calls.push([s.slide, p.slide]));
  store.set({ slide: 2 });
  assert.deepEqual(store.get(), { slide: 2, step: 0 });
  assert.deepEqual(calls, [[2, 0]]);
});
test('set with unchanged values does not notify', () => {
  const store = createStore({ slide: 0 });
  let n = 0; store.subscribe(() => n++);
  store.set({ slide: 0 });
  assert.equal(n, 0);
});
test('unsubscribe stops notifications', () => {
  const store = createStore({ slide: 0 });
  let n = 0; const off = store.subscribe(() => n++);
  off(); store.set({ slide: 1 });
  assert.equal(n, 0);
});
