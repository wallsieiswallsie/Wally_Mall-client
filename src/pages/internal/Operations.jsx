import { useState } from 'react';
import { usePrototype } from '../../state/PrototypeContext';
import { Badge, Confirm, DataTable } from '../../components/commerce/Shared';
import { Modal } from '../../components/common/UI';
import { categories } from '../../data/categories';
import { rupiah } from '../../utils/format';
export default function Operations({
  section = 'reports'
}) {
  const {
    view,
    session,
    action
  } = usePrototype();
  const [change, setChange] = useState(null);
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState('');
  const isProducts = section === 'products';
  const isCategories = section === 'categories';
  const title = {
    products: 'Products',
    categories: 'Categories',
    reports: 'Reports',
    moderation: 'Moderation',
    support: 'Support'
  }[section];
  const rows = isProducts ? view.products : isCategories ? categories.map(c => ({
    ...c,
    status: view.categoryStatus[c.slug] || 'active'
  })) : view.reports.filter(r => section === 'support' ? r.type.includes('dispute') || r.type.includes('issue') : section === 'moderation' ? r.type.includes('listing') || r.type.includes('content') || r.type.includes('seller') : true);
  const filtered = rows.filter(r => !status || (r.moderation || r.status) === status);
  const type = isProducts ? 'product' : isCategories ? 'category' : 'report';
  function ask(row, value, label) {
    setChange({
      id: row.id || row.slug,
      value,
      label
    });
  }
  return <><div className="w-dashboard-title"><div><p className="eyebrow">MARKETPLACE OPERATIONS</p><h1>{title}</h1><p>{isProducts ? 'Tinjau katalog dan jaga kualitas produk lokal.' : isCategories ? 'Kelola visibilitas kategori untuk discovery.' : 'Dengarkan laporan, tinjau konteks, dan catat tindak lanjut.'}</p></div></div><section className="w-panel"><DataTable rows={filtered} keyOf={r => r.id || r.slug} filter={<select aria-label="Filter status" className="select" value={status} onChange={e => setStatus(e.target.value)}><option value="">Semua status</option>{[...new Set(rows.map(r => r.moderation || r.status))].map(s => <option key={s}>{s}</option>)}</select>} columns={isProducts ? [{
        label: 'Product',
        key: 'name'
      }, {
        label: 'Seller',
        render: p => view.sellers.find(s => s.slug === p.seller)?.name
      }, {
        label: 'Stock',
        key: 'stock'
      }, {
        label: 'Status',
        render: p => <Badge status={p.moderation} />
      }, {
        label: 'Action',
        render: p => <div className="w-actions"><button className="text-link" onClick={() => setDetail(p)}>Review</button><button className="text-link" onClick={() => ask(p, p.moderation === 'removed' ? 'active' : 'removed', p.moderation === 'removed' ? 'Restore product' : 'Remove product')}>{p.moderation === 'removed' ? 'Restore' : 'Remove'}</button></div>
      }] : isCategories ? [{
        label: 'Category',
        key: 'name'
      }, {
        label: 'Products',
        render: c => view.products.filter(p => p.category === c.slug).length
      }, {
        label: 'Status',
        render: c => <Badge status={c.status} />
      }, {
        label: 'Action',
        render: c => <button className="text-link" onClick={() => ask(c, c.status === 'active' ? 'hidden' : 'active', 'Ubah visibilitas kategori')}>{c.status === 'active' ? 'Sembunyikan' : 'Aktifkan'}</button>
      }] : [{
        label: 'Report',
        key: 'id'
      }, {
        label: 'Type',
        key: 'type'
      }, {
        label: 'Target',
        key: 'target'
      }, {
        label: 'Issue',
        key: 'description'
      }, {
        label: 'Status',
        render: r => <Badge status={r.status} />
      }, {
        label: 'Action',
        render: r => <button className="text-link" onClick={() => setDetail(r)}>Review →</button>
      }]} /></section>{detail && <Modal title={detail.name || detail.id} onClose={() => setDetail(null)}><div className="w-stack"><p>{detail.description}</p><p>{detail.target || detail.seller}</p><Badge status={detail.moderation || detail.status} />{!isProducts && <><h3>Operational review</h3><p>Periksa bukti demo, koordinasikan dengan pihak terkait, dan catat alasan penyelesaian.</p><p>Kontak kasus: Buyer #{view.orders.find(o => o.id === detail.target)?.buyer || 'WB-10284'} · 08******91 · n***@example.com</p>{session.role === 'super_admin' && <div className="w-panel"><h3>Account & financial context</h3>{view.orders.filter(o => o.id === detail.target).map(o => <p key={o.id}>{view.buyers.find(b => b.id === o.buyer)?.name} · {rupiah(o.gross_order_value)} · Platform fee {rupiah(o.platform_fee)} · {o.status}</p>)}<p>{view.sellers.find(s => s.slug === detail.target)?.owner || 'Riwayat akun lengkap tersedia di Buyers / Sellers.'}</p></div>}</>}<div className="w-actions"><button className="btn btn-outline" onClick={() => ask(detail, isProducts ? 'review' : 'review', 'Mulai review')}>Tandai ditinjau</button><button className="btn btn-primary" onClick={() => {
            ask(detail, isProducts ? 'active' : 'resolved', isProducts ? 'Approve product' : 'Resolve report');
            setDetail(null);
          }}>{isProducts ? 'Approve' : 'Resolve'}</button></div></div></Modal>}{change && <Confirm title={change.label} onClose={() => setChange(null)} onConfirm={reason => action(type, change.id, change.value, reason)}>Perubahan pada {change.id} dicatat dengan alasan review.</Confirm>}</>;
}
