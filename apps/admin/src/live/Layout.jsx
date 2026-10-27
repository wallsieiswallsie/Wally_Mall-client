import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import { Link, NavLink, useNavigate } from '../../../../packages/ui/navigation.jsx';
import { Logo } from '../../../../packages/ui/components/common/UI.jsx';
import { useServer, destination } from '../../../../packages/shared/live/context.jsx';
import { ErrorMessage } from '../../../../packages/shared/live/Forms.jsx';

// Only routes that exist in the live portal are listed; prototype menus without
// a live page (moderation, support, settings) stay hidden until implemented.
const superLinks = [
  ['', 'Overview', '◈'],
  ['operations', 'Operasional', '◉'],
  ['transactions', 'Transaksi', '↗'],
  ['orders', 'Pesanan', '▤'],
  ['buyers', 'Buyer', '☺'],
  ['stores', 'Seller', '⌂'],
  ['applications', 'Pengajuan seller', '✓'],
  ['products', 'Produk', '▧'],
  ['categories', 'Kategori', '▦'],
  ['reports', 'Laporan', '⚑'],
  ['admins', 'Admin', '♙'],
  ['fee-rules', 'Platform fee', '%'],
  ['audit', 'Audit log', '☷'],
];
const adminLinks = [
  ['', 'Overview operasional', '◈'],
  ['orders', 'Pesanan', '▤'],
  ['applications', 'Verifikasi seller', '✓'],
  ['stores', 'Seller', '⌂'],
  ['products', 'Produk', '▧'],
  ['categories', 'Kategori', '▦'],
  ['reports', 'Laporan', '⚑'],
];
const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

function AdminLayout({ superAdmin = false }) {
  const { api, user, setUser } = useServer();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const toggle = useRef(null);
  const base = superAdmin ? '/super-admin' : '/admin';
  const links = superAdmin ? superLinks : adminLinks;
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  const section = location.pathname.replace(base, '').split('/')[1] || '';
  const current = links.find(([path]) => path === section)?.[1];
  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await api.logout();
      setUser(null);
      navigate('/login');
    } catch (e) {
      setError(e);
      setBusy(false);
    }
  }
  return (
    <div className="w-internal">
      <aside id="admin-sidebar" className={`w-sidebar ${open ? 'open' : ''}`}>
        <Logo />
        <div className="w-workspace">
          <span className="w-avatar">w.</span>
          <div>
            <strong>Wally Mall</strong>
            <small>{superAdmin ? 'Marketplace management' : 'Marketplace operations'}</small>
          </div>
        </div>
        <p className="eyebrow">{superAdmin ? 'SUPER ADMIN' : 'OPERASIONAL'}</p>
        <nav aria-label="Navigasi dashboard">
          {links.map(([path, label, symbol]) => (
            <NavLink key={path} to={path ? `${base}/${path}` : base} end={!path}>
              <span className="w-nav-symbol" aria-hidden="true">
                {symbol}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="w-sidebar-bottom">
          <span className="w-badge good">Data live</span>
          <small>{user.email}</small>
          <Link className="text-link" to="/">
            ← Buka marketplace
          </Link>
        </div>
      </aside>
      <div className="w-internal-main">
        <header className="w-internal-header">
          <button
            ref={toggle}
            className="btn btn-outline w-menu-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="admin-sidebar"
          >
            ☰ Menu
          </button>
          <p aria-label="Breadcrumb">
            Workspace <span>/</span> {superAdmin ? 'Super Admin' : 'Operations'}{' '}
            {current && section && (
              <>
                <span>/</span> {current}
              </>
            )}
          </p>
          <div className="w-actions">
            <span className="w-avatar" title={user.name} aria-label={`Masuk sebagai ${user.name}`}>
              {initials(user.name)}
            </span>
            <button className="btn btn-outline" onClick={logout} disabled={busy}>
              {busy ? 'Keluar…' : 'Keluar'}
            </button>
          </div>
        </header>
        <main className="w-dashboard">
          <ErrorMessage error={error} />
          <Outlet />
        </main>
        <footer className="w-internal-footer">
          Wally Mall · Sorong, Ketemu di Wally.
          <span>Seluruh angka berasal dari server production; metrik tanpa sumber valid ditandai belum tersedia.</span>
        </footer>
      </div>
    </div>
  );
}

function Denied() {
  const { user } = useServer();
  return (
    <div className="w-payment">
      <section className="w-panel" role="alert">
        <span className="w-badge bad">Akses ditolak</span>
        <h1>Halaman ini tidak tersedia untuk akun Anda</h1>
        <p>Peran akun saat ini: {user.roles.join(', ') || '—'}.</p>
        <Link className="btn btn-primary" to={destination(user)}>
          Kembali ke halaman utama akun
        </Link>
      </section>
    </div>
  );
}

function NotFound({ superAdmin = false }) {
  const base = superAdmin ? '/super-admin' : '/admin';
  return (
    <section className="w-panel w-empty" role="alert">
      <h1>Halaman tidak tersedia untuk role ini</h1>
      <p>Menu ini belum ada di portal live atau tidak termasuk izin akun Anda.</p>
      <Link className="text-link" to={base}>
        Kembali ke overview
      </Link>
    </section>
  );
}

export { AdminLayout, Denied, NotFound, superLinks, adminLinks };
