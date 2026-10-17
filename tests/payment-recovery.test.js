import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentAction } from '../packages/api-client/payment.js';
test('payment actions only resume unexpired pending intents', () => {
  assert.equal(paymentAction({ status: 'pending', expires_at: '2030-01-01' }, 0).canResume, true);
  for (const status of ['expired', 'failed', 'success', 'refunded', 'partially_refunded']) {
    const action = paymentAction({ status });
    assert.equal(action.canResume, false);
    assert.ok(action.message);
  }
  assert.equal(paymentAction({ status: 'pending', expires_at: '2000-01-01' }).canResume, false);
});
