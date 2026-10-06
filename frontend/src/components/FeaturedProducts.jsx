import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

function FeaturedProducts({ setCart, wishlist, setWishlist }) {
  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.name === product.name
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const alreadyWishlisted = currentWishlist.some(
        (item) => item.name === product.name
      );

      if (alreadyWishlisted) {
        return currentWishlist.filter(
          (item) => item.name !== product.name
        );
      }

      return [...currentWishlist, product];
    });
  };

  const isWishlisted = (product) => {
    return wishlist.some((item) => item.name === product.name);
  };

  const products = [
    {
      id: 1,
      name: "Fresh Apples",
      price: 120,
      mrp: 150,
      discount: 20,
      image:
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
    },
    {
      id: 2,
      name: "Fresh Tomatoes",
      price: 60,
      mrp: 80,
      discount: 25,
      image:
        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
    },
    {
      id: 3,
      name: "Fresh Milk",
      price: 55,
      mrp: 65,
      discount: 15,
      image:
        "https://images.unsplash.com/photo-1563636619-e9143da7973b",
    },
    {
      id: 4,
      name: "Whole Wheat Bread",
      price: 45,
      mrp: 55,
      discount: 18,
      image:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    },
  ];

  return (
    <section className="featured-section">
      <div className="section-heading">
        <p>OUR BEST PICKS</p>
        <h2>Featured Products</h2>
      </div>

      <div className="product-list">
        {products.map((product) => (
          <div className="featured-product-wrapper" key={product.id}>
            <Link
              to={`/product/${product.id}`}
              className="featured-product-link"
            >
              <div className="featured-product-click-area">
                <ProductCard
                  name={product.name}
                  price={product.price}
                  mrp={product.mrp}
                  discount={product.discount}
                  image={product.image}
                  onAddToCart={() => addToCart(product)}
                  onToggleWishlist={() => toggleWishlist(product)}
                  isWishlisted={isWishlisted(product)}
                />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;