import { useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import SearchBar from "../components/search/SearchBar";
import {
  RecentSearch,
  PopularSearch,
  SearchFilter,
  SearchEmptyState,
  defaultFilters,
} from "../components/search/SearchParts";
import CategoryLinks from "../components/marketplace/CategoryLinks";
import { ProductGrid } from "../components/product/ProductCard";
import SellerCard from "../components/seller/SellerCard";
import { products } from "../data/products";
import { sellers } from "../data/sellers";
import { categories } from "../data/categories";
export function Listing({ source = products, query = "", showStores = true }) {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("relevant");
  const [filters, setFilters] = useState({ ...defaultFilters });
  const tab = showStores && params.get("tab") === "toko" ? "toko" : "produk";
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (text) =>
    words.every((word) => text.toLowerCase().includes(word));
  const result = source.filter((p) => {
    const s = sellers.find((s) => s.slug === p.seller);
    const category = categories.find((c) => c.slug === p.category);
    return (
      matches(
        `${p.name} ${p.tags.join(" ")} ${s.name} ${category.name} ${p.subcategory}`,
      ) &&
      (!filters.category || p.category === filters.category) &&
      (!filters.location || s.location === filters.location) &&
      (!filters.rating || p.rating >= Number(filters.rating)) &&
      (!filters.price ||
        (filters.price === "under100"
          ? p.price < 100000
          : filters.price === "100to500"
            ? p.price >= 100000 && p.price <= 500000
            : p.price > 500000))
    );
  });
  const currentSort = filters.newest ? "newest" : sort;
  if (currentSort === "low") result.sort((a, b) => a.price - b.price);
  else if (currentSort === "high") result.sort((a, b) => b.price - a.price);
  else if (currentSort === "newest") result.reverse();
  const storeResults = sellers.filter((s) =>
    matches(
      `${s.name} ${s.category} ${products
        .filter((p) => p.seller === s.slug)
        .flatMap((p) => [p.name, ...p.tags])
        .join(" ")}`,
    ),
  );
  return (
    <>
      {showStores && (
        <div
          className="tabs result-tabs"
          role="tablist"
          aria-label="Jenis hasil"
        >
          <button
            role="tab"
            aria-selected={tab === "produk"}
            className={`tab ${tab === "produk" ? "tab-active" : ""}`}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete("tab");
              setParams(next);
            }}
          >
            Produk <span>{result.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === "toko"}
            className={`tab ${tab === "toko" ? "tab-active" : ""}`}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("tab", "toko");
              setParams(next);
            }}
          >
            Toko <span>{storeResults.length}</span>
          </button>
        </div>
      )}
      {tab === "produk" ? (
        <>
          <div className="listing-toolbar">
            <p>
              <strong>{result.length}</strong> produk ditemukan{" "}
              <span className="desktop-only">di Sorong</span>
            </p>
            <div>
              <SearchFilter filters={filters} onApply={setFilters} />
              <select
                aria-label="Urutkan produk"
                className="select sort-select"
                value={currentSort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setFilters((f) => ({ ...f, newest: false }));
                }}
              >
                <option value="relevant">Relevan</option>
                <option value="newest">Terbaru</option>
                <option value="low">Harga Terendah</option>
                <option value="high">Harga Tertinggi</option>
              </select>
            </div>
          </div>
          {Object.values(filters).some(Boolean) && (
            <div className="active-filter-row">
              <span>Filter aktif</span>
              <button
                className="text-link"
                onClick={() => setFilters({ ...defaultFilters })}
              >
                Hapus semua filter ×
              </button>
            </div>
          )}
          {result.length ? (
            <ProductGrid products={result} />
          ) : (
            <SearchEmptyState />
          )}
        </>
      ) : (
        <>
          <p className="results-count">
            {storeResults.length} toko ditemukan di Sorong
          </p>
          {storeResults.length ? (
            <div className="seller-grid">
              {storeResults.map((s) => (
                <SellerCard seller={s} key={s.slug} />
              ))}
            </div>
          ) : (
            <SearchEmptyState />
          )}
        </>
      )}
    </>
  );
}
export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const explore = useLocation().pathname === "/explore";
  const browsing = query || explore || params.has("tab");
  return (
    <div className="page search-page">
      <header className="page-heading">
        <p className="eyebrow">TEMUKAN DI SEKITARMU</p>
        <h1>
          {query
            ? `Hasil untuk “${query}”`
            : explore
              ? "Jelajahi Wally"
              : "Lagi cari apa?"}
        </h1>
        {!query && (
          <p>Produk, toko, dan kebutuhan harian. Semuanya di Sorong.</p>
        )}
      </header>
      <div className="search-page-bar">
        <SearchBar initialValue={query} hero />
      </div>
      {browsing ? (
        <Listing query={query} />
      ) : (
        <div className="search-before">
          <RecentSearch />
          <section className="search-section">
            <h2>Populer di Sorong</h2>
            <PopularSearch />
          </section>
          <section className="search-section">
            <h2>Jelajahi kategori</h2>
            <CategoryLinks />
          </section>
          <aside className="search-tip">
            <span>✦</span>
            <div>
              <strong>Mulai dari kata yang sederhana.</strong>
              <p>Coba “sepatu”, “roti”, atau nama toko yang kamu kenal.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
