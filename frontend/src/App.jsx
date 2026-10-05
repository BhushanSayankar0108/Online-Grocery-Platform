import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function Home({ cartCount, setCart }) {
  return (
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />
      <Hero />
      <CategorySection />
      <PromoBanner />
      <FeaturedProducts setCart={setCart} />  
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

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home cartCount={cartCount} setCart={setCart} />}
        />

        <Route
          path="/shop"
          element={
            <>
              <TopBar />
              <Navbar cartCount={cartCount} />
              <Shop cart={cart} setCart={setCart} />
            </>
          }
        />

        <Route
          path="/cart"
          element={
            <>
              <TopBar />
              <Navbar cartCount={cartCount} />
              <Cart cart={cart} setCart={setCart} />
            </>
          }
        />
<Route
  path="/checkout"
  element={
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />
      <Checkout cart={cart} setCart={setCart} />
    </>
  }
/>
<Route
  path="/order-confirmation"
  element={
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />
      <OrderConfirmation />
    </>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;