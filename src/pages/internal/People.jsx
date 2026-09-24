import { useState } from 'react';
import { usePrototype } from '../../state/PrototypeContext';
import { Badge, Confirm, DataTable } from '../../components/commerce/Shared';
import { Modal } from '../../components/common/UI';
import { metrics, rate, buyerSpending } from '../../domain/analytics';
import { rupiah } from '../../utils/format';
import { Kpis } from './Overview';
export default function People({
  kind = 'sellers'
}) {
  const {
    view,
    session,
    action
  } = usePrototype();
  const [detail, setDetail] = useState(null);
  const [change, setChange] = useState(null);
  const [status, setStatus] = useState('');
  const buyers = kind === 'buyers';
  const financial = session.role === 'super_admin';
  const people = buyers ? view.buyers : view.sellers;
  const key = p => buyers ? p.id : p.slug;
  const related = p => view.orders.filter(o => buyers ? o.buyer === p.id : o.seller === p.slug);
  const person = people.find(p => key(p) === detail);
  const os = person ? related(person) : [];
  const m = metrics(os);
  const statusActions = buyers ? [['suspended', 'Suspend'], ['active', 'Activate'], ['review', 'Review']] : [['active', 'Approve / Activate'], ['rejected', 'Reject'], ['suspended', 'Suspend'], ['review', 'Review Seller']];
  return <><div className="w-dashboard-title"><div><p className="eyebrow">{buyers ? 'BUYER RELATIONSHIPS' : 'LOCAL BUSINESSES'}</p><h1>{buyers ? 'Buyers' : financial ? 'Sellers' : 'Seller verification'}</h1><p>{buyers ? 'Kenali pembeli yang kembali dan komunitas yang terus tumbuh.' : 'Bantu usaha Sorong tumbuh dengan kepercayaan.'}</p></div></div><Kpis items={buyers ? [['Total buyers', people.length], ['New buyers', people.filter(p => new Date(p.created) > new Date(Date.now() - 30 * 86400000)).length], ['Active buyers', metrics(view.orders).activeBuyers], ['Repeat buyers', people.filter(p => metrics(related(p)).transactions > 1).length]] : [['Total sellers', people.length], ['Active sellers', people.filter(p => p.status === 'active').length], ['Pending verification', people.filter(p => p.status === 'pending').length], ['Suspended sellers', people.filter(p => p.status === 'suspended').length]]} /><section className="w-panel">{!financial && <p className="w-insight">Need-to-know access · Kontak dan identitas pemilik disamarkan. Tinjau profil usaha dan kelengkapan dokumen demo.</p>}<DataTable rows={people.filter(p => !status || p.status === status)} keyOf={key} filter={<select aria-label="Filter status akun" className="select" value={status} onChange={e => setStatus(e.target.value)}><option value="">Semua status</option>{[...new Set(people.map(p => p.status))].map(s => <option key={s}>{s}</option>)}</select>} columns={[{
        label: buyers ? 'Buyer' : 'Store',
        render: p => <button className="text-link" onClick={() => setDetail(key(p))}>{p.name}</button>
      }, {
        label: 'Area',
        render: p => p.district || p.location
      }, {
        label: 'Order count',
        render: p => related(p).length
      }, ...(financial ? [{
        label: buyers ? 'Total spending' : 'Seller GMV',
        render: p => rupiah(buyers ? buyerSpending(related(p)) : metrics(related(p)).gmv)
      }, {
        label: 'Completion',
        render: p => `${rate(related(p).filter(o => o.status === 'completed').length, related(p).length)}%`
      }, {
        label: 'Cancellation',
        render: p => `${rate(related(p).filter(o => o.status === 'cancelled').length, related(p).length)}%`
      }] : []), {
        label: 'Account status',
        render: p => <Badge status={p.status} />
      }, {
        label: 'Action',
        render: p => <button className="text-link" onClick={() => setDetail(key(p))}>Review →</button>
      }]} /></section>{person && <Modal title={person.name} onClose={() => setDetail(null)}><div className="w-stack"><Badge status={person.status} /><h3>{buyers ? 'Identity & contact' : 'Business information'}</h3><p>{person.about || person.name}</p><p>{person.district || person.location} · Bergabung {person.created}</p><p>{financial ? `${person.owner || person.name} · ${person.phone} · ${person.email}` : 'Owner #SO-102 · 08******91 · o***@example.com'}</p>{!buyers && <><a className="text-link" href={`/store/${person.slug}`}>Lihat toko →</a><p>Dokumen demo: identitas pemilik {person.status === 'pending' ? 'menunggu verifikasi' : 'terverifikasi'}; alamat usaha tersedia.</p><h3>Produk toko</h3>{view.products.filter(p => p.seller === person.slug).map(p => <p key={p.slug}>{p.name} · {p.stock} stok</p>)}</>}{financial && <><Kpis items={[[buyers ? 'Total spending' : 'GMV', rupiah(buyers ? buyerSpending(os) : m.gmv)], ['Frekuensi order', os.length], ...(!buyers ? [['Platform fees generated', rupiah(m.paid.reduce((n, o) => n + o.platform_fee, 0))], ['Seller net earnings', rupiah(m.paid.reduce((n, o) => n + o.seller_net_amount, 0))]] : [])]} /><h3>Order & transaction history</h3>{os.map(o => <div className="w-list-row" key={o.id}><div><strong>{o.id}</strong><small>TX-{o.id} · {o.method} · {rupiah(o.gross_order_value)}</small></div><Badge status={o.status} /></div>)}</>}<h3>Reports / flags</h3><p>{person.flags || view.reports.filter(r => r.target === key(person)).map(r => r.description).join(' · ') || 'Tidak ada laporan akun.'}</p><div className="w-actions">{statusActions.map(([value, label]) => <button className="btn btn-outline" key={value} disabled={person.status === value} onClick={() => setChange({
            id: key(person),
            value,
            label
          })}>{label}</button>)}</div></div></Modal>}{change && <Confirm title={change.label} onClose={() => setChange(null)} onConfirm={reason => action(buyers ? 'buyer' : 'seller', change.id, change.value, reason)}>Ubah status {person?.name}. Ini adalah perubahan simulasi dan akan masuk ke Audit Log.</Confirm>}</>;
}
