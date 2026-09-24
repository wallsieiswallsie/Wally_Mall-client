import { Link, useParams } from 'react-router';
import { usePrototype } from '../../state/PrototypeContext';
import { Badge, DataTable, Timeline, Notifications } from '../../components/commerce/Shared';
import { fulfillmentLabels, nextSellerStatus, labels } from '../../domain/commerce';
import { rupiah } from '../../utils/format';
import { CartLines } from './Cart';
import { EmptyState } from '../../components/common/UI';
export default function Orders() {
  const {
    view,
    session,
    updateOrder
  } = usePrototype();
  const {
    id
  } = useParams();
  const seller = session.role === 'seller';
  const prefix = seller ? '/seller/orders' : '/orders';
  const order = view.orders.find(o => o.id === id);
  if (id && !order) return <EmptyState title="Pesanan tidak ditemukan" text="Pesanan ini tidak tersedia untuk akunmu." to={prefix} label="Semua pesanan" />;
  return <div className="page w-commerce"><div className="w-heading"><div className="w-page-title"><p className="eyebrow">{seller ? 'KELOLA LAPAKMU' : 'BELANJA LOKAL'}</p><h1>{order ? order.id : seller ? 'Pesanan toko' : 'Pesanan saya'}</h1></div><Notifications /></div>{order ? <div className="w-checkout-grid"><section className="w-panel"><Badge status={order.status} /><h2>{view.sellers.find(s => s.slug === order.seller)?.name}</h2><CartLines group={order} /><dl className="w-totals">{[['Barang', order.gross_order_value], ['Pengiriman', order.delivery], ['Biaya layanan', order.service], ['Diskon', -order.discount], ['Total', order.gross_order_value + order.delivery + order.service - order.discount]].map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{rupiah(v)}</dd></div>)}</dl><h3>{fulfillmentLabels[order.fulfillment]}</h3><p>{order.address.recipient} · {order.address.phone}</p><p>{order.address.address}, {order.address.district}, {order.address.city}</p><p>{order.address.notes}</p>{!seller && order.status === 'pending_payment' && view.sessions?.some(p => p.checkoutId === order.checkoutId) && <Link className="btn btn-primary" to={`/payment/${view.sessions.find(p => p.checkoutId === order.checkoutId).id}`}>Lanjutkan pembayaran</Link>}{seller && nextSellerStatus(order) && <button className="btn btn-primary" onClick={() => updateOrder(order.id, nextSellerStatus(order))}>{labels[nextSellerStatus(order)]} →</button>}<Link className="text-link" to={prefix}>← Semua pesanan</Link></section><aside className="w-panel"><h2>Perjalanan pesanan</h2><Timeline order={order} /></aside></div> : <section className="w-panel"><DataTable rows={view.orders} columns={[{
        label: 'Pesanan',
        render: o => <Link className="text-link" to={`${prefix}/${o.id}`}>{o.id}</Link>
      }, {
        label: 'Toko',
        render: o => view.sellers.find(s => s.slug === o.seller)?.name
      }, {
        label: 'Tanggal',
        render: o => new Date(o.created).toLocaleDateString('id-ID')
      }, {
        label: 'Total barang',
        render: o => rupiah(o.gross_order_value)
      }, {
        label: 'Status',
        render: o => <Badge status={o.status} />
      }, {
        label: 'Aksi',
        render: o => <Link className="text-link" to={`${prefix}/${o.id}`}>Detail →</Link>
      }]} /></section>}</div>;
}
