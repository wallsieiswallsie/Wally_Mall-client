import { Route } from 'react-router';

import { Guard } from '../../../../packages/shared/live/session.jsx';
import { Orders } from '../../../../packages/shared/live/Orders.jsx';
import { Onboarding } from './Pages.jsx';
import { Seller } from './Pages.jsx';
import { AddProduct } from './Pages.jsx';

function sellerRoutes(location) { return <>
<Route
          path="seller/register"
          element={
            <Guard roles={["buyer", "seller"]}>
              <Onboarding />
            </Guard>
          }
        />
<Route
          path="seller/dashboard"
          element={
            <Guard roles={["seller"]}>
              <Seller />
            </Guard>
          }
        />
<Route
          path="seller/products/new"
          element={
            <Guard roles={["seller"]}>
              <AddProduct />
            </Guard>
          }
        />
{["seller/orders", "seller/orders/:id"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Guard roles={["seller"]}>
                <Orders seller key={location.pathname} />
              </Guard>
            }
          />
        ))}
</>; }
export { sellerRoutes };
