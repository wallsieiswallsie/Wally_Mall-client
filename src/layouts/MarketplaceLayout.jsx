import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { Logo, Modal } from "../components/common/UI";
import Icon from "../components/common/Icon";
import SearchBar from "../components/search/SearchBar";
export default function MarketplaceLayout() {
  const [favorites, setFavorites] = useState([
    "butter-croissant",
    "canvas-tote",
  ]);
  const [notice, setNotice] = useState(null);
  const [demoStore, setDemoStore] = useState(null);
  const [demoProducts, setDemoProducts] = useState([]);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    setNotice(null);
  }, [location.pathname, location.search]);
  const toggleFavorite = (slug) =>
    setFavorites((items) =>
      items.includes(slug) ? items.filter((s) => s !== slug) : [...items, slug],
    );
  return (
    <>
      <div className="top-strip">
        <span>
          <Icon name="pin" size={13} />
          Dari Sorong, untuk Sorong.
        </span>
        <span>Kenali yang dekat. Temukan yang kamu cari.</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <div className="desktop-search">
            <SearchBar />
          </div>
          <nav className="desktop-nav" aria-label="Navigasi utama">
            <NavLink to="/explore">Jelajah</NavLink>
            <NavLink to="/categories">Kategori</NavLink>
            <Link to="/seller/register">
              Buka Lapak
              <Icon name="arrow" size={14} />
            </Link>
            <NavLink to="/login" className="login-link">
              <Icon name="user" size={18} />
              Masuk
            </NavLink>
          </nav>
          <div className="mobile-actions">
            <Link className="icon-btn" to="/search" aria-label="Cari">
              <Icon name="search" />
            </Link>
            <Link className="icon-btn" to="/login" aria-label="Akun">
              <Icon name="user" />
            </Link>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Outlet
          context={{
            favorites,
            toggleFavorite,
            notify: setNotice,
            demoStore,
            setDemoStore,
            demoProducts,
            setDemoProducts,
          }}
        />
      </main>
      <footer className="footer-main">
        <div>
          <Logo />
          <p>Sorong, Ketemu di Wally.</p>
        </div>
        <p>
          Temukan yang kamu butuhkan.
          <br />
          Dukung yang ada di sekitarmu.
        </p>
        <span>
          Prototype UI · Semua produk & seller adalah data contoh.
          <br />
          Foto produk merupakan ilustrasi.
        </span>
      </footer>
      <nav className="bottom-nav" aria-label="Navigasi mobile">
        {[
          ["/", "home", "Home"],
          ["/search", "search", "Cari"],
          ["/categories", "grid", "Kategori"],
          ["/favorites", "heart", "Favorit"],
          ["/login", "user", "Akun"],
        ].map(([to, icon, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              isActive ||
              (to === "/categories" &&
                location.pathname.startsWith("/category/"))
                ? "active"
                : ""
            }
          >
            <Icon name={icon} size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {notice && (
        <Modal
          title={notice.title || "Preview interaksi"}
          onClose={() => setNotice(null)}
        >
          <p className="notice-copy">{notice.message}</p>
          <button
            className="btn btn-primary full"
            onClick={() => setNotice(null)}
          >
            Mengerti
          </button>
        </Modal>
      )}
    </>
  );
}
