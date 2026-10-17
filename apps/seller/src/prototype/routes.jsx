import { Route } from 'react-router';

import SellerOnboarding from './SellerOnboarding.jsx';
import SellerDashboard from './SellerDashboard.jsx';
import AddProduct from './AddProduct.jsx';
import { RequireRole } from '../../../../packages/shared/state/PrototypeContext.jsx';
import Orders from '../../../../packages/shared/prototype/commerce/Orders.jsx';

const guard = (roles, element) => <RequireRole roles={roles}>{element}</RequireRole>;
function sellerRoutes(location) { return <>
<Route path="seller/register" element={<SellerOnboarding />} />
<Route path="seller/dashboard" element={guard(['seller'], <SellerDashboard />)} />
<Route path="seller/orders" element={guard(['seller'], <Orders />)} />
<Route path="seller/orders/:id" element={guard(['seller'], <Orders />)} />
<Route path="seller/products/new" element={guard(['seller'], <AddProduct />)} />
</>; }
export { sellerRoutes };
