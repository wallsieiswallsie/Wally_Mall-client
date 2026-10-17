import { Report } from '../../../../packages/shared/live/Report.jsx';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { Link } from '../../../../packages/ui/navigation.jsx';

import { useNavigate } from '../../../../packages/ui/navigation.jsx';

import { useParams } from 'react-router';

import { useSearchParams } from 'react-router';

import { paymentAction } from '../../../../packages/api-client/payment.js';
import { SectionHeading } from '../../../../packages/ui/components/common/UI.jsx';
import { EmptyState } from '../../../../packages/ui/components/common/UI.jsx';
import Icon from '../../../../packages/ui/components/common/Icon.jsx';
import SearchBar from '../../../../packages/shared/components/search/SearchBar.jsx';
import { useServer } from '../../../../packages/shared/live/context.jsx';
import { money } from '../../../../packages/shared/live/format.js';
import { useResource } from '../../../../packages/shared/live/resource.js';
import { Resource } from '../../../../packages/shared/live/Forms.jsx';
import { Action } from '../../../../packages/shared/live/Forms.jsx';
import { Form } from '../../../../packages/shared/live/Forms.jsx';
import { addressFields } from '../../../../packages/shared/live/format.js';

function Home() {
  const categories = useResource("/categories", { auth: false });
  const products = useResource("/products?limit=5", { auth: false });
  const stores = useResource("/stores?limit=3", { auth: false });
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
            <br />
            Temukan yang dekat, di sini.
          </p>
          <SearchBar hero suggestions={false} />
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
        <Resource resource={categories}>
          {(rows) => (
            <div className="live-grid">
              {rows.map((c) => (
                <Link className="w-panel" key={c.id} to={`/category/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </Resource>
      </section>
      <section>
        <SectionHeading
          eyebrow="BARANG BARU, CERITA BARU"
          title="Baru di Wally"
          to="/explore"
        />
        <Resource resource={products}>
          {(rows) => <Cards products={rows} />}
        </Resource>
      </section>
      <section className="seller-section">
        <SectionHeading
          title="Kenalan dengan seller Sorong"
          to="/search?tab=toko"
        />
        <Resource resource={stores}>
          {(rows) => <StoreCards stores={rows} />}
        </Resource>
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
        </Link>
      </section>
    </>
  );
}
function StoreCards({ stores }) {
  return stores.length ? (
    <div className="seller-grid">
      {stores.map((s) => (
        <Link className="seller-card" to={`/store/${s.slug}`} key={s.id}>
          {s.logo_url && (
            <img className="live-store-logo" src={s.logo_url} alt="" />
          )}
          <h3>{s.name}</h3>
          <p>{s.description}</p>
          <small>
            {s.location?.district} {s.location?.city}
          </small>
          <p>
            {s.rating_count
              ? `${Number(s.rating_avg).toFixed(1)} · ${s.rating_count} ulasan`
              : "Belum ada ulasan"}
          </p>
        </Link>
      ))}
    </div>
  ) : (
    <EmptyState title="Belum ada toko yang tersedia" />
  );
}
function Cards({ products, favorites = false, reload }) {
  const { api, user } = useServer();
  if (!products?.length)
    return <EmptyState title="Belum ada produk yang tersedia." to={null} />;
  return (
    <div className="product-grid">
      {products.map((p) => (
        <article className="product-card" key={p.id}>
          <Link className="product-visual" to={`/product/${p.slug}`}>
            {p.media?.find((m) => m.media_type === "image") ? (
              <img
                src={p.media.find((m) => m.media_type === "image").url}
                alt={p.name}
                loading="lazy"
              />
            ) : (
              <div className="image-placeholder">
                <Icon name="grid" size={34} />
                <span>{p.name}</span>
              </div>
            )}
          </Link>
          <div className="product-copy">
            <Link className="product-name" to={`/product/${p.slug}`}>
              {p.name}
            </Link>
            <strong>{money(p.min_price)}</strong>
            <Link className="product-seller" to={`/store/${p.store_slug}`}>
              {p.store_name}
            </Link>
            {user && (
              <Action
                run={() =>
                  api.request(`/favorites/${p.id}`, {
                    method: favorites ? "DELETE" : "PUT",
                  })
                }
                onDone={reload}
              >
                {favorites ? "Hapus favorit" : "Simpan favorit"}
              </Action>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
function Catalog({ favorites = false, category = false }) {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const storesTab = !favorites && !category && params.get("tab") === "toko";
  const categories = useResource(category ? "/categories" : null, {
    auth: false,
  });
  const selected = categories.data?.find((c) => c.slug === slug);
  const query = new URLSearchParams({
    q: params.get("q") || "",
    sort: params.get("sort") || "newest",
    limit: "30",
    offset: params.get("offset") || "0",
    ...(selected ? { category_id: selected.id } : {}),
    ...(!favorites ? { type: storesTab ? "store" : "product" } : {}),
  });
  const list = useResource(
    category && !selected
      ? null
      : `${favorites ? "/favorites" : "/search"}?${query}`,
    { auth: favorites },
  );
  if (category && categories.loading) return <p>Memuat kategori…</p>;
  if (category && categories.error)
    return <Resource resource={categories}>{() => null}</Resource>;
  if (category && !selected) return <p>Kategori tidak ditemukan.</p>;
  return (
    <>
      <header className="page-heading live-catalog-heading">
        <p className="eyebrow">PILIHAN LOKALMU</p>
        <h1 id="catalog-title">
          {favorites ? "Favorit saya" : selected?.name || "Temukan yang dekat."}
        </h1>
      </header>
      <form
        key={params.toString()}
        className={`live-search ${favorites || category ? "live-search-products" : ""}`}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setParams(Object.fromEntries(new FormData(e.currentTarget)));
        }}
      >
        <input
          className="input"
          name="q"
          aria-label="Cari produk"
          defaultValue={params.get("q") || ""}
          placeholder="Cari produk atau toko…"
        />
        <select
          name="sort"
          className="select"
          aria-label="Urutan"
          defaultValue={params.get("sort") || "newest"}
        >
          <option value="newest">Terbaru</option>
          {!storesTab && (
            <>
              <option value="price_asc">Harga terendah</option>
              <option value="price_desc">Harga tertinggi</option>
            </>
          )}
        </select>
        {!favorites && !category && (
          <select
            className="select"
            name="tab"
            aria-label="Jenis pencarian"
            defaultValue={storesTab ? "toko" : "produk"}
          >
            <option value="produk">Produk</option>
            <option value="toko">Toko</option>
          </select>
        )}
        <button className="btn btn-primary">Cari</button>
      </form>
      <section
        className="live-results"
        aria-labelledby="catalog-title"
        aria-busy={list.loading}
      >
        <Resource resource={list}>
          {(products) => (
            <>
              {storesTab ? (
                <StoreCards stores={products} />
              ) : (
                <Cards
                  products={products}
                  favorites={favorites}
                  reload={list.reload}
                />
              )}
              <nav
                className="w-pagination live-pagination"
                aria-label="Halaman hasil"
              >
                <button
                  className="btn btn-outline"
                  disabled={Number(query.get("offset")) === 0}
                  onClick={() =>
                    setParams({
                      ...Object.fromEntries(params),
                      offset: String(
                        Math.max(0, Number(query.get("offset")) - 30),
                      ),
                    })
                  }
                >
                  Sebelumnya
                </button>
                <button
                  className="btn btn-outline"
                  disabled={products.length < 30}
                  onClick={() =>
                    setParams({
                      ...Object.fromEntries(params),
                      offset: String(Number(query.get("offset")) + 30),
                    })
                  }
                >
                  Selanjutnya
                </button>
              </nav>
            </>
          )}
        </Resource>
      </section>
    </>
  );
}
function Categories() {
  const resource = useResource("/categories", { auth: false });
  return (
    <>
      <h1>Kategori</h1>
      <Resource resource={resource}>
        {(rows) => (
          <div className="live-grid">
            {rows.map((c) => (
              <Link className="w-panel" key={c.id} to={`/category/${c.slug}`}>
                <h2>{c.name}</h2>
                <p>{c.description}</p>
              </Link>
            ))}
          </div>
        )}
      </Resource>
    </>
  );
}
function Product() {
  const { slug } = useParams(),
    { api, user } = useServer();
  const resource = useResource(
    `/products/by-slug/${encodeURIComponent(slug)}`,
    { auth: false },
  );
  const [added, setAdded] = useState(false);
  const viewed = useRef(null);
  useEffect(() => {
    const productId = resource.data?.id;
    if (productId && viewed.current !== productId) {
      viewed.current = productId;
      // Analytics is best-effort and must not block the product's purchase UI.
      api
        .request(`/products/${productId}/view`, { method: "POST", auth: false })
        .catch(() => {});
    }
  }, [api, resource.data?.id]);
  return (
    <Resource resource={resource}>
      {(p) => (
        <section className="w-panel live-product">
          <div>
            {p.media
              .filter((m) => m.media_type === "image")
              .map((m) => (
                <img
                  className="live-photo"
                  key={m.id}
                  src={m.url}
                  alt={m.alt_text || p.name}
                />
              ))}
          </div>
          <div>
            <h1>{p.name}</h1>
            <Link to={`/store/${p.store_slug}`}>{p.store_name}</Link>
            <p>{p.description}</p>
            <Report targetType="product" targetId={p.id} />
            <p>{money(p.min_price)}</p>
            {user?.roles.includes("buyer") ? (
              <Form
                fields={[
                  {
                    key: "variant_id",
                    label: "Varian",
                    options: p.variants
                      .filter((v) => Number(v.available) > 0)
                      .map((v) => ({
                        value: v.id,
                        label: `${v.name} — ${money(v.price)} (stok ${v.available})`,
                      })),
                  },
                  {
                    key: "quantity",
                    label: "Jumlah",
                    type: "number",
                    min: 1,
                    max: 99999,
                    value: 1,
                  },
                ]}
                button="Tambah ke keranjang"
                submit={(data) =>
                  api.request("/cart/items", {
                    method: "POST",
                    body: {
                      variant_id: data.variant_id,
                      quantity: Number(data.quantity),
                    },
                  })
                }
                onDone={() => setAdded(true)}
              />
            ) : (
              <Link to="/login">Masuk sebagai buyer untuk belanja</Link>
            )}
            {added && (
              <p role="status">
                Produk ditambahkan. <Link to="/cart">Lihat keranjang</Link>
              </p>
            )}
          </div>
        </section>
      )}
    </Resource>
  );
}
function Store() {
  const { slug } = useParams();
  const store = useResource(`/stores/by-slug/${encodeURIComponent(slug)}`, {
    auth: false,
  });
  const products = useResource(
    store.data ? `/products?store_id=${store.data.id}&limit=100` : null,
    { auth: false },
  );
  return (
    <Resource resource={store}>
      {(s) => (
        <>
          <h1>{s.name}</h1>
          <p>{s.description}</p>
          <Report targetType="store" targetId={s.id} />
          <p>{s.location?.city}</p>
          <Resource resource={products}>
            {(rows) => <Cards products={rows} />}
          </Resource>
        </>
      )}
    </Resource>
  );
}
function Cart({ checkout = false }) {
  const { api, user } = useServer(),
    navigate = useNavigate();
  const cart = useResource("/cart"),
    addresses = useResource(checkout ? "/addresses" : null);
  const [address, setAddress] = useState(""),
    [fulfillment, setFulfillment] = useState({}),
    [method, setMethod] = useState("qris");
  const stores = [
    ...new Set((cart.data?.items || []).map((i) => i.store_id).filter(Boolean)),
  ];
  const selection = Object.fromEntries(
    stores.map((id) => [id, fulfillment[id] || "pickup"]),
  );
  const quoteBody = { fulfillment: selection, method };
  const quote = useResource(cart.data?.items.length ? "/cart/quote" : null, {
    method: "POST",
    body: quoteBody,
  });
  // Refresh the authoritative quote after a quantity mutation, including unchanged store selection.
  function reloadCart() {
    cart.reload();
    quote.reload();
  }
  return (
    <>
      <h1>{checkout ? "Checkout" : "Keranjang belanja"}</h1>
      <Resource resource={cart}>
        {(data) =>
          !data.items.length ? (
            <p>
              Keranjang masih kosong. <Link to="/explore">Jelajah produk</Link>
            </p>
          ) : (
            <div className="w-checkout-grid">
              <div className="w-stack">
                {data.items.map((item) => (
                  <section className="w-panel" key={item.id}>
                    <h3>{item.product_name || "Produk tidak tersedia"}</h3>
                    <p>
                      {item.variant_name} · {item.quantity} item ·{" "}
                      {money(item.subtotal)}
                    </p>
                    {item.unavailable && (
                      <p role="alert">
                        Hapus produk yang tidak tersedia sebelum checkout.
                      </p>
                    )}
                    <Form
                      fields={[
                        {
                          key: "quantity",
                          label: "Jumlah (0 untuk hapus)",
                          type: "number",
                          min: 0,
                          max: 99999,
                          value: item.quantity,
                        },
                      ]}
                      submit={(v) =>
                        api.request(`/cart/items/${item.id}`, {
                          method: "PATCH",
                          body: { quantity: Number(v.quantity) },
                        })
                      }
                      onDone={reloadCart}
                    />
                  </section>
                ))}
                {checkout && (
                  <>
                    <section className="w-panel">
                      <h2>Alamat penerima</h2>
                      <Resource resource={addresses}>
                        {(rows) =>
                          rows.map((a) => (
                            <label className="w-choice" key={a.id}>
                              <input
                                type="radio"
                                name="address"
                                checked={(address || rows[0]?.id) === a.id}
                                onChange={() => setAddress(a.id)}
                              />
                              <span>
                                {a.recipient_name} · {a.address_line}, {a.city}
                              </span>
                            </label>
                          ))
                        }
                      </Resource>
                      <details>
                        <summary>Tambah alamat</summary>
                        <Form
                          fields={addressFields}
                          submit={(body) =>
                            api.request("/addresses", { method: "POST", body })
                          }
                          onDone={(a) => {
                            setAddress(a.id);
                            addresses.reload();
                          }}
                        />
                      </details>
                    </section>
                    <section className="w-panel">
                      <h2>Pengiriman dan pembayaran</h2>
                      {stores.map((id) => (
                        <label className="field" key={id}>
                          <span>
                            Pengiriman:{" "}
                            {data.items
                              .filter((i) => i.store_id === id)
                              .map((i) => i.product_name)
                              .join(", ")}
                          </span>
                          <select
                            className="select"
                            value={selection[id]}
                            onChange={(e) =>
                              setFulfillment({
                                ...fulfillment,
                                [id]: e.target.value,
                              })
                            }
                          >
                            <option value="pickup">Ambil di toko</option>
                            <option value="seller_delivery">
                              Pengiriman seller
                            </option>
                            <option value="wally_local">Wally lokal</option>
                          </select>
                        </label>
                      ))}
                      <label className="field">
                        <span>Pembayaran</span>
                        <select
                          className="select"
                          value={method}
                          onChange={(e) => setMethod(e.target.value)}
                        >
                          <option value="qris">QRIS</option>
                          <option value="virtual_account">
                            Virtual Account
                          </option>
                          <option value="e_wallet">E-Wallet</option>
                        </select>
                      </label>
                      <p>
                        Provider saat ini memakai sandbox mock; tidak memproses
                        uang sungguhan.
                      </p>
                    </section>
                  </>
                )}
              </div>
              <aside className="w-panel">
                <h2>Ringkasan dari server</h2>
                <Resource resource={quote}>
                  {(q) =>
                    q && (
                      <dl className="w-totals">
                        {[
                          ["Subtotal", q.subtotal],
                          ["Pengiriman", q.delivery_total],
                          ["Layanan", q.service_fee_total],
                          ["Total", q.grand_total],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{money(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    )
                  }
                </Resource>
                {checkout ? (
                  <Action
                    disabled={
                      quote.loading ||
                      !!quote.error ||
                      !quote.data ||
                      addresses.loading
                    }
                    run={async () => {
                      const addressId = address || addresses.data?.[0]?.id;
                      if (!addressId)
                        throw new Error(
                          "Tambahkan dan pilih alamat terlebih dahulu.",
                        );
                      return api.request("/checkouts", {
                        method: "POST",
                        body: { ...quoteBody, address_id: addressId },
                      });
                    }}
                    onDone={(result) => {
                      navigate(`/payment/${result.payment.id}`);
                    }}
                  >
                    Buat pesanan
                  </Action>
                ) : (
                  <Link className="btn btn-primary" to="/checkout">
                    Lanjut checkout
                  </Link>
                )}
              </aside>
            </div>
          )
        }
      </Resource>
    </>
  );
}
function Payment() {
  const { id } = useParams(),
    { api } = useServer();
  const resource = useResource(`/payments/${id}`);
  const [reference, setReference] = useState("");
  return (
    <>
      <h1>Pembayaran</h1>
      <Resource resource={resource}>
        {(p) => (
          <section className="w-panel">
            <h2>{money(p.amount)}</h2>
            <p>
              {p.method} · {p.status}
            </p>
            <p>
              Berlaku sampai {new Date(p.expires_at).toLocaleString("id-ID")}
            </p>
            {p.provider === "mock" && (
              <p>
                Sandbox mock: tidak ada pembayaran sungguhan. Status diperbarui
                oleh webhook server.
              </p>
            )}
            <p>{paymentAction(p).message}</p>
            {paymentAction(p).canResume && (
              <Action
                run={() =>
                  api.request(`/payments/${p.id}/session`, { method: "POST" })
                }
                onDone={(result) => setReference(result.provider_reference)}
              >
                Buat / lanjutkan sesi pembayaran
              </Action>
            )}
            {reference && <p>Referensi: {reference}</p>}
            <button className="btn btn-outline" onClick={resource.reload}>
              Periksa status
            </button>
            <Link className="text-link" to="/orders">
              Lihat pesanan
            </Link>
          </section>
        )}
      </Resource>
    </>
  );
}

export { Home, StoreCards, Cards, Catalog, Categories, Product, Store, Cart, Payment };
