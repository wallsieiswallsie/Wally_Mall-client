import { Link } from "react-router";
import SearchBar from "../components/search/SearchBar";
import CategoryLinks from "../components/marketplace/CategoryLinks";
import { SectionHeading } from "../components/common/UI";
import Icon from "../components/common/Icon";
import { ProductGrid } from "../components/product/ProductCard";
import SellerCard from "../components/seller/SellerCard";
import { products } from "../data/products";
import { sellers } from "../data/sellers";
const discoveries = [
  {
    title: "Langkah baru, gaya kamu.",
    label: "SNEAKERS & FASHION",
    query: "sneakers",
    image: products[0].image,
    tone: "sand",
    count: "Pilihan sneakers lokal",
  },
  {
    title: "Manisnya dekat rumah.",
    label: "DARI DAPUR LOKAL",
    query: "croissant",
    image: products[1].image,
    tone: "peach",
    count: "Fresh dari seller Sorong",
  },
  {
    title: "Upgrade kecil, beda rasa.",
    label: "GADGET & AKSESORIS",
    query: "headphone",
    image: products[2].image,
    tone: "sage",
    count: "Teman kerja & santai",
  },
];
export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-intro">
          <span className="location-label">
            <span className="location-dot" />
            LOKAL SORONG, PAPUA BARAT DAYA
          </span>
          <h1>
            Cari apa <span>di Sorong?</span>
          </h1>
          <p>
            Dari barang incaran sampai toko langganan.
            <br className="mobile-break" /> Temukan yang dekat, di sini.
          </p>
          <SearchBar hero />
          <div className="hero-trending">
            <span>Sering dicari</span>
            {["Sneakers", "Kue ulang tahun", "iPhone", "Thrift"].map((q) => (
              <Link key={q} to={`/search?q=${encodeURIComponent(q)}`}>
                {q}
                <span>↗</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-note">
          <div className="note-mark">
            w<span>✦</span>
          </div>
          <p>
            Nggak perlu jauh.
            <br />
            <strong>
              Yang kamu cari,
              <br />
              bisa jadi ada di sini.
            </strong>
          </p>
          <span>Sorong, Ketemu di Wally.</span>
          <div className="note-line" />
        </div>
      </section>
      <section className="category-section">
        <SectionHeading title="Mulai dari yang kamu suka" to="/categories" />
        <CategoryLinks />
      </section>
      <section>
        <SectionHeading
          eyebrow="PILIHAN DI SEKITARMU"
          title="Lagi dicari di Sorong"
          to="/explore"
          link="Jelajahi lainnya"
        />
        <div className="discovery-grid">
          {discoveries.map((d) => (
            <Link
              className={`discovery-card ${d.tone}`}
              to={`/search?q=${encodeURIComponent(d.query)}`}
              key={d.query}
            >
              <div className="discovery-text">
                <span className="eyebrow">{d.label}</span>
                <h3>{d.title}</h3>
                <span className="discovery-caption">{d.count}</span>
                <span className="round-arrow">
                  <Icon name="arrow" size={19} />
                </span>
              </div>
              <img src={d.image} alt="" />
            </Link>
          ))}
        </div>
      </section>
      <section>
        <SectionHeading
          eyebrow="BARANG BARU, CERITA BARU"
          title="Baru di Wally"
          to="/explore"
        />
        <ProductGrid products={products.slice(0, 5)} />
      </section>
      <section className="seller-section">
        <SectionHeading
          eyebrow="DEKAT LOKASINYA, KENAL ORANGNYA"
          title="Kenalan dengan seller Sorong"
          to="/search?tab=toko"
          link="Temukan toko"
        />
        <div className="seller-grid">
          {sellers.slice(0, 3).map((s) => (
            <SellerCard key={s.slug} seller={s} />
          ))}
        </div>
      </section>
      <section className="local-section">
        <div className="local-intro">
          <span className="eyebrow">COBA CARI YANG KAMU PIKIRKAN</span>
          <h2>“Ada di Sorong?”</h2>
          <p>Siapa tahu, cuma selangkah dari rumah.</p>
          <Link to="/search" className="text-link">
            Cari di Wally
            <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="local-items">
          {[
            ["Mechanical Keyboard", 6],
            ["Croissant", 1],
            ["Thrift Nike", 8],
            ["Standing Desk", 9],
          ].map(([name, index]) => (
            <Link to={`/search?q=${encodeURIComponent(name)}`} key={name}>
              <img src={products[index].image} alt="" loading="lazy" />
              <span>
                {name}
                <Icon name="arrow" size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="seller-banner">
        <div className="banner-icon">
          <Icon name="store" size={30} />
        </div>
        <div>
          <span className="eyebrow">UNTUK USAHA LOKAL</span>
          <h2>Buka lapakmu di Wally.</h2>
          <p>Biar lebih banyak orang Sorong ketemu produkmu.</p>
        </div>
        <Link className="btn btn-primary" to="/seller/register">
          Mulai buka lapak
          <Icon name="arrow" size={18} />
        </Link>
      </section>
    </>
  );
}
