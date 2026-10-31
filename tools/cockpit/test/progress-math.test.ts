import { test } from 'node:test'
import assert from 'node:assert/strict'
import { netClosedSince, sessionBadgeText } from '../client/lib/progress-math.js'

void test('netClosedSince: counts only movement after the baseline', () => {
  assert.equal(netClosedSince({ closed: 7, reopened: 2 }, { closed: 7, reopened: 2 }), 0)
  assert.equal(netClosedSince({ closed: 7, reopened: 2 }, { closed: 9, reopened: 2 }), 2)
  // A reopen cancels a close: the panel must not claim progress it lost.
  assert.equal(netClosedSince({ closed: 7, reopened: 2 }, { closed: 8, reopened: 3 }), 0)
  assert.equal(netClosedSince({ closed: 7, reopened: 2 }, { closed: 7, reopened: 4 }), -2)
})

void test('sessionBadgeText: hidden at zero, signed otherwise', () => {
  assert.equal(sessionBadgeText(0, 'THIS SESSION'), null)
  assert.equal(sessionBadgeText(3, 'THIS SESSION'), '+3 THIS SESSION')
  assert.equal(sessionBadgeText(-1, 'SESI INI'), '-1 SESI INI')
})
