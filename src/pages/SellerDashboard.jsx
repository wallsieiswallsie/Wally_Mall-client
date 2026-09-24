import { Link, useOutletContext } from "react-router";
import Icon from "../components/common/Icon";
import { ProductImage } from "../components/product/ProductCard";
import { rupiah } from "../utils/format";
import { usePrototype } from '../state/PrototypeContext';
import { metrics } from '../domain/analytics';
import { Badge, Notifications } from '../components/commerce/Shared';
export default function SellerDashboard() {
  const {
    view,
    session,
    login
  } = usePrototype();
  const myStore = view.sellers.find(s => s.slug === session.seller);
  const performance = metrics(view.orders);
  const {
    notify,
    demoStore: store,
    demoProducts
  } = useOutletContext();
  const preview = demoProducts.length > 0;
  const items = [...demoProducts.filter(p => p.seller === session.seller), ...view.products.filter(p => p.seller === session.seller)];
  return <div className="page dashboard-page">
      <div className="dashboard-heading">
        <header className="page-heading">
          <p className="eyebrow">LAPAKMU DI WALLY · PREVIEW</p>
          <h1>Halo, {store?.name || myStore.name}.</h1>
          <p>Langkah kecil hari ini, makin banyak yang ketemu besok.</p>
        </header>
        <Link className="btn btn-primary" to="/seller/products/new">
          <Icon name="plus" size={18} />
          Tambah Produk
        </Link>
      </div>
      <div className="w-panel w-stack"><div className="w-heading"><div><h2>Pesanan & performa toko</h2><p>GMV toko: {rupiah(performance.gmv)} · {performance.transactions} transaksi berbayar</p></div><Notifications /></div><label className="field"><span>Demo seller account · pilih lapak untuk demonstrasi</span><select className="select" value={session.seller} onChange={e => login('seller', e.target.value)}>{view.sellers.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label><Link className="btn btn-primary" to="/seller/orders">Proses pesanan toko ({view.orders.filter(o => o.status === 'paid').length} baru) →</Link>{view.orders.slice(0, 3).map(o => <Link key={o.id} className="w-list-row" to={`/seller/orders/${o.id}`}><strong>{o.id}</strong><Badge status={o.status} /></Link>)}</div>
      <div className="dashboard-stats">
        {[["store", "Produk Aktif", items.length], ["eye", "Dilihat", "248"], ["heart", "Favorit", "32"], ["chat", "Chat / Contact", "12"]].map(([icon, label, value]) => <div key={label}>
            <Icon name={icon} size={21} />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>Data contoh</small>
          </div>)}
      </div>
      <nav className="seller-menu" aria-label="Menu seller">
        <a href="#produk-saya" className="chip selected">
          Produk Saya
        </a>
        <Link className="chip" to="/seller/products/new">
          Tambah Produk
        </Link>
        <button className="chip" onClick={() => notify({
        title: "Profil toko",
        message: store ? `${store.name} · ${store.location}. ${store.description}. Ini adalah preview profil dari onboarding.` : `${myStore.name} · ${myStore.location}. ${myStore.about}`
      })}>
          Profil Toko
        </button>
        <Link className="text-link" to={`/store/${session.seller}`}>
          Lihat contoh lapak
          <Icon name="arrow" size={16} />
        </Link>
      </nav>
      <section id="produk-saya" className="dashboard-products">
        <div className="section-heading">
          <h2>Produk saya</h2>
          <span className="muted">{items.length} produk contoh</span>
        </div>
        {preview && <div className="inline-notice">
            <Icon name="check" size={18} />
            Produk contoh ditambahkan ke preview sesi ini.
          </div>}
        <div className="dashboard-list">
          {items.map((p, i) => <article key={p.slug || i}>
              <div className="dashboard-product-image">
                <ProductImage product={p} />
              </div>
              <div>
                <h3>{p.name}</h3>
                <p>{rupiah(p.price)}</p>
                <small>{p.stock} stok contoh</small>
              </div>
              <Badge status={p.slug ? p.moderation : 'Preview'} />
              {p.slug ? <Link className="icon-btn" to={`/product/${p.slug}`} aria-label={`Lihat ${p.name}`}>
                  <Icon name="arrow" />
                </Link> : <button className="icon-btn" aria-label="Lihat status produk preview" onClick={() => notify({
            title: "Produk preview",
            message: "Produk ini hanya ditampilkan dalam state lokal halaman. Belum dipublikasikan dan akan hilang saat sesi preview direset."
          })}>
                  <Icon name="eye" />
                </button>}
            </article>)}
        </div>
      </section>
    </div>;
}
