
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import PromoBanner from "./components/PromoBanner";
import FeaturedProducts from "./components/FeaturedProducts";
import DealOfTheDay from "./components/DealOfTheDay";
import WhyChooseUs from "./components/WhyChooseUs";
import CustomerReviews from "./components/CustomerReviews";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

// Public pages
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Offers from "./pages/Offers";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Addresses from "./pages/Addresses";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import Categories from "./pages/Categories";
import Returns from "./pages/Returns";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import ShippingPolicy from "./pages/ShippingPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import ReturnPolicy from "./pages/ReturnPolicy";

// Admin pages and layout
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminCategories from "./admin/AdminCategories";
import AdminSubCategories from "./admin/AdminSubCategories";
import AdminProducts from "./admin/AdminProducts";
import AdminProductVariants from "./admin/AdminProductVariants";
import AdminInventory from "./admin/AdminInventory";
import AdminOrders from "./admin/AdminOrders";
import AdminCustomers from "./admin/AdminCustomers";
import AdminCoupons from "./admin/AdminCoupons";
import AdminDelivery from "./admin/AdminDelivery";
import AdminReviews from "./admin/AdminReviews";
import AdminNotifications from "./admin/AdminNotifications";
import AdminCMS from "./admin/AdminCMS";
import AdminReports from "./admin/AdminReports";
import AdminSettings from "./admin/AdminSettings";
import AdminManagement from "./admin/AdminManagement";

// Public page layout
function PageLayout({ children, cartCount, wishlistCount }) {
  return (
    <>
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
      {children}
      <Footer />
    </>
  );
}

// Public home page
function Home({
  cartCount,
  wishlistCount,
  setCart,
  wishlist,
  setWishlist,
}) {
  return (
    <>
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />

      <Hero />
      <CategorySection />
      <PromoBanner />

      <FeaturedProducts
        setCart={setCart}
        wishlist={wishlist}
        setWishlist={setWishlist}
      />

      <DealOfTheDay />
      <WhyChooseUs />
      <CustomerReviews />
      <Newsletter />
      <Footer />
    </>
  );
}

function App() {
  // Public cart and wishlist state
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const wishlistCount = wishlist.length;

  const layoutProps = {
    cartCount,
    wishlistCount,
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC WEBSITE ================= */}

        <Route
          path="/"
          element={
            <Home
              cartCount={cartCount}
              wishlistCount={wishlistCount}
              setCart={setCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <PageLayout {...layoutProps}>
              <Shop
                cart={cart}
                setCart={setCart}
                wishlist={wishlist}
                setWishlist={setWishlist}
              />
            </PageLayout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <PageLayout {...layoutProps}>
              <ProductDetails
                setCart={setCart}
                wishlist={wishlist}
                setWishlist={setWishlist}
              />
            </PageLayout>
          }
        />

        <Route
          path="/categories"
          element={
            <PageLayout {...layoutProps}>
              <Categories />
            </PageLayout>
          }
        />

        <Route
          path="/offers"
          element={
            <PageLayout {...layoutProps}>
              <Offers />
            </PageLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <PageLayout {...layoutProps}>
              <Cart cart={cart} setCart={setCart} />
            </PageLayout>
          }
        />

        <Route
          path="/wishlist"
          element={
            <PageLayout {...layoutProps}>
              <Wishlist
                wishlist={wishlist}
                setWishlist={setWishlist}
                setCart={setCart}
              />
            </PageLayout>
          }
        />

        <Route
          path="/checkout"
          element={
            <PageLayout {...layoutProps}>
              <Checkout cart={cart} setCart={setCart} />
            </PageLayout>
          }
        />

        <Route
          path="/order-confirmation"
          element={
            <PageLayout {...layoutProps}>
              <OrderConfirmation />
            </PageLayout>
          }
        />

        <Route
          path="/orders"
          element={
            <PageLayout {...layoutProps}>
              <Orders cart={cart} setCart={setCart} />
            </PageLayout>
          }
        />

        <Route
          path="/returns"
          element={
            <PageLayout {...layoutProps}>
              <Returns />
            </PageLayout>
          }
        />

        <Route
          path="/order-tracking/:orderId"
          element={
            <PageLayout {...layoutProps}>
              <OrderTracking />
            </PageLayout>
          }
        />

        <Route
          path="/account"
          element={
            <PageLayout {...layoutProps}>
              <Account />
            </PageLayout>
          }
        />

        <Route
          path="/addresses"
          element={
            <PageLayout {...layoutProps}>
              <Addresses />
            </PageLayout>
          }
        />

        <Route
          path="/notifications"
          element={
            <PageLayout {...layoutProps}>
              <Notifications />
            </PageLayout>
          }
        />

        <Route
          path="/support"
          element={
            <PageLayout {...layoutProps}>
              <Support />
            </PageLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PageLayout {...layoutProps}>
              <About />
            </PageLayout>
          }
        />

        <Route
          path="/faq"
          element={
            <PageLayout {...layoutProps}>
              <FAQ />
            </PageLayout>
          }
        />

        <Route
          path="/shipping-policy"
          element={
            <PageLayout {...layoutProps}>
              <ShippingPolicy />
            </PageLayout>
          }
        />

        <Route
          path="/login"
          element={
            <PageLayout {...layoutProps}>
              <Login />
            </PageLayout>
          }
        />

        <Route
          path="/signup"
          element={
            <PageLayout {...layoutProps}>
              <Signup />
            </PageLayout>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PageLayout {...layoutProps}>
              <ForgotPassword />
            </PageLayout>
          }
        />

        <Route
          path="/privacy-policy"
          element={
            <PageLayout {...layoutProps}>
              <PrivacyPolicy />
            </PageLayout>
          }
        />

        <Route
          path="/terms"
          element={
            <PageLayout {...layoutProps}>
              <Terms />
            </PageLayout>
          }
        />

        <Route
          path="/return-policy"
          element={
            <PageLayout {...layoutProps}>
              <ReturnPolicy />
            </PageLayout>
          }
        />

        {/* ================= ADMIN CMS ================= */}

        {/* Login does not use the sidebar layout */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Shared Admin layout: sidebar + Outlet */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="product-variants"
            element={<AdminProductVariants />}
          />

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          <Route
            path="subcategories"
            element={<AdminSubCategories />}
          />

          <Route
            path="inventory"
            element={<AdminInventory />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="customers"
            element={<AdminCustomers />}
          />

          <Route
            path="coupons"
            element={<AdminCoupons />}
          />

          <Route
            path="delivery"
            element={<AdminDelivery />}
          />

          <Route
            path="reviews"
            element={<AdminReviews />}
          />

          <Route
            path="notifications"
            element={<AdminNotifications />}
          />

          <Route
            path="cms"
            element={<AdminCMS />}
          />

          <Route
            path="reports"
            element={<AdminReports />}
          />

          <Route
            path="settings"
            element={<AdminSettings />}
          />

          <Route
            path="admin-management"
            element={<AdminManagement />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
