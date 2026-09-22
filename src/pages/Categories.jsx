import { Link, useParams } from "react-router";
import { useState } from "react";
import CategoryLinks from "../components/marketplace/CategoryLinks";
import { EmptyState } from "../components/common/UI";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { Listing } from "./Search";
export default function Categories() {
  return (
    <div className="page">
      <header className="page-heading">
        <p className="eyebrow">ADA BANYAK YANG BISA DITEMUKAN</p>
        <h1>Mau cari yang mana?</h1>
        <p>Kebutuhan sehari-hari sampai hobi baru. Mulai dari sini.</p>
      </header>
      <CategoryLinks all />
    </div>
  );
}
export function CategoryDetail() {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const [sub, setSub] = useState("");
  if (!category)
    return (
      <EmptyState
        title="Kategori belum tersedia"
        text="Temukan kategori lainnya di Wally."
        to="/categories"
        label="Lihat kategori"
      />
    );
  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/categories">Kategori</Link>
        <span>/</span>
        {category.name}
      </div>
      <header className="page-heading">
        <p className="eyebrow">TEMUKAN PILIHAN LOKAL</p>
        <h1>{category.name}</h1>
        <p>Pilihan dari seller Sorong, buat keseharianmu.</p>
      </header>
      <div className="chip-row subcategories">
        {["", ...category.sub].map((s) => (
          <button
            key={s}
            className={`chip ${s === sub ? "selected" : ""}`}
            aria-pressed={s === sub}
            onClick={() => setSub(s)}
          >
            {s || "Semua"}
          </button>
        ))}
      </div>
      <Listing
        key={slug + sub}
        source={products.filter(
          (p) => p.category === slug && (!sub || p.subcategory === sub),
        )}
        showStores={false}
      />
    </div>
  );
}
