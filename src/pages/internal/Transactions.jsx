import { useState } from 'react';
import { usePrototype } from '../../state/PrototypeContext';
import { Badge, Confirm, DataTable, Timeline } from '../../components/commerce/Shared';
import { Modal } from '../../components/common/UI';
import { rupiah } from '../../utils/format';
import { paidStatuses, fulfillmentLabels } from '../../domain/commerce';
export default function Transactions({
  operational = false
}) {
  const {
    view,
    session,
    action,
    updateOrder
  } = usePrototype();
  const financial = session.role === 'super_admin' && !operational;
  const [detail, setDetail] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [status, setStatus] = useState('');
  const [seller, setSeller] = useState('');
  const [method, setMethod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const order = view.orders.find(o => o.id === detail);
  const rows = view.orders.filter(o => (!status || (financial ? o.paymentStatus : o.status) === status) && (!seller || o.seller === seller) && (!method || o.method === method) && (!from || o.created.slice(0, 10) >= from) && (!to || o.created.slice(0, 10) <= to) && (!min || o.gross_order_value >= Number(min)) && (!max || o.gross_order_value <= Number(max)));
  const fields = financial ? [['Gross transaction', 'gross_order_value'], ['Platform fee (seller)', 'platform_fee'], ['Payment gateway fee', 'payment_gateway_fee'], ['Seller net (barang)', 'seller_net_amount'], ['Delivery pass-through', 'delivery'], ['Biaya layanan buyer', 'service']] : [];
  return <><div className="w-dashboard-title"><div><p className="eyebrow">{financial ? 'FINANCIAL MONITORING' : 'ORDER OPERATIONS'}</p><h1>{financial ? 'Transactions' : 'Orders'}</h1><p>{financial ? 'Setiap rupiah punya perjalanan. Telusuri di sini.' : 'Pantau status pesanan dan selesaikan kendala pengiriman.'}</p></div><span className="w-badge warm">Data demo</span></div><section className="w-panel"><div className="w-filter-grid"><label className="field"><span>Dari</span><input aria-label="Tanggal mulai" className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label className="field"><span>Sampai</span><input aria-label="Tanggal akhir" className="input" type="date" value={to} onChange={e => setTo(e.target.value)} /></label><label className="field"><span>Seller</span><select className="select" value={seller} onChange={e => setSeller(e.target.value)}><option value="">Semua seller</option>{view.sellers.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label><label className="field"><span>Status</span><select className="select" value={status} onChange={e => setStatus(e.target.value)}><option value="">Semua status</option>{[...new Set(view.orders.map(o => financial ? o.paymentStatus : o.status))].map(s => <option key={s}>{s}</option>)}</select></label>{financial && <><label className="field"><span>Payment method</span><select className="select" value={method} onChange={e => setMethod(e.target.value)}><option value="">Semua metode</option>{['QRIS', 'Virtual Account', 'E-Wallet'].map(m => <option key={m}>{m}</option>)}</select></label><label className="field"><span>Amount min</span><input className="input" type="number" min="0" value={min} onChange={e => setMin(e.target.value)} /></label><label className="field"><span>Amount max</span><input className="input" type="number" min="0" value={max} onChange={e => setMax(e.target.value)} /></label></>}</div><DataTable rows={rows} searchPlaceholder="Cari order, buyer, atau transaksi..." columns={[...(financial ? [{
        label: 'Transaction ID',
        render: o => `TX-${o.id}`
      }] : []), {
        label: 'Order ID',
        render: o => <button className="text-link" onClick={() => setDetail(o.id)}>{o.id}</button>
      }, {
        label: 'Buyer',
        render: o => session.role === 'super_admin' ? view.buyers.find(b => b.id === o.buyer)?.name : `Buyer #${o.buyer}`
      }, {
        label: 'Seller',
        render: o => view.sellers.find(s => s.slug === o.seller)?.name
      }, ...fields.slice(0, 4).map(([label, key]) => ({
        label,
        render: o => rupiah(o[key])
      })), ...(financial ? [{
        label: 'Method',
        key: 'method'
      }] : []), {
        label: financial ? 'Payment status' : 'Status',
        render: o => <Badge status={financial ? o.paymentStatus : o.status} />
      }, {
        label: 'Date',
        render: o => new Date(o.created).toLocaleDateString('id-ID')
      }]} /></section>{order && <Modal title={order.id} onClose={() => setDetail(null)}><div className="w-stack"><Badge status={order.status} /><h3>{session.role === 'super_admin' ? view.buyers.find(b => b.id === order.buyer)?.name : `Buyer #${order.buyer}`}</h3><p>{order.address.phone} · {order.address.district}, {order.address.city}</p><p>{view.sellers.find(s => s.slug === order.seller)?.name} · {fulfillmentLabels[order.fulfillment]}</p>{order.lines.map((l, i) => <div className="w-heading" key={i}><span>{view.products.find(p => p.slug === l.slug)?.name} {l.variant && `(${l.variant})`} × {l.quantity}</span>{financial && <strong>{rupiah(l.price * l.quantity)}</strong>}</div>)}{financial && <><dl className="w-totals">{fields.map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{rupiah(order[key])}</dd></div>)}</dl><p>Payment: {order.method} · {order.paymentReference || 'Belum tersedia'}</p><small>Payment timestamp: {order.paidAt ? new Date(order.paidAt).toLocaleString('id-ID') : 'Belum dibayar'}</small><small>Seller net = gross − platform fee − gateway fee. Ongkir diteruskan terpisah. Tidak ada settlement sungguhan.</small></>}<Timeline order={order} />{order.status === 'pending_payment' && <button className="btn btn-outline" onClick={() => setConfirmation({
          id: order.id,
          type: 'cancel'
        })}>Intervensi: batalkan pesanan</button>}{session.role === 'super_admin' && paidStatuses.includes(order.status) && <button className="btn btn-outline" onClick={() => setConfirmation({
          id: order.id,
          type: 'refund'
        })}>Simulasikan refund</button>}</div></Modal>}{confirmation && <Confirm title={confirmation.type === 'refund' ? 'Refund transaksi demo' : 'Batalkan pesanan'} onClose={() => setConfirmation(null)} onConfirm={reason => confirmation.type === 'refund' ? action('refund', confirmation.id, '', reason) : updateOrder(confirmation.id, 'cancelled', reason)}>Perubahan dicatat pada Audit Log. {confirmation.type === 'refund' ? 'Seluruh nilai transaksi barang direfund dalam simulasi, tanpa perpindahan dana.' : 'Pesanan yang belum dibayar akan dibatalkan. Untuk checkout multi-seller, seluruh pesanan dalam sesi pembayaran yang sama ikut dibatalkan.'}</Confirm>}</>;
}
