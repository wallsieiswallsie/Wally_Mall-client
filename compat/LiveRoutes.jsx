import { Routes, Route, useLocation } from 'react-router';

import { commonRoutes } from '../packages/shared/live/routes.jsx';
import { Shell } from '../packages/shared/live/Shell.jsx';
import { buyerRoutes } from '../apps/buyer/src/live/routes.jsx';
import { sellerRoutes } from '../apps/seller/src/live/routes.jsx';
import { adminRoutes } from '../apps/admin/src/live/routes.jsx';
export default function PortalRoutes() { const location = useLocation(); return <Routes><Route element={<Shell />}>{commonRoutes(location)}{buyerRoutes(location)}{sellerRoutes(location)}{adminRoutes(location)}</Route></Routes>; }
