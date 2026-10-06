import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import TopBar from "./components/TopBar";
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


function HomeSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      return;
    }

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="homepage-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search groceries..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <button type="submit">
          Search
        </button>
      </form>
    </div>
  );
}


function Home({
  cartCount,
  wishlistCount,
  setCart,
  wishlist,
  setWishlist,
}) {
  return (
    <>
      <TopBar />
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />

      <HomeSearch />

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
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

const wishlistCount = wishlist.length;

  return (
    <BrowserRouter>
      <Routes>

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
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
<Shop
  cart={cart}
  setCart={setCart}
  wishlist={wishlist}
  setWishlist={setWishlist}
/>
            </>
          }
        />


        {/* CART */}
        <Route
          path="/cart"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Cart cart={cart} setCart={setCart} />
            </>
          }
        />


        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Checkout cart={cart} setCart={setCart} />
            </>
          }
        />


        {/* ORDER CONFIRMATION */}
        <Route
          path="/order-confirmation"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <OrderConfirmation />
            </>
          }
        />


        {/* LOGIN */}
        <Route
          path="/login"
          element={
            <>
              <TopBar />
              <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />
              <Login />
            </>
          }
        />


        {/* SIGN UP */}
        <Route
          path="/signup"
          element={
            <>
              <TopBar />
              <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />
              <Signup />
            </>
          }
        />


        {/* FORGOT PASSWORD */}
        <Route
          path="/forgot-password"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <ForgotPassword />
            </>
          }
        />


        {/* PRODUCT DETAILS */}
        <Route
          path="/product/:id"
          element={
            <>
              <TopBar />
              <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />
              <ProductDetails setCart={setCart} />
            </>
          }
        />


        {/* WISHLIST */}
        <Route
          path="/wishlist"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Wishlist
                wishlist={wishlist}
                setWishlist={setWishlist}
                setCart={setCart}
              />
            </>
          }
        />


        {/* OFFERS */}
        <Route
          path="/offers"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Offers />
            </>
          }
        />


        {/* ACCOUNT */}
        <Route
          path="/account"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Account />
            </>
          }
        />


        {/* ORDERS */}
        <Route
          path="/orders"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Orders />
            </>
          }
        />


        {/* ORDER TRACKING */}
        <Route
          path="/order-tracking/:orderId"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <OrderTracking />
            </>
          }
        />


        {/* ADDRESSES */}
        <Route
          path="/addresses"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Addresses />
            </>
          }
        />


        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Notifications />
            </>
          }
        />


        {/* SUPPORT */}
        <Route
          path="/support"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Support />
            </>
          }
        />


        {/* CATEGORIES */}
        <Route
          path="/categories"
          element={
            <>
              <TopBar />
<Navbar
  cartCount={cartCount}
  wishlistCount={wishlistCount}
/>
              <Categories />
            </>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;