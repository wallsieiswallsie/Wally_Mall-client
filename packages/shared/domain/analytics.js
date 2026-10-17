import { paidStatuses } from './commerce.js';
export const sum = (rows, key) => rows.reduce((n, r) => n + (r[key] || 0), 0);
export const rate = (n, d) => d ? Math.round(n / d * 1000) / 10 : 0;
export function metrics(orders) {
  const paid = orders.filter(o => paidStatuses.includes(o.status));
  const gmv = sum(paid, 'gross_order_value');
  return {
    gmv,
    revenue: sum(paid, 'platform_fee') + sum(paid, 'service'),
    transactions: paid.length,
    aov: paid.length ? Math.round(gmv / paid.length) : 0,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
    activeBuyers: new Set(paid.map(o => o.buyer)).size,
    activeSellers: new Set(paid.map(o => o.seller)).size,
    paid
  };
}
export function windowOrders(orders, days, offset = 0) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() - offset);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return orders.filter(o => new Date(o.created) >= start && new Date(o.created) <= end);
}
export const buyerSpending = orders => orders.filter(o => paidStatuses.includes(o.status)).reduce((n, o) => n + o.gross_order_value + o.delivery + o.service - o.discount, 0);
export function monthOrders(orders, offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = offset === 0 ? now : new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
  return orders.filter(o => new Date(o.created) >= start && new Date(o.created) < end);
}
export const healthStatus = (value, healthy, warning, higherIsBetter = true) => higherIsBetter
  ? value >= healthy ? 'Healthy' : value >= warning ? 'Needs Attention' : 'Critical'
  : value <= healthy ? 'Healthy' : value <= warning ? 'Needs Attention' : 'Critical';
export function growth(current, previous) {
  if (!previous) return current ? 'Baru' : '0%';
  return `${current >= previous ? '+' : ''}${rate(current - previous, previous)}%`;
}
