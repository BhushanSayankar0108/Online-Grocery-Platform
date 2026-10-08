import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* =========================================================
   PUBLIC COMPONENTS
========================================================= */

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

/* =========================================================
   PUBLIC PAGES
========================================================= */

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

/* =========================================================
   ADMIN PAGES
========================================================= */

import AdminLogin from "./admin/AdminLogin";
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

/* =========================================================
   PUBLIC PAGE LAYOUT
========================================================= */

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

/* =========================================================
   PUBLIC HOME PAGE
========================================================= */

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

/* =========================================================
   APP
========================================================= */

function App() {
  /* ---------------------------------------------------------
     PUBLIC CART & WISHLIST STATE
  --------------------------------------------------------- */

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

        {/* =====================================================
            PUBLIC WEBSITE
        ====================================================== */}

        {/* HOME */}
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

        {/* SHOP */}
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

        {/* PRODUCT DETAILS */}
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

        {/* CATEGORIES */}
        <Route
          path="/categories"
          element={
            <PageLayout {...layoutProps}>
              <Categories />
            </PageLayout>
          }
        />

        {/* OFFERS */}
        <Route
          path="/offers"
          element={
            <PageLayout {...layoutProps}>
              <Offers />
            </PageLayout>
          }
        />

        {/* CART */}
        <Route
          path="/cart"
          element={
            <PageLayout {...layoutProps}>
              <Cart
                cart={cart}
                setCart={setCart}
              />
            </PageLayout>
          }
        />

        {/* WISHLIST */}
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

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={
            <PageLayout {...layoutProps}>
              <Checkout
                cart={cart}
                setCart={setCart}
              />
            </PageLayout>
          }
        />

        {/* ORDER CONFIRMATION */}
        <Route
          path="/order-confirmation"
          element={
            <PageLayout {...layoutProps}>
              <OrderConfirmation />
            </PageLayout>
          }
        />

        {/* ORDERS */}
        <Route
          path="/orders"
          element={
            <PageLayout {...layoutProps}>
              <Orders
                cart={cart}
                setCart={setCart}
              />
            </PageLayout>
          }
        />

        {/* RETURNS */}
        <Route
          path="/returns"
          element={
            <PageLayout {...layoutProps}>
              <Returns />
            </PageLayout>
          }
        />

        {/* ORDER TRACKING */}
        <Route
          path="/order-tracking/:orderId"
          element={
            <PageLayout {...layoutProps}>
              <OrderTracking />
            </PageLayout>
          }
        />

        {/* ACCOUNT */}
        <Route
          path="/account"
          element={
            <PageLayout {...layoutProps}>
              <Account />
            </PageLayout>
          }
        />

        {/* ADDRESSES */}
        <Route
          path="/addresses"
          element={
            <PageLayout {...layoutProps}>
              <Addresses />
            </PageLayout>
          }
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <PageLayout {...layoutProps}>
              <Notifications />
            </PageLayout>
          }
        />

        {/* SUPPORT */}
        <Route
          path="/support"
          element={
            <PageLayout {...layoutProps}>
              <Support />
            </PageLayout>
          }
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={
            <PageLayout {...layoutProps}>
              <About />
            </PageLayout>
          }
        />

        {/* FAQ */}
        <Route
          path="/faq"
          element={
            <PageLayout {...layoutProps}>
              <FAQ />
            </PageLayout>
          }
        />

        {/* SHIPPING POLICY */}
        <Route
          path="/shipping-policy"
          element={
            <PageLayout {...layoutProps}>
              <ShippingPolicy />
            </PageLayout>
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            <PageLayout {...layoutProps}>
              <Login />
            </PageLayout>
          }
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={
            <PageLayout {...layoutProps}>
              <Signup />
            </PageLayout>
          }
        />

        {/* FORGOT PASSWORD */}
        <Route
          path="/forgot-password"
          element={
            <PageLayout {...layoutProps}>
              <ForgotPassword />
            </PageLayout>
          }
        />

        {/* PRIVACY POLICY */}
        <Route
          path="/privacy-policy"
          element={
            <PageLayout {...layoutProps}>
              <PrivacyPolicy />
            </PageLayout>
          }
        />

        {/* TERMS */}
        <Route
          path="/terms"
          element={
            <PageLayout {...layoutProps}>
              <Terms />
            </PageLayout>
          }
        />

        {/* RETURN POLICY */}
        <Route
          path="/return-policy"
          element={
            <PageLayout {...layoutProps}>
              <ReturnPolicy />
            </PageLayout>
          }
        />

        {/* =====================================================
            ADMIN CMS
        ====================================================== */}

        {/* ADMIN LOGIN */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* CATEGORIES */}
        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />

        {/* SUBCATEGORIES */}
        <Route
          path="/admin/subcategories"
          element={<AdminSubCategories />}
        />

        {/* PRODUCTS */}
        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        {/* PRODUCT VARIANTS */}
        <Route
          path="/admin/product-variants"
          element={<AdminProductVariants />}
        />

        {/* INVENTORY */}
        <Route
          path="/admin/inventory"
          element={<AdminInventory />}
        />

        {/* ORDERS */}
        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        {/* CUSTOMERS */}
        <Route
          path="/admin/customers"
          element={<AdminCustomers />}
        />

        {/* COUPONS & OFFERS */}
        <Route
          path="/admin/coupons"
          element={<AdminCoupons />}
        />

        {/* DELIVERY */}
        <Route
          path="/admin/delivery"
          element={<AdminDelivery />}
        />

        {/* REVIEWS */}
        <Route
          path="/admin/reviews"
          element={<AdminReviews />}
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/admin/notifications"
          element={<AdminNotifications />}
        />

        {/* WEBSITE CMS */}
        <Route
          path="/admin/cms"
          element={<AdminCMS />}
        />

        {/* REPORTS */}
        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />

        {/* SETTINGS */}
        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

        {/* ADMIN MANAGEMENT */}
        <Route
          path="/admin/admin-management"
          element={<AdminManagement />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;