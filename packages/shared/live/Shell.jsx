import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { Link } from '../../ui/navigation.jsx';

import { NavLink } from '../../ui/navigation.jsx';

import { Outlet } from 'react-router';

import { useLocation } from 'react-router';

import { useNavigate } from '../../ui/navigation.jsx';

import { Logo } from '../../ui/components/common/UI.jsx';
import { Modal } from '../../ui/components/common/UI.jsx';
import Icon from '../../ui/components/common/Icon.jsx';
import { useServer } from './context.jsx';
import { destination } from './context.jsx';
import { Action } from './Forms.jsx';

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
      {user?.roles.some((r) =>
        ["seller", "admin", "super_admin"].includes(r),
      ) && <NavLink to={destination(user)}>Dashboard</NavLink>}
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
              (to === "/categories" &&
                location.pathname.startsWith("/category/"))
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
export { Shell };
