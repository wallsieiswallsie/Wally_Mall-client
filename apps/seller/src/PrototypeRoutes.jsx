import { Routes, Route, useLocation } from 'react-router';

import { commonRoutes } from '../../../packages/shared/prototype/routes.jsx';
import Shell from '../../../packages/shared/layouts/MarketplaceLayout.jsx';
import { sellerRoutes } from './prototype/routes.jsx';
export default function PortalRoutes() { const location = useLocation(); return <Routes><Route element={<Shell />}>{commonRoutes(location)}{sellerRoutes(location)}</Route></Routes>; }
