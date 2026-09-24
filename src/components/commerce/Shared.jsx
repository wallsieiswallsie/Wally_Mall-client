import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { usePrototype, DEMO_ENABLED } from '../../state/PrototypeContext';
import { labels } from '../../domain/commerce';
import { Modal } from '../common/UI';
import { metrics, rate, windowOrders } from '../../domain/analytics';
import { rupiah } from '../../utils/format';
export function Badge({
  status
}) {
  return <span className={`w-badge ${['active', 'success', 'completed', 'paid', 'Healthy', 'resolved'].includes(status) ? 'good' : ['suspended', 'cancelled', 'payment_failed', 'Critical', 'removed', 'failed'].includes(status) ? 'bad' : 'warm'}`}>{labels[status] || status?.replaceAll('_', ' ')}</span>;
}
export function DemoAccess({
  compact = false
}) {
  const {
    login,
    session,
    logout
  } = usePrototype();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!DEMO_ENABLED) return null;
  const content = <><p className="eyebrow">PROTOTYPE ACCESS</p><p>Hanya untuk demo. Bukan autentikasi production. Semua data dan pembayaran merupakan simulasi.</p><div className="w-role-grid">{[['buyer', 'View as Buyer'], ['seller', 'View as Seller'], ['admin', 'View as Admin'], ['super_admin', 'View Super Admin Prototype']].map(([role, label]) => <button key={role} className={`btn ${role === 'super_admin' ? 'btn-primary' : 'btn-outline'}`} onClick={() => {
        navigate(login(role));
        setOpen(false);
      }}>{label}</button>)}</div>{session && <button className="text-link" onClick={() => {
      logout();
      navigate('/login');
      setOpen(false);
    }}>Keluar dari sesi demo</button>}</>;
  return compact ? <><button className="w-demo-entry" onClick={() => setOpen(true)}>Prototype Mode · {session?.role || 'Pilih role'} ↗</button>{open && <Modal title="Jelajahi Wally Mall" onClose={() => setOpen(false)}>{content}</Modal>}</> : <div className="w-demo-panel">{content}</div>;
}
export function Confirm({
  title,
  children,
  onConfirm,
  onClose
}) {
  const [reason, setReason] = useState('');
  return <Modal title={title} onClose={onClose}><form className="form-stack" onSubmit={e => {
      e.preventDefault();
      onConfirm(reason);
      onClose();
    }}><div>{children}</div><label className="field"><span>Alasan perubahan</span><textarea className="textarea" required value={reason} onChange={e => setReason(e.target.value)} placeholder="Catatan untuk Audit Log" /></label><div className="w-actions"><button type="button" className="btn btn-outline" onClick={onClose}>Batal</button><button className="btn btn-primary">Konfirmasi simulasi</button></div></form></Modal>;
}
export function DataTable({
  columns,
  rows,
  keyOf = r => r.id,
  searchPlaceholder = 'Cari...',
  filter = null
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const found = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  const pages = Math.max(1, Math.ceil(found.length / 8));
  const current = Math.min(page, pages - 1);
  return <div><div className="w-table-tools"><input aria-label={searchPlaceholder} className="input" value={search} onChange={e => {
        setSearch(e.target.value);
        setPage(0);
      }} placeholder={searchPlaceholder} />{filter}<span className="muted">{found.length} hasil</span></div><div className="w-table-scroll"><table className="w-table"><thead><tr>{columns.map(c => <th key={c.label}>{c.label}</th>)}</tr></thead><tbody>{found.slice(current * 8, current * 8 + 8).map(r => <tr key={keyOf(r)}>{columns.map(c => <td key={c.label}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}</tbody></table>{!found.length && <div className="w-empty">Belum ada hasil yang cocok. Coba ubah pencarian atau filter.</div>}</div><div className="w-pagination"><button className="btn btn-outline" disabled={current === 0} onClick={() => setPage(current - 1)}>Sebelumnya</button><span>{current + 1} / {pages}</span><button className="btn btn-outline" disabled={current + 1 >= pages} onClick={() => setPage(current + 1)}>Berikutnya</button></div></div>;
}
export function Timeline({
  order
}) {
  const done = order.timeline.map(t => t.status);
  const steps = ['pending_payment', 'paid', 'processing', ...(order.fulfillment === 'pickup' ? ['ready_for_pickup'] : ['ready_for_delivery', 'in_delivery']), 'completed'];
  return <ol className="w-timeline">{[...steps, ...(['cancelled', 'payment_failed', 'refunded'].includes(order.status) ? [order.status] : [])].map(s => <li key={s} className={done.includes(s) ? 'done' : ''}><span /><div><strong>{labels[s]}</strong>{order.timeline.find(t => t.status === s) && <small>{new Date(order.timeline.find(t => t.status === s).at).toLocaleString('id-ID')}</small>}</div></li>)}</ol>;
}
export function Notifications() {
  const {
    notifications,
    session,
    view
  } = usePrototype();
  const [open, setOpen] = useState(false);
  const initial = {
    buyer: ['Pesananmu dapat dilacak dari menu Pesanan.'],
    seller: [`${view.orders.filter(o => o.status === 'paid').length} pesanan berbayar memerlukan proses.`, 'Laporan dan ulasan toko tersedia untuk ditinjau.'],
    admin: [...view.sellers.filter(s => s.status === 'pending').map(s => `${s.name} menunggu verifikasi.`), `${view.reports.filter(r => r.status !== 'resolved').length} laporan dan kasus operasional memerlukan review.`],
    super_admin: []
  }[session?.role] || [];
  if (session?.role === 'super_admin') {
    const recent = windowOrders(view.orders, 7);
    const previous = windowOrders(view.orders, 7, 7);
    const cancellations = rate(recent.filter(o => o.status === 'cancelled').length, recent.length);
    const failures = rate(recent.filter(o => o.paymentStatus === 'failed').length, recent.length);
    if (cancellations > 5) initial.push(`Cancellation alert: ${cancellations}% dalam 7 hari, di atas threshold demo 5%.`);
    if (failures > 5) initial.push(`Payment failure alert: ${failures}% dalam 7 hari, di atas threshold demo 5%.`);
    if (metrics(previous).revenue && metrics(recent).revenue < metrics(previous).revenue * .7) initial.push('Revenue anomaly: pendapatan fee turun lebih dari 30% dibanding 7 hari sebelumnya.');
    recent.filter(o => o.gross_order_value >= 1000000).slice(0, 3).forEach(o => initial.push(`High-value transaction: ${o.id} · ${rupiah(o.gross_order_value)}.`));
    if (view.audit.length) initial.push(`${view.audit.length} aktivitas tercatat. Tinjau perubahan admin dan fee di Audit Log.`);
    if (!initial.length) initial.push('Tidak ada anomali yang melewati threshold demo.');
  }
  return <><button className="btn btn-outline" onClick={() => setOpen(true)}>Notifikasi · {notifications.length + initial.length}</button>{open && <Modal title="Pusat notifikasi" onClose={() => setOpen(false)}><div className="w-stack">{[...notifications.map(n => n.text), ...initial].map((n, i) => <div className="w-panel" key={i}>{n}</div>)}</div></Modal>}</>;
}
