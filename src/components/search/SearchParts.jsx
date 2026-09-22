import { useState } from "react";
import { Link } from "react-router";
import Icon from "../common/Icon";
import { EmptyState, Field, Modal } from "../common/UI";
import { categories } from "../../data/categories";
const popular = [
  "Sneakers",
  "Kue ulang tahun",
  "iPhone",
  "Thrift",
  "Meja belajar",
];
export function SearchSuggestion({ value, onSelect }) {
  const items = value.toLowerCase().startsWith("sep")
    ? ["Sepatu", "Sepatu Wanita", "Sepatu Pria", "Sneakers", "Sepatu Running"]
    : [
        ...popular,
        "Mechanical keyboard",
        "Croissant",
        "Ruang Sole",
        "Dapur Nona",
      ].filter((s) => s.toLowerCase().includes(value.toLowerCase()));
  return (
    <div className="search-suggestions">
      <p className="eyebrow">Saran pencarian</p>
      {[...new Set([value, ...items])].slice(0, 6).map((s) => (
        <button type="button" key={s} onClick={() => onSelect(s)}>
          <Icon name="search" size={16} />
          <span>{s}</span>
          <Icon name="arrow" size={15} />
        </button>
      ))}
      <small>Saran contoh untuk discovery Wally</small>
    </div>
  );
}
export function RecentSearch() {
  const [recent, setRecent] = useState(["Sneakers", "Croissant"]);
  return (
    <section className="search-section">
      <div className="section-heading">
        <h2>Pencarian terakhir</h2>
        {recent.length > 0 && (
          <button className="text-link" onClick={() => setRecent([])}>
            Hapus semua
          </button>
        )}
      </div>
      {recent.length ? (
        <div className="chip-row">
          {recent.map((q) => (
            <Link
              className="chip"
              to={`/search?q=${encodeURIComponent(q)}`}
              key={q}
            >
              <Icon name="clock" size={16} />
              {q}
            </Link>
          ))}
        </div>
      ) : (
        <p className="muted">Riwayat contoh sudah dibersihkan.</p>
      )}
    </section>
  );
}
export function PopularSearch() {
  return (
    <div className="chip-row">
      {popular.map((q, i) => (
        <Link
          className="chip"
          key={q}
          to={`/search?q=${encodeURIComponent(q)}`}
        >
          <span className="gold">{String(i + 1).padStart(2, "0")}</span>
          {q}
        </Link>
      ))}
    </div>
  );
}
export function SearchEmptyState() {
  return (
    <EmptyState
      title="Belum ketemu yang kamu cari."
      text="Coba kata yang lebih umum, nama toko, atau hapus filter pencarian."
      to="/search"
      label="Coba pencarian lain"
    />
  );
}
export const defaultFilters = {
  category: "",
  price: "",
  location: "",
  rating: "",
  newest: false,
};
export function SearchFilter({ filters, onApply }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const count = Object.values(filters).filter(Boolean).length;
  const update = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  return (
    <>
      <button
        className={`btn btn-outline ${count ? "selected" : ""}`}
        onClick={() => {
          setDraft(filters);
          setOpen(true);
        }}
      >
        <Icon name="filter" size={17} />
        Filter{count > 0 && <span className="count">{count}</span>}
      </button>
      {open && (
        <Modal title="Filter pencarian" onClose={() => setOpen(false)} sheet>
          <div className="form-stack">
            <Field label="Kategori">
              <select
                className="select"
                value={draft.category}
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="">Semua kategori</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Harga">
              <select
                className="select"
                value={draft.price}
                onChange={(e) => update("price", e.target.value)}
              >
                <option value="">Semua harga</option>
                <option value="under100">Di bawah Rp100.000</option>
                <option value="100to500">Rp100.000 – Rp500.000</option>
                <option value="over500">Di atas Rp500.000</option>
              </select>
            </Field>
            <Field label="Lokasi">
              <select
                className="select"
                value={draft.location}
                onChange={(e) => update("location", e.target.value)}
              >
                <option value="">Seluruh Sorong</option>
                {[
                  "Sorong Kota",
                  "Sorong Manoi",
                  "Sorong Utara",
                  "Sorong Timur",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Rating minimum">
              <select
                className="select"
                value={draft.rating}
                onChange={(e) => update("rating", e.target.value)}
              >
                <option value="">Semua rating</option>
                <option value="4.8">4.8 ke atas</option>
                <option value="4.9">4.9 ke atas</option>
              </select>
            </Field>
            <label className="check-label">
              <input
                type="checkbox"
                className="checkbox"
                checked={draft.newest}
                onChange={(e) => update("newest", e.target.checked)}
              />
              Utamakan produk terbaru
            </label>
            <div className="button-row">
              <button
                className="btn btn-outline"
                onClick={() => setDraft({ ...defaultFilters })}
              >
                Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onApply(draft);
                  setOpen(false);
                }}
              >
                Tampilkan hasil
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
