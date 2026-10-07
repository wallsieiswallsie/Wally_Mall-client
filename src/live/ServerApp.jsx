import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { createApi } from "../api/client";
import { browserStorage, paymentLinks } from "../api/session";
import { findSellerOrder } from "../api/orders";
import { Logo, SectionHeading, EmptyState, Modal } from "../components/common/UI";
import Icon from "../components/common/Icon";
import SearchBar from "../components/search/SearchBar";
import "./live.css";

const Context = createContext(null);
const useServer = () => useContext(Context);
const money = (value) => `Rp ${BigInt(value || 0).toLocaleString("id-ID")}`;
const destination = (user) =>
  user.roles.includes("super_admin")
    ? "/super-admin"
    : user.roles.includes("admin")
      ? "/admin"
      : user.roles.includes("seller")
        ? "/seller/dashboard"
        : "/";
const names = {
  name: "Nama",
  email: "Email",
  password: "Password",
  description: "Deskripsi",
  reason: "Alasan",
  status: "Status",
  recipient_name: "Nama penerima",
  phone: "Telepon",
  province: "Provinsi",
  city: "Kota",
  district: "Distrik",
  postal_code: "Kode pos",
  address_line: "Alamat lengkap",
  notes: "Catatan",
  proposed_store_name: "Nama toko",
  business_description: "Deskripsi usaha",
  business_category_id: "Kategori usaha",
  category_id: "Kategori",
  condition: "Kondisi",
  variant_name: "Nama varian",
  price: "Harga (rupiah)",
  on_hand: "Stok",
  image_url: "URL foto produk",
  percentage: "Persentase",
  fixed_amount: "Biaya tetap (rupiah)",
  effective_from: "Berlaku mulai",
  scope_type: "Cakupan",
  scope_id: "ID toko / kategori",
  action: "Tindakan",
  title: "Judul",
  body: "Pesan",
  created_at: "Dibuat",
  order_number: "Nomor pesanan",
  product_name: "Produk",
  quantity: "Jumlah",
  total_amount: "Total",
  subtotal: "Subtotal",
  grand_total: "Total",
  moderation_status: "Moderasi",
  verification_status: "Verifikasi",
  actor_role: "Peran",
  entity_type: "Jenis",
  store_name: "Toko",
  gross_order_value: "Nilai pesanan",
  orders: "Jumlah pesanan",
  completed: "Selesai",
  gross_sales: "Penjualan bruto",
  delivery_fee: "Pengiriman",
  service_fee: "Biaya layanan",
  discount_amount: "Diskon",
  platform_fee: "Biaya platform",
  gateway_fee: "Biaya gateway",
  seller_net_amount: "Pendapatan bersih seller",
  fulfillment_type: "Pengiriman / pengambilan",
  display_status: "Status pesanan",
  method: "Metode",
  type: "Jenis",
  paid_at: "Dibayar",
  completed_at: "Selesai",
  amount: "Jumlah pembayaran",
  gmv: "Nilai penjualan bruto",
  revenue: "Pendapatan platform",
  transactions: "Transaksi berbayar",
  active_buyers: "Buyer aktif",
  active_stores: "Toko aktif",
  effective_until: "Berlaku sampai",
};
const amountFields = new Set([
  "min_price",
  "max_price",
  "price",
  "unit_price",
  "subtotal",
  "total_amount",
  "grand_total",
  "amount",
  "delivery_fee",
  "service_fee",
  "discount_amount",
  "platform_fee",
  "gateway_fee",
  "seller_net_amount",
  "gross_sales",
  "gmv",
  "revenue",
  "fixed_amount",
]);
const values = {
  awaiting_payment: "Menunggu pembayaran",
  pending_payment: "Menunggu pembayaran",
  confirmed: "Dibayar",
  paid: "Dibayar",
  processing: "Diproses",
  ready: "Siap",
  in_delivery: "Dalam pengiriman",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  pending: "Menunggu",
  success: "Berhasil",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  refunded: "Dikembalikan",
  pickup: "Ambil di toko",
  seller_delivery: "Pengiriman seller",
  wally_local: "Wally lokal",
  qris: "QRIS",
  virtual_account: "Virtual Account",
  e_wallet: "E-Wallet",
};
function displayValue(key, value) {
  if (amountFields.has(key) && /^\d+$/.test(String(value))) return money(value);
  if (
    (key.endsWith("_at") || key.startsWith("effective_")) &&
    !Number.isNaN(Date.parse(value))
  )
    return new Date(value).toLocaleString("id-ID");
  if (
    ["status", "display_status", "fulfillment_type", "type", "method"].includes(
      key,
    )
  )
    return values[value] || String(value);
  return String(value);
}
function ErrorMessage({ error }) {
  return error ? (
    <p className="w-error" role="alert">
      {error.message}
      {error.requestId && <small>Referensi: {error.requestId}</small>}
    </p>
  ) : null;
}
function useResource(
  path,
  { auth = true, method = "GET", body, sellerOrderId } = {},
) {
  const { api } = useServer();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const serialized = JSON.stringify(body);
  const resourceKey = JSON.stringify([
    path,
    auth,
    method,
    serialized,
    revision,
    sellerOrderId,
  ]);
  useEffect(() => {
    const controller = new AbortController();
    if (!path) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    setState({ loading: true, data: null, error: null, resourceKey });
    const pending = sellerOrderId
      ? findSellerOrder(api, sellerOrderId, controller.signal)
      : api.request(path, {
          auth,
          method,
          ...(serialized === undefined ? {} : { body: JSON.parse(serialized) }),
          signal: controller.signal,
        });
    pending
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: null, resourceKey });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error, resourceKey });
      });
    return () => controller.abort();
  }, [api, path, auth, method, serialized, revision, sellerOrderId]);
  return {
    ...(!path
      ? { loading: false, data: null, error: null }
      : state.resourceKey !== resourceKey
        ? { loading: true, data: null, error: null }
        : state),
    reload: () => setRevision((n) => n + 1),
  };
}
function Resource({ resource, children }) {
  if (resource.loading) return <p role="status">Memuat data…</p>;
  if (resource.error)
    return (
      <>
        <ErrorMessage error={resource.error} />
        <button className="btn btn-outline" onClick={resource.reload}>
          Coba lagi
        </button>
      </>
    );
  return resource.data == null ? null : children(resource.data);
}
function Action({ children, run, onDone, disabled = false }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const lock = useRef(false);
  return (
    <span className="live-action">
      <button
        className="btn btn-outline"
        disabled={busy || disabled}
        onClick={async () => {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          setError(null);
          try {
            const result = await run();
            onDone?.(result);
          } catch (e) {
            setError(e);
          } finally {
            lock.current = false;
            setBusy(false);
          }
        }}
      >
        {busy ? "Memproses…" : children}
      </button>
      <ErrorMessage error={error} />
    </span>
  );
}
// Native form validation complements the authoritative Zod schemas on the server.
function Form({ fields, submit, button = "Simpan", onDone }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const lock = useRef(false);
  const [saved, setSaved] = useState(false);
  const unavailable = fields.some(
    (f) => f.options && !f.options.length && !f.optional,
  );
  return (
    <form
      className="form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current) return;
        const form = e.currentTarget;
        const values = Object.fromEntries(
          [...new FormData(form)].filter(([, value]) => value !== ""),
        );
        lock.current = true;
        setBusy(true);
        setError(null);
        setSaved(false);
        try {
          const result = await submit(values);
          onDone?.(result);
          setSaved(true);
        } catch (e) {
          setError(e);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      {fields.map((field) => {
        const f = typeof field === "string" ? { key: field } : field;
        const props = {
          name: f.key,
          required: !f.optional,
          defaultValue: f.value,
          disabled: busy,
        };
        return (
          <label className="field" key={f.key}>
            <span>{f.label || names[f.key] || f.key}</span>
            {f.options ? (
              <select className="select" {...props}>
                {f.options.map((option) => (
                  <option
                    key={option.value ?? option}
                    value={option.value ?? option}
                  >
                    {option.label ?? option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                {...props}
                type={
                  f.type ||
                  (f.key === "password"
                    ? "password"
                    : f.key === "email"
                      ? "email"
                      : "text")
                }
                min={f.min}
                max={f.max}
                minLength={f.key === "password" ? 12 : undefined}
                maxLength={f.key === "password" ? 128 : undefined}
                step={f.step}
                placeholder={f.placeholder}
              />
            )}
          </label>
        );
      })}
      <ErrorMessage error={error} />
      {saved && <p role="status">Berhasil disimpan.</p>}
      {unavailable && (
        <p role="status">Pilihan yang diperlukan belum tersedia.</p>
      )}
      <button disabled={busy || unavailable} className="btn btn-primary">
        {busy ? "Memproses…" : button}
      </button>
    </form>
  );
}
function Guard({ roles, children }) {
  const { user } = useServer();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (roles && !roles.some((role) => user.roles.includes(role)))
    return (
      <p role="alert">Akun ini tidak memiliki akses ke halaman tersebut.</p>
    );
  return children;
}
function Shell() {
  const { api, user, setUser } = useServer();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTrigger = useRef(null);
  const wasMenuOpen = useRef(false);
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    if (wasMenuOpen.current && !menuOpen) menuTrigger.current?.focus();
    wasMenuOpen.current = menuOpen;
  }, [menuOpen]);
  const secondaryLinks = (
    <>
      {user && <NavLink to="/account">Akun & notifikasi</NavLink>}
      {user?.roles.includes("buyer") && (
        <>
          <NavLink to="/cart">Keranjang</NavLink>
          <NavLink to="/orders">Pesanan</NavLink>
        </>
      )}
      <NavLink to="/seller/register">Buka lapak</NavLink>
      {user?.roles.some((r) => ["seller", "admin", "super_admin"].includes(r)) && (
        <NavLink to={destination(user)}>Dashboard</NavLink>
      )}
      {user ? (
        <Action
          run={() => api.logout()}
          onDone={() => {
            setUser(null);
            navigate("/login");
          }}
        >
          Keluar ({user.name})
        </Action>
      ) : (
        <NavLink to="/login">Masuk</NavLink>
      )}
    </>
  );
  return (
    <div className="live-shell">
      <div className="top-strip">Dari Sorong, untuk Sorong.</div>
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav className="live-nav" aria-label="Navigasi utama">
            <NavLink to="/explore">Jelajah</NavLink>
            <NavLink to="/categories">Kategori</NavLink>
            <NavLink to="/favorites">Favorit</NavLink>
            <div className="live-secondary-nav">{secondaryLinks}</div>
          </nav>
          <button
            ref={menuTrigger}
            className="btn btn-outline live-menu-toggle"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>
      <main className="live-page">
        <Outlet />
      </main>
      <footer className="footer-main">
        <Logo />
        <p>Sorong, Ketemu di Wally.</p>
      </footer>
      <nav className="bottom-nav" aria-label="Navigasi mobile">
        {[
          ["/", "home", "Home"],
          ["/search", "search", "Cari"],
          ["/categories", "grid", "Kategori"],
          ["/favorites", "heart", "Favorit"],
          [user ? "/account" : "/login", "user", "Akun"],
        ].map(([to, icon, label]) => (
          <Link
            key={to}
            to={to}
            aria-current={
              location.pathname === to ||
              (to === "/search" && location.pathname === "/explore") ||
              (to === "/categories" && location.pathname.startsWith("/category/"))
                ? "page"
                : undefined
            }
          >
            <Icon name={icon} size={21} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      {menuOpen && (
        <Modal title="Menu" onClose={() => setMenuOpen(false)}>
          <nav
            className="live-menu"
            aria-label="Akun dan lapak"
            onClick={(event) => {
              if (event.target.closest("a")) setMenuOpen(false);
            }}
          >
            {secondaryLinks}
          </nav>
        </Modal>
      )}
    </div>
  );
}
function Auth({ register = false }) {
  const { api, setUser } = useServer();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <span className="eyebrow">SELAMAT DATANG DI WALLY</span>
        <h2>
          Yang kamu cari.
          <br />
          Yang dekat
          <br />
          di hati.
        </h2>
        <p>
          Barang pilihan, usaha lokal, dan cerita baru.
          <br />
          Semuanya dimulai dari Sorong.
        </p>
        <span className="auth-signature">Sorong, Ketemu di Wally.</span>
      </aside>
      <section className="auth-card">
        <h1>{register ? "Daftar di Wally" : "Masuk ke Wally"}</h1>
        <Form
          fields={[...(register ? ["name"] : []), "email", "password"]}
          button={register ? "Daftar" : "Masuk"}
          submit={(body) => api.authenticate(register, body)}
          onDone={(user) => {
            setUser(user);
            const from = location.state?.from;
            navigate(
              typeof from === "string" &&
                from.startsWith("/") &&
                !from.startsWith("//")
                ? from
                : destination(user),
              { replace: true },
            );
          }}
        />
        <p>Password minimal 12 karakter.</p>
        <Link to={register ? "/login" : "/register"}>
          {register ? "Sudah punya akun? Masuk" : "Buat akun baru"}
        </Link>
      </section>
    </div>
  );
}
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
            <Link className="product-seller" to={`/store/${p.store_slug}`}>{p.store_name}</Link>
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
              <nav className="w-pagination live-pagination" aria-label="Halaman hasil">
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
const addressFields = [
  "recipient_name",
  "phone",
  { key: "province", value: "Papua Barat Daya" },
  { key: "city", value: "Kota Sorong" },
  "district",
  "address_line",
  { key: "postal_code", optional: true },
  { key: "notes", optional: true },
];
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
                      paymentLinks(user.id, result);
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
            {p.status === "pending" && (
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
function Facts({ row }) {
  return (
    <dl className="w-totals">
      {Object.entries(row || {})
        .filter(
          ([key, value]) =>
            value !== null &&
            typeof value !== "object" &&
            !key.endsWith("_id") &&
            key !== "id" &&
            !["password_hash"].includes(key),
        )
        .map(([key, value]) => (
          <div key={key}>
            <dt>{names[key] || key.replaceAll("_", " ")}</dt>
            <dd>{displayValue(key, value)}</dd>
          </div>
        ))}
    </dl>
  );
}
function Orders({ seller = false, admin = false, financial = false }) {
  const { id } = useParams(),
    { api, user } = useServer();
  const savedPayments = paymentLinks(user.id);
  const path = financial
    ? "/super-admin/transactions"
    : admin
      ? "/admin/orders"
      : seller
        ? "/seller/orders"
        : "/orders";
  const [offset, setOffset] = useState(0);
  const resource = useResource(
    !seller && !admin && !financial && id
      ? `/orders/${id}`
      : `${path}?limit=30&offset=${offset}`,
    { sellerOrderId: seller ? id : undefined },
  );
  return (
    <>
      <h1>{seller ? "Pesanan toko" : "Pesanan"}</h1>
      <Resource resource={resource}>
        {(result) => {
          const rows = Array.isArray(result)
            ? result.filter((row) => !id || row.id === id)
            : [result];
          return (
            <div className="w-stack">
              {!rows.length && <p>Belum ada pesanan pada halaman ini.</p>}
              {rows.map((o) => (
                <section className="w-panel" key={o.id}>
                  <h2>{o.order_number}</h2>
                  <Facts row={o} />
                  {o.payment && (
                    <>
                      <h3>Pembayaran</h3>
                      <Facts row={o.payment} />
                    </>
                  )}
                  {o.fulfillment && (
                    <>
                      <h3>Pengiriman / pengambilan</h3>
                      <Facts row={o.fulfillment} />
                    </>
                  )}
                  {o.timeline?.length > 0 && (
                    <ol className="w-timeline">
                      {o.timeline.map((event, i) => (
                        <li key={i}>
                          {event.to_status} ·{" "}
                          {new Date(event.created_at).toLocaleString("id-ID")}
                        </li>
                      ))}
                    </ol>
                  )}
                  {!seller &&
                    !admin &&
                    !financial &&
                    o.status === "awaiting_payment" &&
                    (savedPayments[o.checkout_id] ? (
                      <Link
                        className="btn btn-primary"
                        to={`/payment/${savedPayments[o.checkout_id]}`}
                      >
                        Lanjutkan pembayaran
                      </Link>
                    ) : (
                      <p>
                        Untuk melanjutkan pembayaran, buka tautan pembayaran
                        dari tab tempat pesanan ini dibuat.
                      </p>
                    ))}
                  {!admin && !financial && (
                    <Report targetType="order" targetId={o.id} />
                  )}
                  {o.items?.map((item) => (
                    <p key={item.id}>
                      {item.product_name} · {item.variant_name} ×{" "}
                      {item.quantity}
                      {item.subtotal ? ` — ${money(item.subtotal)}` : ""}
                    </p>
                  ))}
                  {o.address && <Facts row={o.address} />}
                  {seller &&
                    [
                      "confirmed",
                      "processing",
                      "ready",
                      "in_delivery",
                    ].includes(o.status) && (
                      <Form
                        fields={[
                          {
                            key: "status",
                            options:
                              o.status === "confirmed"
                                ? ["processing"]
                                : o.status === "processing"
                                  ? ["ready"]
                                  : o.status === "ready"
                                    ? o.fulfillment_type === "pickup"
                                      ? ["completed"]
                                      : ["in_delivery"]
                                    : ["completed"],
                          },
                        ]}
                        button="Perbarui status"
                        submit={(body) =>
                          api.request(`/seller/orders/${o.id}/status`, {
                            method: "PATCH",
                            body,
                          })
                        }
                        onDone={resource.reload}
                      />
                    )}
                  {admin && o.status === "awaiting_payment" && (
                    <details>
                      <summary>Batalkan pesanan</summary>
                      <Form
                        fields={["reason"]}
                        submit={(body) =>
                          api.request(`/admin/orders/${o.id}/cancel`, {
                            method: "POST",
                            body,
                          })
                        }
                        onDone={resource.reload}
                      />
                    </details>
                  )}
                  {financial &&
                    [
                      "confirmed",
                      "processing",
                      "ready",
                      "in_delivery",
                      "completed",
                    ].includes(o.status) && (
                      <details>
                        <summary>Refund pesanan</summary>
                        <Form
                          fields={["reason"]}
                          submit={(body) =>
                            api.request(`/super-admin/orders/${o.id}/refund`, {
                              method: "POST",
                              body,
                            })
                          }
                          onDone={resource.reload}
                        />
                      </details>
                    )}
                </section>
              ))}
              {!id && (
                <div className="w-actions">
                  <button
                    className="btn btn-outline"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - 30))}
                  >
                    Sebelumnya
                  </button>
                  <button
                    className="btn btn-outline"
                    disabled={rows.length < 30}
                    onClick={() => setOffset(offset + 30)}
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </Resource>
    </>
  );
}
function Onboarding() {
  const { api } = useServer();
  const categories = useResource("/categories", { auth: false }),
    applications = useResource("/seller/applications");
  return (
    <>
      <h1>Buka lapak</h1>
      <Resource resource={categories}>
        {(rows) => (
          <Form
            fields={[
              "proposed_store_name",
              "business_description",
              {
                key: "business_category_id",
                options: rows.map((c) => ({ value: c.id, label: c.name })),
              },
            ]}
            button="Kirim pengajuan"
            submit={(body) =>
              api.request("/seller/applications", { method: "POST", body })
            }
            onDone={applications.reload}
          />
        )}
      </Resource>
      <h2>Pengajuan saya</h2>
      <Resource resource={applications}>
        {(rows) =>
          rows.map((row) => (
            <section className="w-panel" key={row.id}>
              <Facts row={row} />
            </section>
          ))
        }
      </Resource>
    </>
  );
}
function Seller() {
  const stores = useResource("/seller/stores"),
    overview = useResource("/seller/overview");
  return (
    <>
      <h1>Dashboard seller</h1>
      <div className="w-actions">
        <Link to="/seller/orders">Pesanan toko</Link>
        <Link to="/seller/products/new">Tambah produk</Link>
      </div>
      <Resource resource={overview}>{(data) => <Facts row={data} />}</Resource>
      <Resource resource={stores}>
        {(rows) =>
          rows.map((store) => <SellerStore key={store.id} store={store} />)
        }
      </Resource>
    </>
  );
}
function SellerStore({ store: initialStore }) {
  const [store, setStore] = useState(initialStore);
  const { api } = useServer();
  const products = useResource(`/seller/stores/${store.id}/products`);
  return (
    <section className="w-panel">
      <h2>{store.name}</h2>
      <details>
        <summary>Ubah toko</summary>
        <Form
          fields={[
            { key: "name", value: store.name },
            { key: "description", value: store.description },
            {
              key: "status",
              value: store.status,
              options: ["draft", "active"],
            },
          ]}
          submit={(body) =>
            api.request(`/seller/stores/${store.id}`, { method: "PATCH", body })
          }
          onDone={(result) =>
            setStore((previous) => ({ ...previous, ...result }))
          }
        />
      </details>
      <details>
        <summary>Alamat utama toko (wajib sebelum aktivasi)</summary>
        <Form
          fields={[
            {
              key: "type",
              label: "Jenis alamat",
              options: ["storefront", "warehouse", "pickup"],
            },
            ...addressFields.filter(
              (f) =>
                !["recipient_name", "phone", "notes"].includes(
                  typeof f === "string" ? f : f.key,
                ),
            ),
          ]}
          submit={(address) =>
            api.request(`/seller/stores/${store.id}`, {
              method: "PATCH",
              body: { address },
            })
          }
        />
      </details>
      <Resource resource={products}>
        {(rows) =>
          rows.map((p) => (
            <div className="w-panel" key={p.id}>
              <h3>{p.name}</h3>
              <p>
                {p.status} · {p.moderation_status}
              </p>
              <Form
                fields={[
                  { key: "name", value: p.name },
                  {
                    key: "status",
                    value: p.status,
                    options: ["draft", "active", "hidden"],
                  },
                ]}
                submit={(body) =>
                  api.request(`/seller/products/${p.id}`, {
                    method: "PATCH",
                    body,
                  })
                }
                onDone={products.reload}
              />
              <SellerVariants product={p} />
            </div>
          ))
        }
      </Resource>
    </section>
  );
}
function AddProduct() {
  const { api } = useServer(),
    navigate = useNavigate();
  const stores = useResource("/seller/stores"),
    categories = useResource("/categories", { auth: false });
  return (
    <>
      <h1>Tambah produk</h1>
      <Resource resource={stores}>
        {(s) => (
          <Resource resource={categories}>
            {(c) => (
              <Form
                fields={[
                  {
                    key: "store_id",
                    label: "Toko",
                    options: s.map((row) => ({
                      value: row.id,
                      label: row.name,
                    })),
                  },
                  "name",
                  "description",
                  {
                    key: "category_id",
                    options: c.map((row) => ({
                      value: row.id,
                      label: row.name,
                    })),
                  },
                  { key: "condition", options: ["new", "used"] },
                  "variant_name",
                  { key: "price", type: "number", min: 0 },
                  { key: "on_hand", type: "number", min: 0, max: 99999 },
                  { key: "image_url", type: "url", optional: true },
                ]}
                submit={({
                  store_id,
                  variant_name,
                  price,
                  on_hand,
                  image_url,
                  ...body
                }) =>
                  api.request(`/seller/stores/${store_id}/products`, {
                    method: "POST",
                    body: {
                      ...body,
                      variants: [
                        { name: variant_name, price, on_hand: Number(on_hand) },
                      ],
                      media: image_url
                        ? [{ url: image_url, media_type: "image" }]
                        : [],
                    },
                  })
                }
                onDone={() => navigate("/seller/dashboard")}
              />
            )}
          </Resource>
        )}
      </Resource>
    </>
  );
}
function SellerVariants({ product }) {
  const { api } = useServer();
  const [open, setOpen] = useState(false);
  const resource = useResource(
    open ? `/products/by-slug/${encodeURIComponent(product.slug)}` : null,
    { auth: false },
  );
  return (
    <details onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Harga dan stok varian</summary>
      <p>
        Varian dapat dimuat untuk produk yang tampil di katalog. Produk
        tersembunyi, belum disetujui, atau habis stok belum memiliki endpoint
        detail varian seller.
      </p>
      <Resource resource={resource}>
        {(p) =>
          p.variants.map((v) => (
            <Form
              key={v.id}
              fields={[
                { key: "name", value: v.name },
                { key: "price", value: v.price, type: "number", min: 0 },
                {
                  key: "on_hand",
                  label: `Stok fisik baru (tersedia saat ini ${v.available}, tidak termasuk stok dipesan)`,
                  optional: true,
                  type: "number",
                  min: 0,
                  max: 99999,
                },
              ]}
              submit={(data) =>
                api.request(`/seller/variants/${v.id}`, {
                  method: "PATCH",
                  body: {
                    ...data,
                    ...(data.on_hand === undefined
                      ? {}
                      : { on_hand: Number(data.on_hand) }),
                  },
                })
              }
              onDone={resource.reload}
            />
          ))
        }
      </Resource>
    </details>
  );
}
function Report({ targetType, targetId }) {
  const { api, user } = useServer();
  if (!user) return null;
  return (
    <details>
      <summary>Laporkan masalah</summary>
      <Form
        fields={[{ key: "category", label: "Kategori masalah" }, "description"]}
        button="Kirim laporan"
        submit={(data) =>
          api.request("/reports", {
            method: "POST",
            body: { ...data, target_type: targetType, target_id: targetId },
          })
        }
      />
    </details>
  );
}
function Account() {
  const { api, user, setUser } = useServer();
  const notifications = useResource("/notifications");
  const addresses = useResource(
    user.roles.includes("buyer") ? "/addresses" : null,
  );
  return (
    <>
      <h1>Akun saya</h1>
      <section className="w-panel">
        <Facts row={user} />
        <p>Peran: {user.roles.join(", ")}</p>
        <Action run={() => api.request("/users/me")} onDone={setUser}>
          Perbarui akun & akses
        </Action>
      </section>
      <h2>Notifikasi</h2>
      <Resource resource={notifications}>
        {(rows) =>
          rows.length ? (
            rows.map((n) => (
              <section className="w-panel" key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <small>{new Date(n.created_at).toLocaleString("id-ID")}</small>
                {!n.read_at && (
                  <Action
                    run={() =>
                      api.request(`/notifications/${n.id}/read`, {
                        method: "PUT",
                      })
                    }
                    onDone={notifications.reload}
                  >
                    Tandai dibaca
                  </Action>
                )}
              </section>
            ))
          ) : (
            <p>Belum ada notifikasi.</p>
          )
        }
      </Resource>
      {user.roles.includes("buyer") && (
        <>
          <h2>Alamat saya</h2>
          <Resource resource={addresses}>
            {(rows) =>
              rows.map((a) => (
                <section className="w-panel" key={a.id}>
                  <Facts row={a} />
                  <details>
                    <summary>Ubah alamat</summary>
                    <Form
                      fields={addressFields.map((f) => ({
                        ...(typeof f === "string" ? { key: f } : f),
                        value: a[typeof f === "string" ? f : f.key] || "",
                      }))}
                      submit={(body) =>
                        api.request(`/addresses/${a.id}`, {
                          method: "PATCH",
                          body,
                        })
                      }
                      onDone={addresses.reload}
                    />
                  </details>
                  <Action
                    run={() =>
                      api.request(`/addresses/${a.id}`, { method: "DELETE" })
                    }
                    onDone={addresses.reload}
                  >
                    Hapus alamat
                  </Action>
                </section>
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
              onDone={addresses.reload}
            />
          </details>
        </>
      )}
    </>
  );
}
const managementSections = {
  stores: "Seller",
  applications: "Pengajuan seller",
  products: "Produk",
  categories: "Kategori",
  reports: "Laporan",
  buyers: "Buyer",
  admins: "Admin",
  "fee-rules": "Platform fee",
  audit: "Audit log",
};
function AdminShell({ superAdmin = false }) {
  const prefix = superAdmin ? "/super-admin" : "/admin";
  return (
    <>
      <h1>{superAdmin ? "Super admin" : "Admin"}</h1>
      <nav className="live-nav">
        <Link to={prefix}>Overview</Link>
        <Link to={`${prefix}/orders`}>Pesanan</Link>
        {superAdmin && <Link to={`${prefix}/transactions`}>Transaksi</Link>}
        {Object.entries(managementSections)
          .filter(
            ([key]) =>
              superAdmin ||
              !["buyers", "admins", "fee-rules", "audit"].includes(key),
          )
          .map(([key, label]) => (
            <Link key={key} to={`${prefix}/${key}`}>
              {label}
            </Link>
          ))}
      </nav>
      <Outlet />
    </>
  );
}
function Overview({ superAdmin = false }) {
  const resource = useResource(
    superAdmin ? "/super-admin/overview" : "/admin/overview",
  );
  return (
    <Resource resource={resource}>
      {(data) => (
        <>
          <Facts row={data} />
          <h2>Status pesanan</h2>
          <Facts row={data.statuses} />
        </>
      )}
    </Resource>
  );
}
function Management({ kind }) {
  const { api } = useServer();
  const prefix = ["buyers", "admins", "fee-rules", "audit"].includes(kind)
    ? "/super-admin"
    : "/admin";
  const path = `${prefix}/${kind}`,
    resource = useResource(path);
  const statuses = {
    stores: ["active", "suspended", "closed"],
    products: ["approved", "rejected", "pending"],
    categories: ["active", "inactive"],
    reports: ["reviewing", "resolved", "rejected"],
    buyers: ["active", "suspended", "blocked"],
  };
  return (
    <>
      <h2>{managementSections[kind]}</h2>
      {kind === "admins" && (
        <details>
          <summary>Tambah admin</summary>
          <Form
            fields={["name", "email", "password", "reason"]}
            submit={(body) => api.request(path, { method: "POST", body })}
            onDone={resource.reload}
          />
        </details>
      )}
      {kind === "fee-rules" && (
        <details>
          <summary>Tambah aturan fee</summary>
          <FeeForm onDone={resource.reload} />
        </details>
      )}
      <Resource resource={resource}>
        {(rows) => (
          <div className="w-stack">
            {!rows.length && <p>Belum ada data.</p>}
            {rows.map((row) => (
              <section className="w-panel" key={row.id}>
                <Facts row={row} />
                {kind === "audit" && (
                  <details>
                    <summary>Rincian perubahan</summary>
                    <h3>Sebelum</h3>
                    <Facts row={row.before_data} />
                    <h3>Sesudah</h3>
                    <Facts row={row.after_data} />
                  </details>
                )}
                {statuses[kind] && (
                  <Form
                    fields={[
                      { key: "status", options: statuses[kind] },
                      "reason",
                    ]}
                    submit={(body) =>
                      api.request(`${path}/${row.id}`, {
                        method: "PATCH",
                        body,
                      })
                    }
                    onDone={resource.reload}
                  />
                )}
                {kind === "applications" &&
                  ["submitted", "under_review"].includes(row.status) && (
                    <Form
                      fields={[
                        {
                          key: "approve",
                          label: "Keputusan",
                          options: [
                            { value: "true", label: "Setujui" },
                            { value: "false", label: "Tolak" },
                          ],
                        },
                        "reason",
                      ]}
                      submit={(data) =>
                        api.request(`${path}/${row.id}/review`, {
                          method: "POST",
                          body: {
                            reason: data.reason,
                            approve: data.approve === "true",
                          },
                        })
                      }
                      onDone={resource.reload}
                    />
                  )}
                {kind === "admins" && (
                  <Form
                    fields={[
                      {
                        key: "action",
                        options: ["enable", "disable", "reset"],
                      },
                      "reason",
                    ]}
                    submit={(body) =>
                      api.request(`${path}/${row.id}`, {
                        method: "PATCH",
                        body,
                      })
                    }
                    onDone={resource.reload}
                  />
                )}
                {kind === "fee-rules" && (
                  <Form
                    fields={["reason"]}
                    button="Nonaktifkan"
                    submit={(body) =>
                      api.request(`${path}/${row.id}/disable`, {
                        method: "POST",
                        body,
                      })
                    }
                    onDone={resource.reload}
                  />
                )}
              </section>
            ))}
          </div>
        )}
      </Resource>
    </>
  );
}
function FeeForm({ onDone }) {
  const { api } = useServer();
  const stores = useResource("/admin/stores"),
    categories = useResource("/admin/categories");
  return (
    <Resource resource={stores}>
      {(s) => (
        <Resource resource={categories}>
          {(c) => (
            <Form
              fields={[
                "name",
                {
                  key: "percentage",
                  type: "number",
                  min: 0,
                  max: 100,
                  step: "0.0001",
                },
                { key: "fixed_amount", type: "number", min: 0 },
                {
                  key: "scope",
                  label: "Berlaku untuk",
                  options: [
                    { value: "global", label: "Semua toko" },
                    ...s.map((x) => ({
                      value: `store:${x.id}`,
                      label: `Toko: ${x.name}`,
                    })),
                    ...c.map((x) => ({
                      value: `category:${x.id}`,
                      label: `Kategori: ${x.name}`,
                    })),
                  ],
                },
                { key: "effective_from", type: "datetime-local" },
                {
                  key: "effective_until",
                  type: "datetime-local",
                  optional: true,
                },
                { key: "status", options: ["active", "scheduled"] },
                "reason",
              ]}
              submit={({ scope, ...data }) => {
                const [scope_type, scope_id] = scope.split(":");
                return api.request("/super-admin/fee-rules", {
                  method: "POST",
                  body: {
                    ...data,
                    scope_type,
                    scope_id: scope_id || null,
                    effective_from: new Date(data.effective_from).toISOString(),
                    effective_until: data.effective_until
                      ? new Date(data.effective_until).toISOString()
                      : null,
                  },
                });
              }}
              onDone={onDone}
            />
          )}
        </Resource>
      )}
    </Resource>
  );
}
function LiveRoutes() {
  const location = useLocation();
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route
          path="account"
          element={
            <Guard>
              <Account />
            </Guard>
          }
        />
        {["explore", "search"].map((path) => (
          <Route
            key={path}
            path={path}
            element={<Catalog key={location.pathname} />}
          />
        ))}
        <Route path="categories" element={<Categories />} />
        <Route
          path="category/:slug"
          element={<Catalog category key={location.pathname} />}
        />
        <Route
          path="product/:slug"
          element={<Product key={location.pathname} />}
        />
        <Route path="store/:slug" element={<Store key={location.pathname} />} />
        <Route
          path="favorites"
          element={
            <Guard>
              <Catalog favorites />
            </Guard>
          }
        />
        <Route path="login" element={<Auth key="login" />} />
        <Route path="register" element={<Auth key="register" />} />
        {["cart", "checkout"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Guard roles={["buyer"]}>
                <Cart key={path} checkout={path === "checkout"} />
              </Guard>
            }
          />
        ))}
        <Route
          path="payment/:id"
          element={
            <Guard roles={["buyer"]}>
              <Payment key={location.pathname} />
            </Guard>
          }
        />
        {["orders", "orders/:id"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Guard roles={["buyer"]}>
                <Orders key={location.pathname} />
              </Guard>
            }
          />
        ))}
        <Route
          path="seller/register"
          element={
            <Guard roles={["buyer", "seller"]}>
              <Onboarding />
            </Guard>
          }
        />
        <Route
          path="seller/dashboard"
          element={
            <Guard roles={["seller"]}>
              <Seller />
            </Guard>
          }
        />
        <Route
          path="seller/products/new"
          element={
            <Guard roles={["seller"]}>
              <AddProduct />
            </Guard>
          }
        />
        {["seller/orders", "seller/orders/:id"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Guard roles={["seller"]}>
                <Orders seller key={location.pathname} />
              </Guard>
            }
          />
        ))}
        {[false, true].map((superAdmin) => (
          <Route
            key={String(superAdmin)}
            path={superAdmin ? "super-admin" : "admin"}
            element={
              <Guard
                roles={superAdmin ? ["super_admin"] : ["admin", "super_admin"]}
              >
                <AdminShell superAdmin={superAdmin} />
              </Guard>
            }
          >
            <Route index element={<Overview superAdmin={superAdmin} />} />
            <Route path="orders" element={<Orders admin />} />
            {superAdmin && (
              <Route path="transactions" element={<Orders financial />} />
            )}
            {Object.keys(managementSections)
              .filter(
                (key) =>
                  superAdmin ||
                  !["buyers", "admins", "fee-rules", "audit"].includes(key),
              )
              .map((kind) => (
                <Route
                  key={kind}
                  path={kind}
                  element={<Management kind={kind} key={kind} />}
                />
              ))}
            <Route
              path="sellers"
              element={<Navigate to="../stores" replace />}
            />
            {superAdmin && (
              <>
                <Route
                  path="platform-fee"
                  element={<Navigate to="../fee-rules" replace />}
                />
                <Route
                  path="audit-log"
                  element={<Navigate to="../audit" replace />}
                />
              </>
            )}
          </Route>
        ))}
        <Route
          path="*"
          element={
            <>
              <h1>Halaman tidak ditemukan</h1>
              <Link to="/">Kembali ke beranda</Link>
            </>
          }
        />
      </Route>
    </Routes>
  );
}
export default function ServerApp() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(null),
    [attempt, setAttempt] = useState(0);
  const [api] = useState(() =>
    createApi({
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      storage: browserStorage(),
      onUnauthorized: () => setUser(null),
    }),
  );
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .restore()
      .then((value) => {
        if (active) setUser(value);
      })
      .catch((e) => {
        if (active && e.status !== 401 && e.code !== "VALIDATION_ERROR")
          setError(e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api, attempt]);
  if (loading)
    return (
      <p className="page" role="status">
        Memuat sesi…
      </p>
    );
  if (error)
    return (
      <div className="page">
        <ErrorMessage error={error} />
        <button
          className="btn btn-primary"
          onClick={() => setAttempt((n) => n + 1)}
        >
          Coba lagi
        </button>
      </div>
    );
  return (
    <Context.Provider value={{ api, user, setUser }}>
      <LiveRoutes key={user?.id || "guest"} />
    </Context.Provider>
  );
}
