import ProductCard from "./ProductCard";

function FeaturedProducts() {
  return (
    <section className="featured-section">
      <div className="section-heading">
        <p>OUR BEST PICKS</p>
        <h2>Featured Products</h2>
      </div>

      <div className="product-list">
       <ProductCard
  name="Fresh Apples"
  price="120"
  mrp="150"
  discount="20"
  image="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6"
/>

<ProductCard
  name="Fresh Tomatoes"
  price="60"
  mrp="80"
  discount="25"
  image="https://images.unsplash.com/photo-1546094096-0df4bcaaa337"
/>

<ProductCard
  name="Fresh Milk"
  price="55"
  mrp="65"
  discount="15"
  image="https://images.unsplash.com/photo-1563636619-e9143da7973b"
/>

<ProductCard
  name="Whole Wheat Bread"
  price="45"
  mrp="55"
  discount="18"
  image="https://images.unsplash.com/photo-1509440159596-0249088772ff"
/>
      </div>
    </section>
  );
}

export default FeaturedProducts;