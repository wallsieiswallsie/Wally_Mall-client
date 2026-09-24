import { Routes, Route, useLocation } from "react-router";
import MarketplaceLayout from "../layouts/MarketplaceLayout";
import Home from "../pages/Home";
import Search from "../pages/Search";
import Categories, { CategoryDetail } from "../pages/Categories";
import ProductDetail from "../pages/ProductDetail";
import Store from "../pages/Store";
import Favorites from "../pages/Favorites";
import Auth from "../pages/Auth";
import SellerOnboarding from "../pages/SellerOnboarding";
import SellerDashboard from "../pages/SellerDashboard";
import AddProduct from "../pages/AddProduct";
import { EmptyState } from "../components/common/UI";
import { RequireRole } from '../state/PrototypeContext';
import InternalLayout from '../layouts/InternalLayout';
import Cart from '../pages/commerce/Cart';
import Checkout from '../pages/commerce/Checkout';
import Payment from '../pages/commerce/Payment';
import Orders from '../pages/commerce/Orders';
import Overview from '../pages/internal/Overview';
import Transactions from '../pages/internal/Transactions';
import People from '../pages/internal/People';
import Operations from '../pages/internal/Operations';
import { AdminManagement, FeeSettings, AuditLog, Settings } from '../pages/internal/Administration';
const guard = (roles, element) => <RequireRole roles={roles}>{element}</RequireRole>;
export default function AppRoutes() {
  const location = useLocation();
  return <Routes>
      {['admin', 'super_admin'].map(role => <Route key={role} path={role === 'admin' ? '/admin' : '/super-admin'} element={guard([role], <InternalLayout />)}>
        <Route index element={<Overview />} />
        <Route path="orders" element={<Transactions operational />} />
        <Route path="sellers" element={<People />} />
        {['products', 'categories', 'reports', 'moderation', 'support'].map(section => <Route key={section} path={section} element={<Operations key={section} section={section} />} />)}
        {role === 'super_admin' && <>
          <Route path="transactions" element={<Transactions />} />
          <Route path="buyers" element={<People kind="buyers" />} />
          <Route path="operations" element={<Overview operational />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="platform-fee" element={<FeeSettings />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </>}
        <Route path="*" element={<EmptyState title="Halaman tidak tersedia untuk role ini" to={role === 'admin' ? '/admin' : '/super-admin'} label="Kembali ke overview" />} />
      </Route>)}
      <Route element={<MarketplaceLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search key={new URLSearchParams(location.search).get('q') || ''} />} />
        <Route path="explore" element={<Search />} />
        <Route path="categories" element={<Categories />} />
        <Route path="category/:slug" element={<CategoryDetail key={location.pathname} />} />
        <Route path="product/:slug" element={<ProductDetail key={location.pathname} />} />
        <Route path="store/:slug" element={<Store key={location.pathname} />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="login" element={<Auth key="login" />} />
        <Route path="register" element={<Auth key="register" register />} />
        <Route path="seller/register" element={<SellerOnboarding />} />
        <Route path="cart" element={guard(['buyer'], <Cart />)} />
        <Route path="checkout" element={guard(['buyer'], <Checkout />)} />
        <Route path="payment/:id" element={guard(['buyer'], <Payment />)} />
        <Route path="orders" element={guard(['buyer'], <Orders />)} />
        <Route path="orders/:id" element={guard(['buyer'], <Orders />)} />
        <Route path="seller/dashboard" element={guard(['seller'], <SellerDashboard />)} />
        <Route path="seller/orders" element={guard(['seller'], <Orders />)} />
        <Route path="seller/orders/:id" element={guard(['seller'], <Orders />)} />
        <Route path="seller/products/new" element={guard(['seller'], <AddProduct />)} />
        <Route path="*" element={<EmptyState title="Sepertinya kamu salah belok." text="Halaman ini belum ada. Yuk, kembali menemukan sesuatu di Wally." to="/" label="Kembali ke Home" />} />
      </Route>
    </Routes>;
}
