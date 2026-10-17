import { products } from './products.js';
import { sellers } from './sellers.js';
import { initialConfig, platformFee } from '../domain/commerce.js';
export const sampleAddress = {
  recipient: 'Nawal Alhamid',
  phone: '081248761291',
  address: 'Jl. Basuki Rahmat, Km 9, dekat Taman DEO',
  district: 'Sorong Timur',
  city: 'Kota Sorong',
  region: 'Papua Barat Daya',
  postalCode: '98416',
  notes: 'Hubungi saat tiba di depan gerbang.'
};
const names = ['Nawal Alhamid', 'Maria Kambu', 'Daniel Sesa', 'Rina Mambrasar', 'Samuel Sapisa', 'Melati Waromi', 'Yohana Rumbiak', 'Andreas Mayor'];
export function seedState() {
  const buyers = names.map((name, i) => ({
    id: `WB-${10281 + i}`,
    name,
    email: `${name.toLowerCase().split(' ')[0]}@example.com`,
    phone: `0812487612${91 + i}`,
    district: ['Sorong Timur', 'Sorong Manoi', 'Sorong Kota', 'Sorong Utara'][i % 4],
    created: '2026-08-01',
    status: 'active',
    flags: i === 3 ? 'Sengketa pengiriman ditinjau' : 'Tidak ada laporan'
  }));
  const today = new Date();
  const orders = Array.from({
    length: 72
  }, (_, i) => {
    const p = products[i % products.length];
    const quantity = i % 3 + 1;
    const lines = [{
      slug: p.slug,
      quantity,
      price: p.price,
      variant: p.slug === 'nike-air-force-white' ? '40' : ''
    }];
    const gross = p.price * quantity;
    const fee = platformFee(lines, initialConfig);
    const gateway = Math.round(gross * initialConfig.gateway.percentage / 100) + initialConfig.gateway.fixed;
    const fulfillment = i % 3 === 0 ? 'pickup' : p.seller === 'dapur-nona' ? 'seller' : 'local';
    const date = new Date(today);
    date.setDate(today.getDate() - Math.floor(i / 3));
    date.setHours(8 + i % 10, i % 60, 0, 0);
    const created = date.toISOString();
    const status = ['paid', 'processing', 'in_delivery', 'completed', 'completed', 'completed', 'cancelled', 'refunded', 'pending_payment', 'payment_failed', 'ready_for_delivery', 'completed'][i % 12];
    const resolved = fulfillment === 'pickup' && ['in_delivery', 'ready_for_delivery'].includes(status) ? 'ready_for_pickup' : status;
    const paymentStatus = resolved === 'cancelled' ? 'expired' : resolved === 'pending_payment' ? 'pending' : resolved === 'payment_failed' ? 'failed' : resolved === 'refunded' ? 'refunded' : 'success';
    const milestones = ['pending_payment', ...(paymentStatus === 'success' || paymentStatus === 'refunded' ? ['paid'] : []), ...(['processing', 'ready_for_delivery', 'ready_for_pickup', 'in_delivery', 'completed'].includes(resolved) ? ['processing'] : []), ...(resolved === 'completed' ? [fulfillment === 'pickup' ? 'ready_for_pickup' : 'ready_for_delivery', ...(fulfillment !== 'pickup' ? ['in_delivery'] : [])] : []), resolved];
    return {
      id: `WM-${260924 - i}`,
      checkoutId: `CHECK-${i}`,
      buyer: buyers[i % buyers.length].id,
      seller: p.seller,
      lines,
      fulfillment,
      status: resolved,
      paymentStatus,
      method: ['QRIS', 'Virtual Account', 'E-Wallet'][i % 3],
      created,
      paidAt: paymentStatus === 'success' ? created : null,
      paymentReference: `DEMO-REF-${8100 + i}`,
      gross_order_value: gross,
      platform_fee: fee,
      payment_gateway_fee: gateway,
      seller_net_amount: gross - fee - gateway,
      delivery: initialConfig.delivery[fulfillment],
      service: initialConfig.buyerServiceFee,
      discount: 0,
      address: {
        ...sampleAddress,
        recipient: buyers[i % buyers.length].name,
        phone: buyers[i % buyers.length].phone,
        district: buyers[i % buyers.length].district
      },
      timeline: [...new Set(milestones)].map(status => ({
        status,
        at: created
      }))
    };
  });
  return {
    version: 1,
    cart: [],
    orders,
    sessions: [],
    buyers,
    sellers: sellers.map((s, i) => ({
      ...s,
      owner: ['Ardi Saputra', 'Monika Kambu', 'Frans Mayor', 'Dewi Sesa', 'Lina Waromi'][i],
      email: `${s.slug}@example.com`,
      phone: '081248761291',
      status: i === 4 ? 'pending' : 'active',
      created: '2026-08-10'
    })),
    admins: [{
      id: 'ADM-01',
      name: 'Clara Wambrauw',
      email: 'clara@example.com',
      role: 'admin',
      status: 'active',
      created: '2026-08-12',
      lastLogin: new Date().toISOString()
    }],
    config: initialConfig,
    addresses: [{
      ...sampleAddress,
      id: 'home'
    }],
    audit: [
      {id:'AUD-SEED-02',at:'2026-08-12T02:00:00.000Z',actor:'super_admin',role:'super_admin',action:'Admin Created',target:'ADM-01',reason:'Penyiapan tim operasional Sorong.',device:'127.0.0.1 · Demo browser',details:'Clara Wambrauw · role admin · simulated invitation'},
      {id:'AUD-SEED-01',at:'2026-08-10T02:00:00.000Z',actor:'super_admin',role:'super_admin',action:'Seller Approved',target:'ruang-sole',reason:'Profil dan alamat lapak demo telah diverifikasi.',device:'127.0.0.1 · Demo browser',details:'Ruang Sole · Sorong Kota'}
    ],
    reports: [{
      id: 'RPT-091',
      type: 'Order issue',
      target: orders[3].id,
      description: 'Buyer meminta pengecekan bukti pengiriman.',
      status: 'open'
    }, {
      id: 'RPT-092',
      type: 'Suspicious listing',
      target: products[2].slug,
      description: 'Spesifikasi produk perlu diverifikasi.',
      status: 'open'
    }, {
      id: 'RPT-093',
      type: 'Reported seller',
      target: 'sela-studio',
      description: 'Dokumen verifikasi toko belum lengkap.',
      status: 'open'
    }, {
      id: 'RPT-094',
      type: 'Prohibited content',
      target: products[5].slug,
      description: 'Tinjau klaim pada deskripsi produk.',
      status: 'open'
    }, {
      id: 'RPT-095',
      type: 'Buyer/seller dispute',
      target: orders[15].id,
      description: 'Permintaan mediasi kondisi produk.',
      status: 'open'
    }],
    productStatus: {},
    categoryStatus: {},
    notifications: [],
    settings: {
      supportHours: '08.00–17.00 WIT',
      region: 'Papua Barat Daya',
      city: 'Kota Sorong'
    }
  };
}
