import { Routes, Route, useLocation } from 'react-router';

import { commonRoutes } from '../packages/shared/prototype/routes.jsx';
import Shell from '../packages/shared/layouts/MarketplaceLayout.jsx';
import { buyerRoutes } from '../apps/buyer/src/prototype/routes.jsx';
import { sellerRoutes } from '../apps/seller/src/prototype/routes.jsx';
import { adminRoutes } from '../apps/admin/src/prototype/routes.jsx';
export default function PortalRoutes() { const location = useLocation(); return <Routes>{adminRoutes(location)}<Route element={<Shell />}>{commonRoutes(location)}{buyerRoutes(location)}{sellerRoutes(location)}</Route></Routes>; }
