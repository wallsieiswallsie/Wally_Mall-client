import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router";
import { products } from "../data/products";
import { sellers } from "../data/sellers";
import { categories } from "../data/categories";
import { ProductGrid, ProductImage } from "../components/product/ProductCard";
import { EmptyState, SectionHeading, Modal } from "../components/common/UI";
import SellerCard from "../components/seller/SellerCard";
import Icon from "../components/common/Icon";
import { rupiah } from "../utils/format";
export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const { favorites, toggleFavorite, notify } = useOutletContext();
  const [photo, setPhoto] = useState(0);
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!product)
    return (
      <EmptyState
        title="Produk tidak ditemukan"
        text="Yuk, lihat pilihan lain dari seller Sorong."
      />
    );
  const seller = sellers.find((s) => s.slug === product.seller);
  const category = categories.find((c) => c.slug === product.category);
  const contact = () =>
    notify({
      title: `Hubungi ${seller.name}`,
      message:
        "Di versi mendatang, kamu bisa menghubungi penjual untuk menanyakan produk ini. Ini adalah preview UI; belum ada pesan atau transaksi yang dikirim.",
    });
  return (
    <div className="page product-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/category/${category.slug}`}>{category.name}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="product-detail-grid">
        <div className="gallery">
          <div className={`gallery-main photo-${photo}`}>
            <ProductImage product={product} />
            <div hidden className="image-fallback">
              {product.name}
            </div>
            <span className="gallery-label">
              Foto ilustrasi · {photo + 1}/2
            </span>
          </div>
          <div className="gallery-thumbs">
            {[0, 1].map((i) => (
              <button
                key={i}
                className={photo === i ? "selected" : ""}
                aria-label={
                  i ? "Lihat detail foto ilustrasi" : "Lihat foto utama"
                }
                aria-pressed={photo === i}
                onClick={() => setPhoto(i)}
              >
                <ProductImage product={product} />
              </button>
            ))}
            <span>Foto utama & detail</span>
          </div>
        </div>
        <div className="product-detail-copy">
          <div className="chip-row">
            <span className="badge badge-soft">{product.condition}</span>
            <span className="muted inline-icon">
              <Icon name="pin" size={15} />
              {seller.location}
            </span>
          </div>
          <h1>{product.name}</h1>
          {product.rating && (
            <p className="rating-line">
              <Icon name="star" size={17} />
              <strong>{product.rating}</strong>
              <span>Rating contoh</span>
            </p>
          )}
          <p className="detail-price">{rupiah(product.price)}</p>
          <p className="stock-label">
            <span className="location-dot" />
            {product.stock} {product.category === "jasa" ? "slot" : "produk"}{" "}
            tersedia <span>· stok contoh</span>
          </p>
          <div className="detail-actions">
            <button className="btn btn-primary" onClick={contact}>
              <Icon name="chat" />
              Hubungi Penjual
            </button>
            <button
              className={`btn btn-outline ${favorites.includes(slug) ? "selected" : ""}`}
              aria-pressed={favorites.includes(slug)}
              onClick={() => toggleFavorite(slug)}
            >
              <Icon name="heart" />
              {favorites.includes(slug) ? "Tersimpan" : "Simpan"}
            </button>
            <button
              className="btn btn-outline"
              aria-label="Bagikan produk"
              onClick={() => {
                setShare(true);
                setCopied(false);
              }}
            >
              <Icon name="share" />
            </button>
          </div>
          <p className="contact-note">
            Tertarik? Tanyakan detailnya langsung ke seller.
          </p>
          <div className="detail-seller">
            <SellerCard seller={seller} />
            <Link className="text-link" to={`/store/${seller.slug}`}>
              Lihat toko
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </div>
      <div className="product-information">
        <section>
          <h2>Tentang produk ini</h2>
          <p>{product.description}</p>
          <div className="chip-row">
            {product.tags.map((tag) => (
              <Link
                key={tag}
                className="tag"
                to={`/search?q=${encodeURIComponent(tag)}`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </section>
        <dl>
          {[
            ["Kategori", category.name],
            ["Kondisi", product.condition],
            ["Lokasi", seller.location],
            ["Stok contoh", `${product.stock} tersedia`],
          ].map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <section>
        <SectionHeading
          title="Produk serupa"
          to={`/category/${category.slug}`}
        />
        <ProductGrid
          products={products
            .filter((p) => p.category === product.category && p.slug !== slug)
            .slice(0, 5)}
        />
        {!products.some(
          (p) => p.category === product.category && p.slug !== slug,
        ) && (
          <p className="muted">
            Pilihan di kategori ini akan segera bertambah.
          </p>
        )}
      </section>
      <section>
        <SectionHeading
          title="Produk lain dari seller"
          to={`/store/${seller.slug}`}
        />
        <ProductGrid
          products={products
            .filter((p) => p.seller === product.seller && p.slug !== slug)
            .slice(0, 5)}
        />
      </section>
      <div className="mobile-product-cta">
        <div>
          <small>Harga produk</small>
          <strong>{rupiah(product.price)}</strong>
        </div>
        <button className="btn btn-primary" onClick={contact}>
          <Icon name="chat" size={17} />
          Hubungi Penjual
        </button>
      </div>
      {share && (
        <Modal title="Bagikan produk" onClose={() => setShare(false)}>
          <p className="notice-copy">
            Bagikan tautan produk ini. Tautan hanya dapat dibuka jika prototype
            sedang tersedia.
          </p>
          <label className="field">
            <span>Tautan produk</span>
            <input className="input" readOnly value={window.location.href} />
          </label>
          <button
            className="btn btn-primary full"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
              } catch {
                setCopied(false);
                notify({
                  title: "Salin tautan",
                  message:
                    "Clipboard tidak tersedia di browser ini. Pilih dan salin tautan produk dari address bar.",
                });
                setShare(false);
              }
            }}
          >
            {copied ? "Tautan tersalin" : "Salin tautan"}
          </button>
        </Modal>
      )}
    </div>
  );
}
