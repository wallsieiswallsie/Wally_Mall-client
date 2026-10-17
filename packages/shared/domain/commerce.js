import { products } from '../data/products.js';
import { sellers } from '../data/sellers.js';
export const destinations = {
  buyer: '/',
  seller: '/seller/dashboard',
  admin: '/admin',
  super_admin: '/super-admin'
};
export const labels = {
  pending_payment: 'Menunggu pembayaran',
  paid: 'Pembayaran dikonfirmasi',
  processing: 'Diproses seller',
  ready_for_delivery: 'Siap dikirim',
  in_delivery: 'Dalam pengiriman',
  ready_for_pickup: 'Siap diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  payment_failed: 'Pembayaran gagal',
  refunded: 'Dikembalikan'
};
export const paidStatuses = ['paid', 'processing', 'ready_for_delivery', 'in_delivery', 'ready_for_pickup', 'completed'];
export function requireRole(session, ...roles) {
  if (!session || !roles.includes(session.role)) throw new Error('Akses tidak diizinkan untuk role ini.');
}
export const initialConfig = {
  buyerServiceFee: 1500,
  gateway: {
    percentage: 0.7,
    fixed: 1000
  },
  discount: 0,
  delivery: {
    local: 15000,
    seller: 10000,
    pickup: 0
  },
  rules: [{
    id: 'default',
    name: 'Default Marketplace',
    scope: 'all',
    target: '',
    type: 'percentage',
    percentage: 3,
    fixed: 0,
    effective: '2026-01-01',
    until: '',
    active: true
  }, {
    id: 'food',
    name: 'Food & Beverage',
    scope: 'category',
    target: 'makanan',
    type: 'percentage',
    percentage: 4,
    fixed: 0,
    effective: '2026-01-01',
    until: '',
    active: true
  }, {
    id: 'founding',
    name: 'Founding Sellers',
    scope: 'seller',
    target: 'ruang-sole',
    type: 'percentage',
    percentage: 0,
    fixed: 0,
    effective: '2026-01-01',
    until: '2026-10-31',
    active: true
  }]
};
export const fulfillmentLabels = {
  local: 'Local Delivery',
  seller: 'Seller Delivery',
  pickup: 'Pickup at Seller'
};
export const fulfillmentOptions = slug => slug === 'dapur-nona' ? ['seller', 'pickup'] : ['local', 'pickup'];
export const variantsFor = p => p.slug === 'nike-air-force-white' ? ['39', '40', '41', '42', '43'] : [];
export function platformFee(lines, config, date = new Date().toISOString().slice(0, 10)) {
  const groups = new Map();
  lines.forEach(line => {
    const p = products.find(p => p.slug === line.slug);
    const rules = config.rules.filter(r => r.active && r.effective <= date && (!r.until || r.until >= date));
    const newest = scope => rules.filter(r => r.scope === scope && (scope === 'all' || r.target === (scope === 'seller' ? p.seller : p.category))).sort((a, b) => b.effective.localeCompare(a.effective))[0];
    const rule = newest('seller') || newest('category') || newest('all');
    if (rule) groups.set(rule, (groups.get(rule) || 0) + line.price * line.quantity);
  });
  return [...groups].reduce((sum, [r, gross]) => sum + Math.min(gross, Math.round((r.type !== 'fixed' ? gross * r.percentage / 100 : 0) + (r.type !== 'percentage' ? r.fixed : 0))), 0);
}
export function quote(cart, selection, config) {
  const groups = sellers.map(s => {
    const lines = cart.filter(l => products.find(p => p.slug === l.slug)?.seller === s.slug).map(l => ({
      ...l,
      price: products.find(p => p.slug === l.slug).price
    }));
    const fulfillment = selection[s.slug] || fulfillmentOptions(s.slug)[0];
    if (!fulfillmentOptions(s.slug).includes(fulfillment)) throw new Error('Opsi pengiriman tidak tersedia.');
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    return {
      seller: s.slug,
      lines,
      fulfillment,
      subtotal,
      delivery: config.delivery[fulfillment],
      platform_fee: platformFee(lines, config)
    };
  }).filter(g => g.lines.length);
  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0);
  const delivery = groups.reduce((sum, g) => sum + g.delivery, 0);
  const service = groups.length ? config.buyerServiceFee : 0;
  const discount = Math.min(subtotal, config.discount);
  return {
    groups,
    subtotal,
    delivery,
    service,
    discount,
    total: subtotal + delivery + service - discount
  };
}
export function nextSellerStatus(order) {
  return {
    paid: 'processing',
    processing: order.fulfillment === 'pickup' ? 'ready_for_pickup' : 'ready_for_delivery',
    ready_for_delivery: 'in_delivery',
    in_delivery: 'completed',
    ready_for_pickup: 'completed'
  }[order.status];
}
export function transitionOrder(order, session, next, reason) {
  requireRole(session, 'seller', 'admin', 'super_admin');
  if (session.role === 'seller') {
    if (order.seller !== session.seller || next !== nextSellerStatus(order)) throw new Error('Seller hanya dapat memproses pesanan berbayar milik tokonya.');
  } else {
    if (!reason?.trim()) throw new Error('Alasan intervensi wajib diisi.');
    if (next !== 'cancelled' || !['pending_payment', 'paid', 'processing'].includes(order.status)) throw new Error('Intervensi ini tidak tersedia. Refund berbayar harus melalui payment service.');
    if (order.status !== 'pending_payment') throw new Error('Pesanan berbayar memerlukan refund melalui payment service.');
  }
  return {
    ...order,
    status: next,
    ...(next === 'cancelled' ? {
      paymentStatus: 'expired'
    } : {}),
    timeline: [...order.timeline, {
      status: next,
      at: new Date().toISOString()
    }]
  };
}
export function visibleOrders(state, session) {
  if (!session) return [];
  if (session.role === 'super_admin') return state.orders;
  const personalProjection = ({
    platform_fee,
    payment_gateway_fee,
    seller_net_amount,
    ...order
  }) => order;
  if (session.role === 'buyer') return state.orders.filter(o => o.buyer === session.id).map(personalProjection);
  if (session.role === 'seller') return state.orders.filter(o => o.seller === session.seller).map(personalProjection);
  // Whitelist projection: operational consumers never receive financial breakdown or full identity.
  return state.orders.map(({
    id,
    seller,
    buyer,
    status,
    lines,
    fulfillment,
    created,
    timeline,
    address
  }) => ({
    id,
    seller,
    buyer,
    status,
    lines: lines.map(({
      slug,
      quantity,
      variant
    }) => ({
      slug,
      quantity,
      variant
    })),
    fulfillment,
    created,
    timeline,
    address: {
      recipient: `Buyer #${buyer}`,
      phone: '08******91',
      email: 'n***@example.com',
      district: address.district,
      city: address.city
    }
  }));
}
export function canDiscover(product, view) {
  return view.products.find(p => p.slug === product.slug)?.moderation !== 'removed' && view.categoryStatus[product.category] !== 'hidden' && !['suspended', 'rejected'].includes(view.sellers.find(s => s.slug === product.seller)?.status);
}
export function inventory(state, slug) {
  const p = products.find(p => p.slug === slug);
  const reserved = state.orders.filter(o => o.live && !['cancelled', 'payment_failed', 'refunded'].includes(o.status)).flatMap(o => o.lines).filter(l => l.slug === slug).reduce((n, l) => n + l.quantity, 0);
  return Math.max(0, (p?.stock || 0) - reserved);
}
