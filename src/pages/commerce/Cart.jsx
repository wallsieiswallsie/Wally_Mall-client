import { Link } from 'react-router';
import { usePrototype } from '../../state/PrototypeContext';
import { rupiah } from '../../utils/format';
import { ProductImage } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/common/UI';
export function Totals({
  quote: q
}) {
  return <dl className="w-totals">{[['Subtotal barang', q.subtotal], ['Delivery fee', q.delivery], ['Biaya layanan buyer', q.service], ['Diskon', -q.discount], ['Grand total', q.total]].map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{rupiah(v)}</dd></div>)}</dl>;
}
export function CartLines({
  group,
  editable = false
}) {
  const {
    view,
    changeQuantity
  } = usePrototype();
  return <div className="w-stack">{group.lines.map(l => {
      const p = view.products.find(p => p.slug === l.slug);
      return <article className="w-cart-line" key={l.key || l.slug}><div className="w-cart-image"><ProductImage product={p} /></div><div><Link to={`/product/${p.slug}`}><strong>{p.name}</strong></Link><small>{l.variant ? `Varian: ${l.variant} · ` : ''}{rupiah(l.price)} / item</small><small>Stok tersedia: {p.stock}</small>{editable ? <div className="w-actions"><label>Jumlah <input aria-label={`Jumlah ${p.name}`} type="number" className="input w-quantity" min="1" max={p.stock} value={l.quantity} onChange={e => {
                if (e.target.value) changeQuantity(l.key, Number(e.target.value));
              }} /></label><button className="text-link" onClick={() => changeQuantity(l.key, 0)}>Hapus</button></div> : <small>{l.quantity} item</small>}</div><strong>{rupiah(l.price * l.quantity)}</strong></article>;
    })}</div>;
}
export default function Cart() {
  const {
    view,
    estimate
  } = usePrototype();
  const q = estimate();
  return <div className="page w-commerce"><div className="w-page-title"><p className="eyebrow">PILIHAN LOKALMU</p><h1>Keranjang belanja</h1><p>Satu checkout, beberapa lapak. Semuanya dekat.</p></div>{!view.cart.length ? <EmptyState title="Keranjangmu masih kosong" text="Temukan pilihan favorit dari lapak Sorong." /> : <div className="w-checkout-grid"><div className="w-stack">{q.groups.map(g => <section className="w-panel" key={g.seller}><h2>{view.sellers.find(s => s.slug === g.seller)?.name}</h2><CartLines group={g} editable /></section>)}</div><aside className="w-panel w-summary"><h2>Ringkasan belanja</h2><Totals quote={q} /><p className="muted">Estimasi pengiriman. Pilih delivery atau pickup saat checkout. Biaya mengikuti konfigurasi platform.</p><Link className="btn btn-primary full" to="/checkout">Lanjut checkout →</Link><Link className="text-link" to="/explore">Tambah pilihan lokal</Link></aside></div>}</div>;
}
