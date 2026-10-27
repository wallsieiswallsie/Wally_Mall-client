import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentAction, hostedCheckoutUrl } from '../packages/api-client/payment.js';
test('payment actions only resume unexpired pending intents', () => {
  assert.equal(paymentAction({ status: 'pending', expires_at: '2030-01-01' }, 0).canResume, true);
  for (const status of ['expired', 'failed', 'success', 'refunded', 'partially_refunded']) {
    const action = paymentAction({ status });
    assert.equal(action.canResume, false);
    assert.ok(action.message);
  }
  assert.equal(paymentAction({ status: 'pending', expires_at: '2000-01-01' }).canResume, false);
});
test('reconciliation prevents another payment and checkout links are restricted', () => {
  assert.equal(paymentAction({ status: 'pending', reconciliation_required: true }).canResume, false);
  assert.equal(hostedCheckoutUrl('https://xen.to/test'), 'https://xen.to/test');
  for (const value of ['javascript:alert(1)', 'https://xen.to.evil.test', 'http://xen.to/test', 'https://user@xen.to/test'])
    assert.throws(() => hostedCheckoutUrl(value));
});
