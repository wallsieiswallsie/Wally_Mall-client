import { Route } from 'react-router';

import { Guard } from '../../../../packages/shared/live/session.jsx';
import { Home } from './Pages.jsx';
import { Catalog } from './Pages.jsx';
import { Categories } from './Pages.jsx';
import { Product } from './Pages.jsx';
import { Store } from './Pages.jsx';
import { Cart } from './Pages.jsx';
import { Payment } from './Pages.jsx';
import { Orders } from '../../../../packages/shared/live/Orders.jsx';

function buyerRoutes(location) { return <>
<Route index element={<Home />} />
{["explore", "search"].map((path) => (
          <Route
            key={path}
            path={path}
            element={<Catalog key={location.pathname} />}
          />
        ))}
<Route path="categories" element={<Categories />} />
<Route
          path="category/:slug"
          element={<Catalog category key={location.pathname} />}
        />
<Route
          path="product/:slug"
          element={<Product key={location.pathname} />}
        />
<Route path="store/:slug" element={<Store key={location.pathname} />} />
<Route
          path="favorites"
          element={
            <Guard>
              <Catalog favorites />
            </Guard>
          }
        />
{["cart", "checkout"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Guard roles={["buyer"]}>
                <Cart key={path} checkout={path === "checkout"} />
              </Guard>
            }
          />
        ))}
<Route
          path="payment/:id"
          element={
            <Guard roles={["buyer"]}>
              <Payment key={location.pathname} />
            </Guard>
          }
        />
{["orders", "orders/:id"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Guard roles={["buyer"]}>
                <Orders key={location.pathname} />
              </Guard>
            }
          />
        ))}
</>; }
export { buyerRoutes };
