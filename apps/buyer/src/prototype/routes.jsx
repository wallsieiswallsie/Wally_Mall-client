import { Route } from 'react-router';

import Home from './Home.jsx';
import Search from './Search.jsx';
import Categories from './Categories.jsx';
import { CategoryDetail } from './Categories.jsx';
import ProductDetail from './ProductDetail.jsx';
import Store from './Store.jsx';
import Favorites from './Favorites.jsx';
import { RequireRole } from '../../../../packages/shared/state/PrototypeContext.jsx';
import Cart from './commerce/Cart.jsx';
import Checkout from './commerce/Checkout.jsx';
import Payment from './commerce/Payment.jsx';
import Orders from '../../../../packages/shared/prototype/commerce/Orders.jsx';

const guard = (roles, element) => <RequireRole roles={roles}>{element}</RequireRole>;
function buyerRoutes(location) { return <>
<Route index element={<Home />} />
<Route path="search" element={<Search key={new URLSearchParams(location.search).get('q') || ''} />} />
<Route path="explore" element={<Search />} />
<Route path="categories" element={<Categories />} />
<Route path="category/:slug" element={<CategoryDetail key={location.pathname} />} />
<Route path="product/:slug" element={<ProductDetail key={location.pathname} />} />
<Route path="store/:slug" element={<Store key={location.pathname} />} />
<Route path="favorites" element={<Favorites />} />
<Route path="cart" element={guard(['buyer'], <Cart />)} />
<Route path="checkout" element={guard(['buyer'], <Checkout />)} />
<Route path="payment/:id" element={guard(['buyer'], <Payment />)} />
<Route path="orders" element={guard(['buyer'], <Orders />)} />
<Route path="orders/:id" element={guard(['buyer'], <Orders />)} />
</>; }
export { buyerRoutes };
