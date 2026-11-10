import test from 'node:test';
import assert from 'node:assert/strict';
import { stepTextScale } from '../src/prefs.js';

test('stepTextScale steps, clamps and resets', () => {
  assert.equal(stepTextScale(1, 1), 1.1);
  assert.equal(stepTextScale(1.6, 1), 1.6);
  assert.equal(stepTextScale(0.7, -1), 0.7);
  assert.equal(stepTextScale(1.3, 0), 1);
  assert.equal(stepTextScale(1.1, 1), 1.2); // no 1.2000000000000002
});
