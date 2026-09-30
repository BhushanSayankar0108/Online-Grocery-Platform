import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import PromoBanner from "./components/PromoBanner";
import FeaturedProducts from "./components/FeaturedProducts";
import DealOfTheDay from "./components/DealOfTheDay";

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
    </>
  );
}

export default App;