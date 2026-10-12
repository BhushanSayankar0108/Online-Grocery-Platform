import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

/* DEMO SERVICEABLE PIN CODES — UPDATE THESE LATER */
const SERVICEABLE_PINCODES = [
  "411001",
  "411004",
  "411007",
  "411014",
  "411018",
  "411021",
  "411027",
  "411033",
  "411038",
  "411045",
  "411046",
  "411048",
  "411057",
  "411062",
];

/* PUBLIC COMPONENTS */
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

/* PUBLIC PAGES */
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

/* ADMIN PAGES */
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

/* SCROLL TO TOP ON PAGE NAVIGATION */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

/* PUBLIC PAGE LAYOUT */
function PageLayout({
  children,
  cartCount,
  wishlistCount,
  deliveryPincode,
  setDeliveryPincode,
  isLocationServiceable,
  checkPincode,
  customer,
  onLogout,
}) {
  return (
    <>
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        deliveryPincode={deliveryPincode}
        setDeliveryPincode={setDeliveryPincode}
        isLocationServiceable={isLocationServiceable}
        checkPincode={checkPincode}
        customer={customer}
        onLogout={onLogout}
      />
      {children}
      <Footer />
    </>
  );
}

/* HOME PAGE */
function Home({
  cart,
  cartCount,
  wishlistCount,
  setCart,
  wishlist,
  setWishlist,
  deliveryPincode,
  setDeliveryPincode,
  isLocationServiceable,
  checkPincode,
  customer,
  onLogout,
}) {
  return (
    <>
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        deliveryPincode={deliveryPincode}
        setDeliveryPincode={setDeliveryPincode}
        isLocationServiceable={isLocationServiceable}
        checkPincode={checkPincode}
        customer={customer}
        onLogout={onLogout}
      />

      <Hero />
      <CategorySection />
      <PromoBanner />

      <FeaturedProducts
        cart={cart}
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

/* APP */
function App() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  /* SHARED DEMO CUSTOMER LOGIN */
  /* SHARED DEMO CUSTOMER LOGIN */
  const [customer, setCustomer] = useState(() => {
    try {
      const savedCustomer = localStorage.getItem("customerSession");
      return savedCustomer ? JSON.parse(savedCustomer) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (customerDetails) => {
    const loggedInCustomer = {
      name: customerDetails.name || "Customer",
      email: customerDetails.email || "",
      mobile: customerDetails.mobile || "",
    };

    setCustomer(loggedInCustomer);

    try {
      localStorage.setItem(
        "customerSession",
        JSON.stringify(loggedInCustomer)
      );
    } catch {
      // Login state remains available for the current app session.
    }
  };

  const handleLogout = () => {
    setCustomer(null);

    try {
      localStorage.removeItem("customerSession");
    } catch {
      // The logout still works for the current app session.
    }
  };

  /* SHARED DELIVERY LOCATION */
  const [deliveryPincode, setDeliveryPincode] = useState(() => {
    try {
      return localStorage.getItem("deliveryPincode") || "";
    } catch {
      return "";
    }
  });

  const checkPincode = (pincode) => {
    const normalizedPincode = String(pincode).trim();

    if (!/^\d{6}$/.test(normalizedPincode)) {
      return false;
    }

    return SERVICEABLE_PINCODES.includes(normalizedPincode);
  };

  const isLocationServiceable = checkPincode(deliveryPincode);

  useEffect(() => {
    try {
      if (deliveryPincode) {
        localStorage.setItem("deliveryPincode", deliveryPincode);
      } else {
        localStorage.removeItem("deliveryPincode");
      }
    } catch {
      // Location checking still works if browser storage is unavailable.
    }
  }, [deliveryPincode]);

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const wishlistCount = wishlist.length;

  const layoutProps = {
    cartCount,
    wishlistCount,
    deliveryPincode,
    setDeliveryPincode,
    isLocationServiceable,
    checkPincode,
    customer,
    onLogout: handleLogout,
  };

  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <Home
              cart={cart}
              cartCount={cartCount}
              wishlistCount={wishlistCount}
              setCart={setCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
              deliveryPincode={deliveryPincode}
              setDeliveryPincode={setDeliveryPincode}
              isLocationServiceable={isLocationServiceable}
              checkPincode={checkPincode}
              customer={customer}
              onLogout={handleLogout}
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
                deliveryPincode={deliveryPincode}
                isLocationServiceable={isLocationServiceable}
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
                deliveryPincode={deliveryPincode}
                isLocationServiceable={isLocationServiceable}
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
                deliveryPincode={deliveryPincode}
                isLocationServiceable={isLocationServiceable}
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
                deliveryPincode={deliveryPincode}
                isLocationServiceable={isLocationServiceable}
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
                deliveryPincode={deliveryPincode}
                isLocationServiceable={isLocationServiceable}
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
              <Orders cart={cart} setCart={setCart} />
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
      <Account customer={customer} onLogout={handleLogout} />
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

        {/* POLICIES */}
        <Route
          path="/shipping-policy"
          element={
            <PageLayout {...layoutProps}>
              <ShippingPolicy />
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

        {/* AUTH */}
        <Route
          path="/login"
          element={
            <PageLayout {...layoutProps}>
              <Login onLogin={handleLogin} />
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

        {/* ADMIN CMS */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/subcategories" element={<AdminSubCategories />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/product-variants" element={<AdminProductVariants />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/delivery" element={<AdminDelivery />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/cms" element={<AdminCMS />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/admin-management" element={<AdminManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;