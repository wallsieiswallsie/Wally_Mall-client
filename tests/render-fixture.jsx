import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';

import App from '../compat/App.jsx';
import Buyer from '../apps/buyer/src/App.jsx';
import Seller from '../apps/seller/src/App.jsx';
import Admin from '../apps/admin/src/App.jsx';
export function renderRoute(path, portal = 'compat') {
  const Application = { compat: App, buyer: Buyer, seller: Seller, admin: Admin }[portal];
  return renderToString(<MemoryRouter initialEntries={[path]}><Application/></MemoryRouter>);
}
