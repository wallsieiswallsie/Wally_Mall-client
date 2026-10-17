import { Link } from '../../../ui/navigation.jsx';

import { usePrototype } from '../../state/PrototypeContext.jsx';
import { rupiah } from '../../utils/format.js';
import { ProductImage } from '../../components/product/ProductCard.jsx';
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
