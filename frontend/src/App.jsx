import { useState, useEffect, useCallback } from "react";

import {

  BrowserRouter,

  Routes,

  Route,

  useLocation,

} from "react-router-dom";

/* =========================================================

   API CONFIGURATION

\========================================================= */

const API_BASE_URL = (

  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

).replace(/\/+$/, "");

/* =========================================================

   PUBLIC COMPONENTS

\========================================================= */

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

\========================================================= */

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

import MyReturns from "./pages/MyReturns";

import ResetPassword from "./pages/ResetPassword";

/* =========================================================

   ADMIN LAYOUT

\========================================================= */

import AdminLayout from "./admin/AdminLayout";

/* =========================================================

   ADMIN PAGES

\========================================================= */

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

import AdminReturns from "./admin/AdminReturns";

import AdminSupportQueries from "./admin/AdminSupportQueries";

/* =========================================================

   LOCAL STORAGE HELPERS

\========================================================= */

function readStorageArray(key) {

  try {

    const saved = localStorage.getItem(key);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];

  } catch (error) {

    console.error(`Unable to read ${key} from localStorage:`, error);

    return [];

  }

}

function readStorageValue(key, fallback = null) {

  try {

    const saved = localStorage.getItem(key);

    return saved ? JSON.parse(saved) : fallback;

  } catch (error) {

    console.error(`Unable to read ${key} from localStorage:`, error);

    return fallback;

  }

}

/* =========================================================

   CUSTOMER SESSION HELPERS

\========================================================= */

function readCustomerSession() {

  // Persistent session takes priority.

  const persistentSession = readStorageValue(

    "customerSession",

    null

  );

  if (persistentSession?.token) {

    return persistentSession;

  }

  // Restore temporary browser-tab session.

  try {

    const temporarySession = JSON.parse(

      sessionStorage.getItem("customerSession") || "null"

    );

    if (temporarySession?.token) {

      return temporarySession;

    }

  } catch (error) {

    console.error(

      "Unable to read temporary customer session:",

      error

    );

  }

  // Remove invalid persistent session.

  try {

    localStorage.removeItem("customerSession");

  } catch (error) {

    console.error("Unable to clear invalid customer session:", error);

  }

  return null;

}

function saveCustomerSession(customerDetails, rememberMe = true) {

  const loggedInCustomer = {

    ...customerDetails,

    id: customerDetails?.id || customerDetails?._id || "",

    name: customerDetails?.name || "Customer",

    email: customerDetails?.email || "",

    mobile: customerDetails?.mobile || "",

    status: customerDetails?.status || "active",

    token:

      customerDetails?.token ||

      customerDetails?.accessToken ||

      customerDetails?.jwt ||

      "",

  };

  if (!loggedInCustomer.token) {

    throw new Error("Authentication token is missing.");

  }

  const serializedSession = JSON.stringify(loggedInCustomer);

  if (rememberMe) {

    localStorage.setItem(

      "customerSession",

      serializedSession

    );

    sessionStorage.removeItem("customerSession");

  } else {

    sessionStorage.setItem(

      "customerSession",

      serializedSession

    );

    localStorage.removeItem("customerSession");

  }

  return loggedInCustomer;

}

function clearCustomerSession() {

  try {

    localStorage.removeItem("customerSession");

    sessionStorage.removeItem("customerSession");

    localStorage.removeItem("sessionCustomer");

  } catch (error) {

    console.error("Unable to clear customer session:", error);

  }

}

/* =========================================================

   SCROLL TO TOP

\========================================================= */

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

/* =========================================================

   PUBLIC PAGE LAYOUT

\========================================================= */

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

/* =========================================================

   HOME PAGE

\========================================================= */

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

/* =========================================================

   MAIN APP

\========================================================= */

function App() {

  /* CART */

  const [cart, setCart] = useState(() =>

    readStorageArray("cart")

  );

  /* WISHLIST */

  const [wishlist, setWishlist] = useState(() =>

    readStorageArray("wishlist")

  );

  /* CUSTOMER SESSION */

  const [customer, setCustomer] = useState(() =>

    readCustomerSession()

  );

  /* =======================================================

     CUSTOMER LOGIN

  ======================================================= */

  const handleLogin = useCallback((customerDetails) => {

    try {

      const rememberMe = customerDetails?.rememberMe !== false;

      const loggedInCustomer = saveCustomerSession(

        customerDetails,

        rememberMe

      );

      setCustomer(loggedInCustomer);

    } catch (error) {

      console.error("Unable to save customer login session:", error);

      alert(

        "Unable to save your login session. Please try again."

      );

    }

  }, []);

  /* =======================================================

     CUSTOMER LOGOUT

  ======================================================= */

  const handleLogout = useCallback(() => {

    clearCustomerSession();

    setCustomer(null);

  }, []);

  /* =======================================================

     CUSTOMER PROFILE UPDATE

  ======================================================= */

  const handleCustomerUpdate = useCallback((updatedCustomer) => {

    const currentSession = readCustomerSession();

    if (!currentSession?.token) {

      return;

    }

    const updatedSession = {

      ...currentSession,

      ...updatedCustomer,

      id:

        updatedCustomer.id ||

        updatedCustomer._id ||

        currentSession.id,

      token: currentSession.token,

    };

    try {

      // Preserve the existing Remember Me storage choice.

      if (localStorage.getItem("customerSession")) {

        localStorage.setItem(

          "customerSession",

          JSON.stringify(updatedSession)

        );

      } else {

        sessionStorage.setItem(

          "customerSession",

          JSON.stringify(updatedSession)

        );

      }

      setCustomer(updatedSession);

    } catch (error) {

      console.error(

        "Unable to update customer session:",

        error

      );

    }

  }, []);

  /* =======================================================

     SHARED DELIVERY LOCATION

  ======================================================= */

  const [deliveryPincode, setDeliveryPincode] = useState(() => {

    try {

      return localStorage.getItem("deliveryPincode") || "";

    } catch {

      return "";

    }

  });

  const [isLocationServiceable, setIsLocationServiceable] =

    useState(false);

  /* =======================================================

     CHECK PINCODE THROUGH BACKEND

  ======================================================= */

  const checkPincode = useCallback(async (pincode) => {

    const normalizedPincode = String(pincode || "").trim();

    if (!/^\d{6}$/.test(normalizedPincode)) {

      return false;

    }

    try {

      const response = await fetch(

        `${API_BASE_URL}/api/delivery/check-pincode/${encodeURIComponent(

          normalizedPincode

        )}`,

        {

          method: "GET",

          headers: {

            Accept: "application/json",

          },

          cache: "no-store",

        }

      );

      if (!response.ok) {

        console.error(

          "PIN code API returned:",

          response.status

        );

        return false;

      }

      const data = await response.json();

      return (

        data.success === true &&

        data.serviceable === true

      );

    } catch (error) {

      console.error("PIN code verification failed:", error);

      return false;

    }

  }, []);

  /* =======================================================

     VERIFY SAVED PINCODE

  ======================================================= */

  useEffect(() => {

    let isMounted = true;

    const verifySavedPincode = async () => {

      if (!deliveryPincode) {

        setIsLocationServiceable(false);

        return;

      }

      const serviceable = await checkPincode(deliveryPincode);

      if (isMounted) {

        setIsLocationServiceable(serviceable);

      }

    };

    verifySavedPincode();

    return () => {

      isMounted = false;

    };

  }, [deliveryPincode, checkPincode]);

  /* =======================================================

     SAVE CART

  ======================================================= */

  useEffect(() => {

    try {

      localStorage.setItem("cart", JSON.stringify(cart));

    } catch (error) {

      console.error("Unable to save cart:", error);

    }

  }, [cart]);

  /* =======================================================

     SAVE WISHLIST

  ======================================================= */

  useEffect(() => {

    try {

      localStorage.setItem(

        "wishlist",

        JSON.stringify(wishlist)

      );

    } catch (error) {

      console.error("Unable to save wishlist:", error);

    }

  }, [wishlist]);

  /* =======================================================

     SAVE DELIVERY PINCODE

  ======================================================= */

  useEffect(() => {

    try {

      if (deliveryPincode) {

        localStorage.setItem(

          "deliveryPincode",

          deliveryPincode

        );

      } else {

        localStorage.removeItem("deliveryPincode");

      }

    } catch (error) {

      console.error("Unable to save delivery pincode:", error);

    }

  }, [deliveryPincode]);

  /* =======================================================

     CART AND WISHLIST COUNTS

  ======================================================= */

  const cartCount = cart.reduce(

    (total, item) =>

      total + (Number(item.quantity) || 1),

    0

  );

  const wishlistCount = wishlist.length;

  /* =======================================================

     SHARED PUBLIC LAYOUT PROPS

  ======================================================= */

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

  /* =======================================================

     ROUTES

  ======================================================= */

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

                customer={customer}

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

        {/* CUSTOMER MY RETURNS */}

<Route
  path="/my-returns"
  element={
    <PageLayout {...layoutProps}>
      <MyReturns customer={customer} />
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

              <Account

                customer={customer}

                onLogout={handleLogout}

                onCustomerUpdate={handleCustomerUpdate}

              />

            </PageLayout>

          }

        />

        {/* ADDRESSES */}

        <Route

          path="/addresses"

          element={

            <PageLayout {...layoutProps}>

              <Addresses customer={customer} />

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

        {/* CUSTOMER LOGIN */}

        <Route

          path="/login"

          element={

            <PageLayout {...layoutProps}>

              <Login onLogin={handleLogin} />

            </PageLayout>

          }

        />

        {/* CUSTOMER SIGNUP */}

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

        <Route
        
        path="/reset-password/:token"
        
        element={<ResetPassword />}
        
        />

        {/* ADMIN LOGIN */}

        <Route

          path="/admin/login"

          element={<AdminLogin />}

        />

        {/* ADMIN ROUTES */}

        <Route

          path="/admin"

          element={<AdminLayout />}

        >

          <Route

            path="dashboard"

            element={<AdminDashboard />}

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

            path="products"

            element={<AdminProducts />}

          />

          <Route

            path="product-variants"

            element={<AdminProductVariants />}

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
          
          path="returns"
          
          element={<AdminReturns />}

          />

          <Route
  
          path="support-queries"

          element={<AdminSupportQueries />}

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
