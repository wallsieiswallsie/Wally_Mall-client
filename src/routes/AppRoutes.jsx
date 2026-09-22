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
export default function AppRoutes() {
  const location = useLocation();
  return (
    <Routes>
      <Route element={<MarketplaceLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search key={new URLSearchParams(location.search).get('q') || ''} />} />
        <Route path="explore" element={<Search />} />
        <Route path="categories" element={<Categories />} />
        <Route
          path="category/:slug"
          element={<CategoryDetail key={location.pathname} />}
        />
        <Route
          path="product/:slug"
          element={<ProductDetail key={location.pathname} />}
        />
        <Route path="store/:slug" element={<Store key={location.pathname} />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="login" element={<Auth key="login" />} />
        <Route path="register" element={<Auth key="register" register />} />
        <Route path="seller/register" element={<SellerOnboarding />} />
        <Route path="seller/dashboard" element={<SellerDashboard />} />
        <Route path="seller/products/new" element={<AddProduct />} />
        <Route
          path="*"
          element={
            <EmptyState
              title="Sepertinya kamu salah belok."
              text="Halaman ini belum ada. Yuk, kembali menemukan sesuatu di Wally."
              to="/"
              label="Kembali ke Home"
            />
          }
        />
      </Route>
    </Routes>
  );
}
