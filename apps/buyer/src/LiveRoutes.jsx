import { Routes, Route, useLocation } from 'react-router';

import { commonRoutes } from '../../../packages/shared/live/routes.jsx';
import { Shell } from '../../../packages/shared/live/Shell.jsx';
import { buyerRoutes } from './live/routes.jsx';
export default function PortalRoutes() { const location = useLocation(); return <Routes><Route element={<Shell />}>{commonRoutes(location)}{buyerRoutes(location)}</Route></Routes>; }
