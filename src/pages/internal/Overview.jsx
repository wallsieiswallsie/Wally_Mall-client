import { useState } from 'react';
import { Link } from 'react-router';
import { usePrototype } from '../../state/PrototypeContext';
import { Badge } from '../../components/commerce/Shared';
import { metrics, rate, growth, windowOrders, monthOrders, healthStatus } from '../../domain/analytics';
import { labels } from '../../domain/commerce';
import { rupiah } from '../../utils/format';
export function Kpis({
  items
}) {
  return <div className="w-kpis">{items.map(([label, value, change]) => <article className="w-kpi" key={label}><span>{label}</span><strong>{value}</strong>{change && <small>{change}</small>}</article>)}</div>;
}
export function Distribution({
  orders
}) {
  const groups = [['paid'], ['processing'], ['ready_for_delivery', 'in_delivery', 'ready_for_pickup'], ['completed'], ['cancelled'], ['refunded']];
  return <section className="w-panel"><h2>Distribusi pesanan</h2><p className="muted">{orders.length} pesanan · periode terpilih</p><div className="w-stack">{groups.map((ss, i) => {
        const n = orders.filter(o => ss.includes(o.status)).length;
        return <div key={ss[0]}><div className="w-heading"><span>{['Paid', 'Processing', 'Delivery / Pickup', 'Completed', 'Cancelled', 'Refunded'][i]}</span><strong>{n}</strong></div><div className="w-meter"><i style={{
              width: `${rate(n, orders.length)}%`
            }} /></div></div>;
      })}</div><small>Menunggu pembayaran / gagal: {orders.filter(o => ['pending_payment', 'payment_failed'].includes(o.status)).length}</small></section>;
}
export default function Overview({
  operational = false
}) {
  const {
    view,
    session
  } = usePrototype();
  const finance = session.role === 'super_admin' && !operational;
  const [days, setDays] = useState(30);
  const [compare, setCompare] = useState('month');
  const selected = windowOrders(view.orders, days);
  const now = metrics(selected);
  const today = windowOrders(view.orders, 1);
  const prev = metrics(compare === 'day' ? windowOrders(view.orders, 1, 1) : monthOrders(view.orders, 1));
  const current = metrics(compare === 'day' ? windowOrders(view.orders, 1) : monthOrders(view.orders));
  const open = view.reports.filter(r => r.status !== 'resolved');
  const base = session.role === 'super_admin' ? '/super-admin' : '/admin';
  const purchased = Object.values(now.paid.reduce((a, o) => ({
    ...a,
    [o.buyer]: (a[o.buyer] || 0) + 1
  }), {}));
  const successfulPayments = selected.filter(o => o.paymentStatus === 'success' || o.paymentStatus === 'refunded').length;
  const paymentRate = rate(successfulPayments, selected.filter(o => o.paymentStatus !== 'pending').length);
  const repeatRate = rate(purchased.filter(n => n > 1).length, purchased.length);
  const completionRate = rate(now.completed, successfulPayments);
  const cancellationRate = rate(now.cancelled, selected.length);
  const refundRate = rate(now.refunded, selected.length);
  const activeRatio = rate(now.activeSellers, view.sellers.length);
  const checkoutRate = rate(successfulPayments, selected.length + 12);
  const pendingSellers = view.sellers.filter(s => s.status === 'pending').length;
  const health = [['Buyer Growth', growth(now.activeBuyers, prev.activeBuyers), healthStatus(now.activeBuyers - prev.activeBuyers, 0, -2)], ['Seller Growth', growth(now.activeSellers, prev.activeSellers), healthStatus(now.activeSellers - prev.activeSellers, 0, -1)], ['Active Seller Ratio', activeRatio + '%', healthStatus(activeRatio, 70, 40)], ['Repeat Purchase Rate', repeatRate + '%', healthStatus(repeatRate, 30, 15)], ['Checkout Conversion', checkoutRate + '%', healthStatus(checkoutRate, 70, 40)], ['Payment Success Rate', paymentRate + '%', healthStatus(paymentRate, 95, 75)], ['Order Completion Rate', completionRate + '%', healthStatus(completionRate, 80, 40)], ['Cancellation Rate', cancellationRate + '%', healthStatus(cancellationRate, 5, 15, false)], ['Refund Rate', refundRate + '%', healthStatus(refundRate, 3, 10, false)], ['Average Order Value', rupiah(now.aov), healthStatus(now.aov, 100000, 50000)], ['GMV per Active Seller', rupiah(now.activeSellers ? now.gmv / now.activeSellers : 0), healthStatus(now.activeSellers ? now.gmv / now.activeSellers : 0, 1000000, 300000)], ['Transactions per Active Buyer', now.activeBuyers ? (now.transactions / now.activeBuyers).toFixed(1) : 0, healthStatus(now.activeBuyers ? now.transactions / now.activeBuyers : 0, 2, 1)], ['Pending Seller Verification', pendingSellers, healthStatus(pendingSellers, 0, 5, false)]];
  const chart = Array.from({
    length: Math.min(days, 12)
  }, (_, i) => {
    const bins = Math.min(days, 12);
    const offset = Math.floor((bins - 1 - i) * days / bins);
    const size = Math.floor((bins - i) * days / bins) - offset;
    return {
      label: new Date(Date.now() - offset * 86400000).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      }),
      ...metrics(windowOrders(view.orders, size, offset))
    };
  });
  const max = Math.max(...chart.map(d => d.gmv), 1);
  const funnel = [['Product Views', selected.length * 14 + 48], ['Add to Cart', selected.length * 3 + 24], ['Checkout Started', selected.length + 12], ['Payment Initiated', selected.length], ['Payment Success', successfulPayments], ['Completed', now.completed]];
  return <><div className="w-dashboard-title"><div><p className="eyebrow">{finance ? 'MARKETPLACE PULSE' : 'OPERASIONAL HARI INI'} · SORONG</p><h1>{finance ? 'Overview marketplace' : 'Halo, tim Wally.'}</h1><p>{finance ? 'Lihat pertumbuhan, pahami perjalanan, dan jaga kepercayaan.' : 'Bantu setiap pesanan sampai. Jaga setiap lapak tetap terpercaya.'}</p></div><label className="field"><span>Rentang data</span><select className="select" value={days} onChange={e => setDays(Number(e.target.value))}>{[[7, '7 Days'], [30, '30 Days'], [90, '3 Months'], [180, '6 Months'], [365, '1 Year']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label></div><div className="w-insight"><span>✦</span><p><strong>Dari Sorong, tumbuh bersama.</strong> {open.length} laporan perlu ditinjau dan {view.sellers.filter(s => s.status === 'pending').length} lapak menunggu verifikasi.</p><Link className="text-link" to={`${base}/reports`}>Tinjau sekarang →</Link></div>{finance ? <><div className="w-heading"><p className="muted">Ringkasan {days} hari · demo berbasis pesanan</p><select aria-label="Perbandingan KPI" className="select" value={compare} onChange={e => setCompare(e.target.value)}><option value="day">Today vs Yesterday</option><option value="month">This Month vs Last Month</option></select></div><Kpis items={[["Gross Merchandise Value", rupiah(now.gmv), `${growth(current.gmv, prev.gmv)} dibanding periode sebelumnya`], ["Platform Revenue", rupiah(now.revenue), `${growth(current.revenue, prev.revenue)} · fee seller + layanan buyer`], ["Total Transactions", now.transactions, growth(current.transactions, prev.transactions)], ["Average Order Value", rupiah(now.aov), growth(current.aov, prev.aov)], ["Total Buyers", view.buyers.length, 'Akun terdaftar'], ["Active Buyers", now.activeBuyers, 'Pembeli bertransaksi'], ["Total Sellers", view.sellers.length, 'Lapak terdaftar'], ["Active Sellers", now.activeSellers, 'Lapak bertransaksi'], ["Total Products", view.products.filter(p => p.moderation !== 'removed').length, 'Produk tersedia'], ["Orders Today", today.length, 'Semua status'], ["Completed Orders", now.completed, 'Periode terpilih'], ["Cancelled Orders", now.cancelled, 'Periode terpilih']]} /><div className="w-dashboard-grid"><section className="w-panel w-chart-panel"><div className="w-heading"><div><h2>GMV & Platform Revenue</h2><p className="muted">Nilai barang berbayar dibanding pendapatan fee Wally</p></div><span className="w-badge">IDR</span></div><div className="w-chart-legend"><span>● GMV</span><span>● Platform Revenue</span></div><div className="w-bar-chart" role="img" aria-label={`GMV ${rupiah(now.gmv)}, platform revenue ${rupiah(now.revenue)}`}>{chart.map((d, i) => <div key={i} className="w-chart-column" title={`${d.label}: GMV ${rupiah(d.gmv)}, Revenue ${rupiah(d.revenue)}`}><div><i style={{
                  height: `${d.gmv / max * 100}%`
                }} /><b style={{
                  height: `${d.revenue / max * 100}%`
                }} /></div><small>{d.label}</small></div>)}</div><details><summary>Lihat data chart</summary><div className="w-table-scroll"><table className="w-table"><tbody>{chart.map((d, i) => <tr key={i}><td>{d.label}</td><td>{rupiah(d.gmv)}</td><td>{rupiah(d.revenue)}</td></tr>)}</tbody></table></div></details><small>GMV tidak termasuk delivery dan biaya layanan. Refund dikeluarkan dari GMV dan revenue. Fee gateway bukan pendapatan Wally.</small></section><Distribution orders={selected} /></div><div className="w-dashboard-grid"><section className="w-panel"><h2>Marketplace funnel</h2><p className="muted">Event discovery simulasi; pembayaran dan selesai mengikuti pesanan.</p>{funnel.map(([label, n], i) => <div className="w-funnel" key={label}><span>{label}</span><div className="w-meter"><i style={{
                width: `${rate(n, funnel[0][1])}%`
              }} /></div><strong>{n}</strong><small>{i ? `${rate(n, funnel[i - 1][1])}% dari tahap sebelumnya` : 'Awal perjalanan'}</small></div>)}</section><Geography view={view} orders={selected} finance /></div><section className="w-panel"><h2>Marketplace health</h2><p className="muted">Threshold demo. Payment success mencakup pembayaran yang kemudian direfund; completion dibanding seluruh pesanan yang pernah dibayar.</p><div className="w-health-grid">{health.map(([label, value, status]) => <div key={label}><span>{label}</span><strong>{value}</strong><Badge status={status} /></div>)}</div></section></> : <><Kpis items={[["Orders Today", today.length], ["Orders Processing", view.orders.filter(o => o.status === 'processing').length], ["Orders Awaiting Delivery", view.orders.filter(o => ['ready_for_delivery', 'in_delivery', 'ready_for_pickup'].includes(o.status)).length], ["Orders Completed Today", today.filter(o => o.status === 'completed').length], ["Pending Seller Verification", view.sellers.filter(s => s.status === 'pending').length], ["Products Pending Review", view.reports.filter(r => r.type.includes('listing') || r.type.includes('content')).filter(r => r.status !== 'resolved').length], ["Open Reports", open.length], ["Support Cases", open.filter(r => r.type.includes('dispute') || r.type.includes('issue')).length]]} /><div className="w-dashboard-grid"><Distribution orders={selected} /><section className="w-panel"><h2>Operational issues & recent reports</h2>{open.map(r => <Link className="w-list-row" key={r.id} to={`${base}/reports`}><div><strong>{r.type}</strong><p>{r.description}</p><small>{r.target}</small></div><Badge status={r.status} /></Link>)}</section></div><div className="w-dashboard-grid"><section className="w-panel"><h2>Pending seller verification</h2>{view.sellers.filter(s => s.status === 'pending').map(s => <Link className="w-list-row" key={s.slug} to={`${base}/sellers`}><strong>{s.name}</strong><span>{s.location} →</span></Link>)}<h2>Products requiring review</h2>{view.reports.filter(r => r.type.includes('listing') || r.type.includes('content')).map(r => <Link className="w-list-row" key={r.id} to={`${base}/products`}>{view.products.find(p => p.slug === r.target)?.name}<Badge status={r.status} /></Link>)}</section><Geography view={view} orders={selected} /></div></>}</>;
}
function Geography({
  view,
  orders,
  finance = false
}) {
  const areas = [...new Set([...orders.map(o => o.address.district), ...view.sellers.map(s => s.location)])];
  return <section className="w-panel"><h2>Dekat di setiap distrik</h2><p className="muted">Papua Barat Daya → Kota Sorong → Distrik</p><div className="w-table-scroll"><table className="w-table"><thead><tr>{['Area', 'Orders', 'Buyers', 'Sellers', ...(finance ? ['GMV'] : [])].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{areas.map(area => {
            const os = orders.filter(o => o.address.district === area);
            return <tr key={area}><td>{area}</td><td>{os.length}</td><td>{new Set(os.map(o => o.buyer)).size}</td><td>{view.sellers.filter(s => s.location === area).length}</td>{finance && <td>{rupiah(metrics(os).gmv)}</td>}</tr>;
          })}</tbody></table></div><small>Buyers = pembeli bertransaksi pada periode terpilih. Hierarki wilayah siap diperluas.</small></section>;
}
