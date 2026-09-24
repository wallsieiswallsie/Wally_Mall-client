import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { Logo } from '../components/common/UI';
import { DemoAccess, Notifications } from '../components/commerce/Shared';
import { usePrototype } from '../state/PrototypeContext';
const superLinks = [['', 'Overview'], ['transactions', 'Transactions'], ['orders', 'Orders'], ['buyers', 'Buyers'], ['sellers', 'Sellers'], ['products', 'Products'], ['categories', 'Categories'], ['operations', 'Operations'], ['reports', 'Reports'], ['admins', 'Admins'], ['platform-fee', 'Platform Fee'], ['moderation', 'Moderation'], ['audit-log', 'Audit Log'], ['settings', 'Settings']];
const adminLinks = [['', 'Operational Overview'], ['orders', 'Orders'], ['sellers', 'Seller Verification'], ['products', 'Products'], ['categories', 'Categories'], ['reports', 'Reports'], ['moderation', 'Moderation'], ['support', 'Support']];
export default function InternalLayout() {
  const {
    session
  } = usePrototype();
  const [open, setOpen] = useState(false);
  const superAdmin = session.role === 'super_admin';
  const base = superAdmin ? '/super-admin' : '/admin';
  return <div className="w-internal"><aside className={`w-sidebar ${open ? 'open' : ''}`}><Logo /><div className="w-workspace"><span className="w-avatar">w.</span><div><strong>Wally Mall</strong><small>{superAdmin ? 'Marketplace management' : 'Marketplace operations'}</small></div></div><p className="eyebrow">{superAdmin ? 'SUPER ADMIN' : 'OPERASIONAL'}</p><nav aria-label="Dashboard navigation">{(superAdmin ? superLinks : adminLinks).map(([path, label], i) => <NavLink key={path} to={`${base}/${path}`} end={!path} onClick={() => setOpen(false)}><span className="w-nav-symbol">{['◈', '↗', '▤', '◉', '⌂', '▧', '▦', '☷'][i % 8]}</span>{label}</NavLink>)}</nav><div className="w-sidebar-bottom"><span className="w-badge warm">Prototype Mode</span><small>Data simulasi · Sorong</small><Link className="text-link" to="/">← Buka marketplace</Link></div></aside><div className="w-internal-main"><header className="w-internal-header"><button className="btn btn-outline w-menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>☰ Menu</button><p>Workspace <span>/</span> {superAdmin ? 'Super Admin' : 'Operations'}</p><div className="w-actions"><Notifications /><span className="w-avatar">{superAdmin ? 'SA' : 'CW'}</span></div></header><main className="w-dashboard"><Outlet /></main><footer className="w-internal-footer">Wally Mall · Sorong, Ketemu di Wally. <span>Seluruh angka dan aktivitas adalah data demo.</span></footer></div><DemoAccess compact /></div>;
}
