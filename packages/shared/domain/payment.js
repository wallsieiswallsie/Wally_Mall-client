import { paidStatuses } from './commerce.js';
// Provider-independent boundary. Production adapters create sessions server-side and verify signed webhooks.
export class PaymentGateway {
  async createSession() {
    throw new Error('Implement gateway adapter');
  }
  webhook() {
    throw new Error('Implement verified webhook adapter');
  }
}
export class MockPaymentGateway extends PaymentGateway {
  async createSession(checkoutId, amount, method) {
    await new Promise(resolve => setTimeout(resolve, 350));
    return {
      id: `PAY-${checkoutId}`,
      checkoutId,
      amount,
      method,
      status: 'pending',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }
  webhook(session, outcome, orders) {
    if (session.status !== 'pending') throw new Error('Sesi pembayaran sudah selesai.');
    if (!['success', 'failed', 'expired'].includes(outcome)) throw new Error('Event pembayaran tidak valid.');
    const finalOutcome = new Date(session.expiresAt) <= new Date() ? 'expired' : outcome;
    const status = {
      success: 'paid',
      failed: 'payment_failed',
      expired: 'cancelled'
    }[finalOutcome];
    const at = new Date().toISOString();
    return {
      session: {
        ...session,
        status: finalOutcome,
        reference: `MOCK-${session.id}`,
        paidAt: finalOutcome === 'success' ? at : null
      },
      orders: orders.map(o => o.checkoutId === session.checkoutId && o.status === 'pending_payment' ? {
        ...o,
        status,
        paymentStatus: finalOutcome,
        paymentReference: `MOCK-${session.id}`,
        paidAt: finalOutcome === 'success' ? at : null,
        timeline: [...o.timeline, {
          status,
          at
        }]
      } : o)
    };
  }
}
export function refundOrder(order) {
  if (!paidStatuses.includes(order.status)) throw new Error('Hanya transaksi berbayar yang dapat direfund.');
  return {
    ...order,
    status: 'refunded',
    paymentStatus: 'refunded',
    timeline: [...order.timeline, {
      status: 'refunded',
      at: new Date().toISOString()
    }]
  };
}
export const paymentGateway = new MockPaymentGateway();
