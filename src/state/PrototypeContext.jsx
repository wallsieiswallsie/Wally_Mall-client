import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router';
import { seedState } from '../data/prototype.js';
import { products } from '../data/products.js';
import { destinations, inventory, quote, requireRole, transitionOrder, visibleOrders, labels, variantsFor } from '../domain/commerce.js';
import { paymentGateway, refundOrder } from '../domain/payment.js';
export const DEMO_ENABLED = import.meta.env.VITE_PROTOTYPE_MODE !== 'false';
const Context = createContext(null);
const storageKey = 'wally-transaction-prototype-v1';
function restore() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    return stored?.version === 1 ? stored : seedState();
  } catch {
    return seedState();
  }
}
export function PrototypeProvider({
  children
}) {
  const [state, setState] = useState(restore);
  const [session, setSession] = useState(() => {
    try {
      return DEMO_ENABLED ? JSON.parse(sessionStorage.getItem('wally-demo-session')) : null;
    } catch {
      return null;
    }
  });
  const [toast, setToast] = useState('');
  const checkoutLock = useRef(false);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      setToast('Penyimpanan browser penuh; perubahan hanya tersimpan di sesi ini.');
    }
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  function login(role, seller = 'ruang-sole') {
    if (!DEMO_ENABLED || !destinations[role]) throw new Error('Demo access dinonaktifkan.');
    const s = {
      role,
      id: role === 'buyer' ? 'WB-10281' : role === 'admin' ? 'ADM-01' : role,
      seller
    };
    setSession(s);
    sessionStorage.setItem('wally-demo-session', JSON.stringify(s));
    return destinations[role];
  }
  function logout() {
    setSession(null);
    sessionStorage.removeItem('wally-demo-session');
  }
  function mutate(fn, message = 'Perubahan demo tersimpan.') {
    setState(prev => {
      try {
        return fn(prev);
      } catch (e) {
        queueMicrotask(() => setToast(e.message));
        return prev;
      }
    });
    setToast(message);
  }
  function audit(s, action, target, reason, details = '') {
    return {
      ...s,
      audit: [{
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        actor: session.id,
        role: session.role,
        action,
        target,
        reason,
        device: '127.0.0.1 · Demo browser',
        details
      }, ...s.audit]
    };
  }
  function addToCart(slug, quantity, variant = '') {
    requireRole(session, 'buyer');
    const product = products.find(p => p.slug === slug);
    if (state.buyers.find(b => b.id === session.id)?.status !== 'active') throw new Error('Akun buyer sedang ditangguhkan.');
    if (!product || state.productStatus[slug] === 'removed' || state.sellers.find(s => s.slug === product.seller)?.status !== 'active') throw new Error('Produk ini belum tersedia untuk transaksi.');
    if (variantsFor(product).length && !variantsFor(product).includes(variant)) throw new Error('Pilih varian produk yang tersedia.');
    const key = `${slug}:${variant}`;
    const count = state.cart.filter(l => l.slug === slug).reduce((n, l) => n + l.quantity, 0);
    if (!Number.isInteger(quantity) || quantity < 1 || count + quantity > inventory(state, slug)) throw new Error('Jumlah melebihi stok tersedia.');
    mutate(s => ({
      ...s,
      cart: s.cart.some(l => l.key === key) ? s.cart.map(l => l.key === key ? {
        ...l,
        quantity: l.quantity + quantity
      } : l) : [...s.cart, {
        key,
        slug,
        quantity,
        variant
      }]
    }), 'Produk ditambahkan ke keranjang.');
  }
  function changeQuantity(key, quantity) {
    requireRole(session, 'buyer');
    mutate(s => {
      const line = s.cart.find(l => l.key === key);
      const others = s.cart.filter(l => l.slug === line.slug && l.key !== key).reduce((n, l) => n + l.quantity, 0);
      if (!Number.isInteger(quantity) || quantity < 0 || quantity + others > inventory(s, line.slug)) throw new Error('Stok tidak mencukupi.');
      return {
        ...s,
        cart: quantity === 0 ? s.cart.filter(l => l.key !== key) : s.cart.map(l => l.key === key ? {
          ...l,
          quantity
        } : l)
      };
    });
  }
  async function checkout(address, selection, method) {
    requireRole(session, 'buyer');
    if (!state.cart.length) throw new Error('Keranjang kosong.');
    if (state.buyers.find(b => b.id === session.id)?.status !== 'active') throw new Error('Akun tidak aktif.');
    for (const l of state.cart) {
      const count = state.cart.filter(x => x.slug === l.slug).reduce((n, x) => n + x.quantity, 0);
      const p = products.find(p => p.slug === l.slug);
      if (count > inventory(state, l.slug) || state.productStatus[l.slug] === 'removed' || state.sellers.find(s => s.slug === p.seller)?.status !== 'active') throw new Error('Stok atau status toko berubah. Periksa keranjang kembali.');
    }
    const q = quote(state.cart, selection, state.config);
    const id = `WM-${Date.now()}`;
    if (checkoutLock.current) throw new Error('Checkout sedang diproses.');
    checkoutLock.current = true;
    let payment;
    try {
      payment = await paymentGateway.createSession(id, q.total, method);
    } finally {
      checkoutLock.current = false;
    }
    const at = new Date().toISOString();
    const orders = q.groups.map((g, i) => {
      const gateway = Math.round(g.subtotal * state.config.gateway.percentage / 100) + state.config.gateway.fixed;
      return {
        id: `${id}-${i + 1}`,
        checkoutId: id,
        live: true,
        buyer: session.id,
        seller: g.seller,
        lines: g.lines,
        fulfillment: g.fulfillment,
        status: 'pending_payment',
        paymentStatus: 'pending',
        method,
        created: at,
        address: {
          ...address
        },
        gross_order_value: g.subtotal,
        platform_fee: g.platform_fee,
        payment_gateway_fee: gateway,
        seller_net_amount: g.subtotal - g.platform_fee - gateway,
        delivery: g.delivery,
        service: i === 0 ? q.service : 0,
        discount: i === 0 ? q.discount : 0,
        timeline: [{
          status: 'pending_payment',
          at
        }]
      };
    });
    mutate(s => ({
      ...s,
      orders: [...orders, ...s.orders],
      sessions: [payment, ...s.sessions],
      cart: []
    }), 'Pesanan dibuat. Selesaikan pembayaran demo.');
    return payment.id;
  }
  function paymentEvent(id, outcome) {
    requireRole(session, 'buyer');
    mutate(s => {
      const payment = s.sessions.find(p => p.id === id);
      if (!payment || !s.orders.some(o => o.checkoutId === payment.checkoutId && o.buyer === session.id)) throw new Error('Sesi pembayaran tidak ditemukan.');
      if (s.orders.some(o => o.checkoutId === payment.checkoutId && o.status !== 'pending_payment')) throw new Error('Pesanan dalam checkout ini sudah diubah. Pembayaran tidak dapat diproses.');
      const result = paymentGateway.webhook(payment, outcome, s.orders);
      const ns = {
        ...s,
        orders: result.orders,
        sessions: s.sessions.map(p => p.id === id ? result.session : p)
      };
      return {
        ...ns,
        notifications: [{
          id: crypto.randomUUID(),
          role: 'buyer',
          target: session.id,
          text: result.session.status === 'success' ? 'Pembayaran berhasil. Pesanan diteruskan ke seller.' : `Pembayaran ${result.session.status}. Stok dilepas.`
        }, ...s.orders.filter(o => o.checkoutId === payment.checkoutId).map(o => ({
          id: crypto.randomUUID(),
          role: 'seller',
          target: o.seller,
          text: result.session.status === 'success' ? `${o.id}: pesanan baru berbayar memerlukan proses.` : `${o.id}: pembayaran tidak berhasil.`
        })), ...s.notifications]
      };
    }, 'Webhook demo diproses.');
  }
  function updateOrder(id, next, reason = 'Proses pesanan seller') {
    mutate(s => {
      const order = s.orders.find(o => o.id === id);
      const updated = transitionOrder(order, session, next, reason);
      const cancellation = next === 'cancelled' && s.sessions.some(p => p.checkoutId === order.checkoutId);
      let result = {
        ...s,
        sessions: cancellation ? s.sessions.map(p => p.checkoutId === order.checkoutId ? {
          ...p,
          status: 'expired'
        } : p) : s.sessions,
        orders: s.orders.map(o => o.id === id ? updated : cancellation && o.checkoutId === order.checkoutId && o.status === 'pending_payment' ? {
          ...o,
          status: 'cancelled',
          paymentStatus: 'expired',
          timeline: [...o.timeline, {
            status: 'cancelled',
            at: new Date().toISOString()
          }]
        } : o),
        notifications: [{
          id: crypto.randomUUID(),
          role: 'buyer',
          target: order.buyer,
          text: `${id}: ${labels[next]}`
        }, ...s.notifications]
      };
      if (session.role !== 'seller') result = audit(result, 'Order Intervention', id, reason);
      return result;
    });
  }
  function action(type, id, value, reason, details = {}) {
    mutate(s => {
      requireRole(session, ...(['seller', 'product', 'category', 'report'].includes(type) ? ['admin', 'super_admin'] : ['super_admin']));
      if (!reason?.trim()) throw new Error('Alasan perubahan wajib diisi.');
      let next = s;
      let event = '';
      if (type === 'buyer') {
        next = {
          ...s,
          buyers: s.buyers.map(b => b.id === id ? {
            ...b,
            status: value
          } : b)
        };
        event = value === 'suspended' ? 'Buyer Suspended' : value === 'review' ? 'Buyer Reviewed' : 'Buyer Activated';
      }
      if (type === 'seller') {
        next = {
          ...s,
          sellers: s.sellers.map(b => b.slug === id ? {
            ...b,
            status: value
          } : b)
        };
        event = value === 'active' ? 'Seller Approved' : value === 'suspended' ? 'Seller Suspended' : 'Seller Reviewed';
      }
      if (type === 'product') {
        next = {
          ...s,
          productStatus: {
            ...s.productStatus,
            [id]: value
          }
        };
        event = value === 'removed' ? 'Product Removed' : 'Product Reviewed';
      }
      if (type === 'category') {
        next = {
          ...s,
          categoryStatus: {
            ...s.categoryStatus,
            [id]: value
          }
        };
        event = 'Category Updated';
      }
      if (type === 'report') {
        next = {
          ...s,
          reports: s.reports.map(r => r.id === id ? {
            ...r,
            status: value
          } : r)
        };
        event = 'Report Reviewed';
      }
      if (type === 'admin') {
        next = {
          ...s,
          admins: s.admins.map(a => a.id === id ? {
            ...a,
            ...(value === 'reset' ? {
              lastReset: new Date().toISOString()
            } : {
              status: value
            })
          } : a)
        };
        event = value === 'reset' ? 'Admin Access Reset' : value === 'inactive' ? 'Admin Deactivated' : 'Admin Reactivated';
      }
      if (type === 'admin-create') {
        if (s.admins.some(a => a.email.toLowerCase() === details.email.toLowerCase())) throw new Error('Email admin sudah terdaftar.');
        next = {
          ...s,
          admins: [...s.admins, {
            id: `ADM-${Date.now()}`,
            name: details.name,
            email: details.email,
            role: 'admin',
            status: 'active',
            created: new Date().toISOString(),
            lastLogin: 'Belum masuk',
            invite: details.invite
          }]
        };
        event = 'Admin Created';
      }
      if (type === 'fee') {
        const scheduled = details.effective > new Date().toISOString().slice(0, 10) && s.config.rules.some(r => r.id === details.id && r.effective <= new Date().toISOString().slice(0, 10));
        const r = scheduled ? {
          ...details,
          id: crypto.randomUUID()
        } : details;
        if (!Number.isFinite(r.percentage) || !Number.isFinite(r.fixed) || r.percentage < 0 || r.percentage > 100 || r.fixed < 0 || !r.effective || r.until && r.until < r.effective) throw new Error('Nilai atau periode fee tidak valid.');
        next = {
          ...s,
          config: {
            ...s.config,
            rules: [r, ...s.config.rules.filter(x => x.id !== r.id)]
          }
        };
        event = 'Platform Fee Changed';
      }
      if (type === 'settings') {
        next = {
          ...s,
          settings: {
            ...s.settings,
            ...details
          }
        };
        event = 'System Setting Changed';
      }
      if (type === 'refund') {
        const order = s.orders.find(o => o.id === id);
        next = {
          ...s,
          orders: s.orders.map(o => o.id === id ? refundOrder(order) : o)
        };
        event = 'Refund Action';
      }
      return audit(next, event, id, reason, JSON.stringify(details));
    });
  }
  const ownOrders = visibleOrders(state, session);
  // Never pass the full store to operational views. Actual secrecy requires server-side authorization.
  const view = {
    cart: state.cart,
    addresses: state.addresses,
    products: products.map(p => ({
      ...p,
      stock: inventory(state, p.slug),
      moderation: state.productStatus[p.slug] || 'active'
    })),
    orders: ownOrders,
    sellers: state.sellers.map(({
      owner,
      email,
      phone,
      ...s
    }) => session?.role === 'super_admin' || session?.role === 'seller' && session.seller === s.slug ? {
      ...s,
      owner,
      email,
      phone
    } : s),
    reports: session && ['admin', 'super_admin'].includes(session.role) ? state.reports : [],
    categoryStatus: state.categoryStatus
  };
  if (session?.role === 'super_admin') Object.assign(view, {
    buyers: state.buyers,
    admins: state.admins,
    audit: state.audit,
    config: state.config,
    settings: state.settings
  });
  if (session?.role === 'buyer') Object.assign(view, {
    sessions: state.sessions.filter(p => ownOrders.some(o => o.checkoutId === p.checkoutId)),
    buyer: state.buyers.find(b => b.id === session.id)
  });
  const notifications = state.notifications.filter(n => n.role === session?.role && (!n.target || n.target === (session?.role === 'seller' ? session.seller : session?.id)));
  return <Context.Provider value={{
    view,
    session,
    login,
    logout,
    toast: setToast,
    addToCart,
    changeQuantity,
    checkout,
    paymentEvent,
    updateOrder,
    action,
    notifications,
    estimate: (selection = {}) => {
      requireRole(session, 'buyer');
      return quote(state.cart, selection, state.config);
    },
    saveAddress: a => {
      requireRole(session, 'buyer');
      mutate(s => ({
        ...s,
        addresses: [...s.addresses, {
          ...a,
          id: crypto.randomUUID()
        }]
      }));
    }
  }}>{children}{toast && <div className="w-toast" role="status">{toast}<button aria-label="Tutup notifikasi" onClick={() => setToast('')}>×</button></div>}</Context.Provider>;
}
export const usePrototype = () => useContext(Context);
export function RequireRole({
  roles,
  children
}) {
  const {
    session
  } = usePrototype();
  if (!session) return <Navigate to="/login" replace />;
  if (!roles.includes(session.role)) return <div className="page empty-state"><h1>Akses terbatas</h1><p>Halaman ini tidak tersedia untuk role {session.role}.</p><a className="btn btn-primary" href={destinations[session.role]}>Kembali ke dashboard</a></div>;
  return children;
}
