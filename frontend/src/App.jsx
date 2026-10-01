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

function App() {
  return (
    <>
      <TopBar />
      <Navbar />
      <Hero />
      <CategorySection />
      <PromoBanner />
      <FeaturedProducts />
      <DealOfTheDay />
      <WhyChooseUs />
      <CustomerReviews />
      <Newsletter />
      <Footer />
    </>
  );
}

export default App;