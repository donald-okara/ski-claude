import test from 'node:test';
import assert from 'node:assert/strict';
import { BINDINGS, resolveKey } from '../src/keys.js';

const body = { tagName: 'BODY', isContentEditable: false, closest: () => null };
const key = (k, extra = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, target: body, ...extra });

test('every binding resolves to its action', () => {
  for (const b of BINDINGS) for (const k of b.keys) assert.equal(resolveKey(key(k)), b.action);
});
test('letters match in either case', () => {
  assert.equal(resolveKey(key('D')), 'theme');
  assert.equal(resolveKey(key('G')), 'goto');
});
test('modifier keys pass through to the browser', () => {
  assert.equal(resolveKey(key('+', { ctrlKey: true })), null);
  assert.equal(resolveKey(key('0', { metaKey: true })), null);
  assert.equal(resolveKey(key('ArrowRight', { altKey: true })), null);
});
test('reserved and unknown keys do nothing', () => {
  for (const k of ['t', 'f', 'w', 'h', 'ArrowUp', 'ArrowDown', '[', ']', 'x']) assert.equal(resolveKey(key(k)), null);
});
test('typing never navigates, but Escape still dismisses', () => {
  const input = { tagName: 'INPUT', isContentEditable: false, closest: () => null };
  const editable = { tagName: 'DIV', isContentEditable: true, closest: () => null };
  const inDemo = { tagName: 'CANVAS', isContentEditable: false, closest: (s) => (s === 'ski-compose' ? {} : null) };
  for (const target of [input, editable, inDemo]) {
    assert.equal(resolveKey(key(' ', { target })), null);
    assert.equal(resolveKey(key('d', { target })), null);
    assert.equal(resolveKey(key('Escape', { target })), 'dismiss');
  }
});
test('a target without closest is treated as the page', () => {
  assert.equal(resolveKey(key('ArrowRight', { target: {} })), 'next');
});

test('an event without a string key resolves to null', () => {
  for (const k of [undefined, null, 12, {}]) assert.equal(resolveKey(key(k)), null);
});
test('Space and Enter belong to links, buttons, summaries and role=button', () => {
  const inside = { tagName: 'A', isContentEditable: false, closest: (sel) => (sel.includes('button') ? {} : null) };
  for (const k of [' ', 'Enter']) assert.equal(resolveKey(key(k, { target: inside })), null);
  assert.equal(resolveKey(key('ArrowRight', { target: inside })), 'next');
});
