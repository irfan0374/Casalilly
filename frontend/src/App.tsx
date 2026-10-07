import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import Home from "./routes/Home";
import Shop from "./routes/Shop";
import About from "./routes/About";
import Wishlist from "./routes/Wishlist";
import ProductDetail from "./routes/ProductDetail";
import NotFound from "./routes/NotFound";
import AdminLogin from "./routes/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./routes/admin/AdminDashboard";
import AdminProducts from "./routes/admin/AdminProducts";
import AdminMore from "./routes/admin/AdminMore";
import AdminProductForm from "./routes/admin/AdminProductForm";
import HeroSlideList from "./routes/admin/HeroSlideList";
import HeroSlideForm from "./routes/admin/HeroSlideForm";
import OccasionList from "./routes/admin/OccasionList";
import OccasionForm from "./routes/admin/OccasionForm";
import AboutSettingsForm from "./routes/admin/AboutSettingsForm";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-stone-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route
                element={
                  <RequireAuth>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/more" element={<AdminMore />} />
                <Route path="/admin/products/new" element={<AdminProductForm />} />
                <Route
                  path="/admin/products/:id/edit"
                  element={<AdminProductForm />}
                />
                <Route path="/admin/hero-slides" element={<HeroSlideList />} />
                <Route path="/admin/hero-slides/new" element={<HeroSlideForm />} />
                <Route
                  path="/admin/hero-slides/:id/edit"
                  element={<HeroSlideForm />}
                />
                <Route path="/admin/occasions" element={<OccasionList />} />
                <Route path="/admin/occasions/new" element={<OccasionForm />} />
                <Route path="/admin/occasions/:id/edit" element={<OccasionForm />} />
                <Route path="/admin/about" element={<AboutSettingsForm />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
