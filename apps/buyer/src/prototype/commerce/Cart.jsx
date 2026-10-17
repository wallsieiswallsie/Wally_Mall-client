import { Link } from '../../../../../packages/ui/navigation.jsx';
import { usePrototype } from '../../../../../packages/shared/state/PrototypeContext.jsx';
import { EmptyState } from '../../../../../packages/ui/components/common/UI.jsx';
import { CartLines, Totals } from '../../../../../packages/shared/prototype/commerce/CartParts.jsx';
export default function Cart() {
  const {
    view,
    estimate
  } = usePrototype();
  const q = estimate();
  return <div className="page w-commerce"><div className="w-page-title"><p className="eyebrow">PILIHAN LOKALMU</p><h1>Keranjang belanja</h1><p>Satu checkout, beberapa lapak. Semuanya dekat.</p></div>{!view.cart.length ? <EmptyState title="Keranjangmu masih kosong" text="Temukan pilihan favorit dari lapak Sorong." /> : <div className="w-checkout-grid"><div className="w-stack">{q.groups.map(g => <section className="w-panel" key={g.seller}><h2>{view.sellers.find(s => s.slug === g.seller)?.name}</h2><CartLines group={g} editable /></section>)}</div><aside className="w-panel w-summary"><h2>Ringkasan belanja</h2><Totals quote={q} /><p className="muted">Estimasi pengiriman. Pilih delivery atau pickup saat checkout. Biaya mengikuti konfigurasi platform.</p><Link className="btn btn-primary full" to="/checkout">Lanjut checkout →</Link><Link className="text-link" to="/explore">Tambah pilihan lokal</Link></aside></div>}</div>;
}
