import { useState } from "react";
import { Link, useParams, useOutletContext } from "react-router";
import { sellers } from "../data/sellers";
import { products } from "../data/products";
import { EmptyState } from "../components/common/UI";
import Icon from "../components/common/Icon";
import { Listing } from "./Search";
export default function Store() {
  const { slug } = useParams();
  const seller = sellers.find((s) => s.slug === slug);
  const [tab, setTab] = useState("products");
  const { notify } = useOutletContext();
  if (!seller)
    return (
      <EmptyState
        title="Toko tidak ditemukan"
        text="Temukan seller lokal lainnya di Wally."
        to="/search?tab=toko"
        label="Temukan toko"
      />
    );
  const items = products.filter((p) => p.seller === slug);
  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/search?tab=toko">Toko</Link>
        <span>/</span>
        {seller.name}
      </div>
      <div className="store-cover">
        <span>USAHA LOKAL. CERITA LOKAL.</span>
        <span className="store-cover-mark">Sorong, Ketemu di Wally.</span>
      </div>
      <header className="store-header">
        <div className={`seller-avatar large avatar-${seller.slug}`}>
          {seller.initials}
        </div>
        <div className="store-title">
          {seller.badge && <span className="gold-badge">✦ {seller.badge}</span>}
          <h1>{seller.name}</h1>
          <p>
            <Icon name="pin" size={15} />
            {seller.location}
            <span>· Bergabung {seller.joined}</span>
          </p>
          <div className="store-stats">
            <span>
              <Icon name="star" size={16} />
              <strong>{seller.rating}</strong> rating
            </span>
            <span>
              <strong>{items.length}</strong> produk
            </span>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() =>
            notify({
              title: `Hubungi ${seller.name}`,
              message:
                "Ini adalah preview tombol kontak seller. Belum ada pesan yang dikirim atau layanan chat yang terhubung.",
            })
          }
        >
          <Icon name="chat" size={18} />
          Hubungi Seller
        </button>
      </header>
      <div
        role="tablist"
        aria-label="Informasi toko"
        className="tabs result-tabs"
      >
        {[
          ["products", "Produk"],
          ["about", "Tentang"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`tab ${tab === id ? "tab-active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "products" ? (
        <Listing source={items} showStores={false} />
      ) : (
        <section className="store-about">
          <h2>Kenalan dengan {seller.name}</h2>
          <p>{seller.about}</p>
          <dl>
            <dt>Kategori usaha</dt>
            <dd>{seller.category}</dd>
            <dt>Lokasi</dt>
            <dd>{seller.location}, Papua Barat Daya</dd>
            <dt>Bergabung</dt>
            <dd>{seller.joined}</dd>
          </dl>
          <p className="muted">
            Profil seller dan rating ini merupakan data contoh.
          </p>
        </section>
      )}
    </div>
  );
}
