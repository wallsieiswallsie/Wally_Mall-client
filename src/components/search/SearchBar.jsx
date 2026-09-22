import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Icon from "../common/Icon";
import { SearchSuggestion } from "./SearchParts";
const placeholders = [
  "Cari sneakers...",
  "Cari kue ulang tahun...",
  "Cari iPhone...",
  "Cari thrift...",
  "Cari meja belajar...",
];
export default function SearchBar({
  initialValue = "",
  hero = false,
  autoFocus = false,
}) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  useEffect(() => setValue(initialValue), [initialValue]);
  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % placeholders.length),
      3200,
    );
    return () => clearInterval(timer);
  }, []);
  const submit = (query = value) => {
    setFocused(false);
    navigate(
      query.trim()
        ? `/search?q=${encodeURIComponent(query.trim())}`
        : "/search",
    );
  };
  return (
    <div
      className={`search-wrap ${hero ? "hero-search" : ""}`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Icon name="search" size={22} />
        <input
          aria-label="Cari produk, kategori, atau toko di Sorong"
          value={value}
          placeholder={placeholders[index]}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setFocused(false);
          }}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="icon-btn clear-search"
            aria-label="Hapus pencarian"
            onClick={() => setValue("")}
          >
            <Icon name="close" size={16} />
          </button>
        )}
        <button className="btn btn-primary search-submit" type="submit">
          Cari
          <Icon name="arrow" size={17} />
        </button>
      </form>
      {focused && value.trim() && (
        <SearchSuggestion value={value} onSelect={submit} />
      )}
    </div>
  );
}
