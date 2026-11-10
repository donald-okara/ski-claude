import test from 'node:test';
import assert from 'node:assert/strict';
import { fitScale } from '../src/layout.js';

test('fitScale fits the tighter dimension', () => {
  assert.equal(fitScale(1920, 1080), 1);
  assert.equal(fitScale(960, 1080), 0.5);
  assert.equal(fitScale(3840, 1080), 1);
  assert.equal(fitScale(0, 0), 0);
});
