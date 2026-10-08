import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Fresh Apples",
    price: 120,
    mrp: 150,
    discount: 20,
    category: "Fruits & Vegetables",
    description:
      "Fresh and juicy apples, carefully selected for quality and everyday freshness.",
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 2,
    name: "Fresh Tomatoes",
    price: 60,
    mrp: 80,
    discount: 25,
    category: "Fruits & Vegetables",
    description:
      "Fresh, ripe tomatoes perfect for curries, salads, sauces and everyday cooking.",
    images: [
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1524593166156-312f362cada0?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 3,
    name: "Fresh Milk",
    price: 55,
    mrp: 65,
    discount: 15,
    category: "Dairy & Bakery",
    description:
      "Fresh and wholesome milk suitable for tea, coffee, breakfast and daily use.",
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1560507992-eb63ffee0847?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1600788907416-456578634209?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 4,
    name: "Whole Wheat Bread",
    price: 45,
    mrp: 55,
    discount: 18,
    category: "Dairy & Bakery",
    description:
      "Soft and nutritious whole wheat bread made for a healthy everyday breakfast.",
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 5,
    name: "Fresh Bananas",
    price: 50,
    mrp: 60,
    discount: 17,
    category: "Fruits & Vegetables",
    description:
      "Naturally sweet and fresh bananas, perfect for breakfast and snacks.",
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1574226516831-e1dff420e37f?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 6,
    name: "Basmati Rice",
    price: 180,
    mrp: 220,
    discount: 18,
    category: "Staples",
    description:
      "Premium long-grain basmati rice with a rich aroma and delicious taste.",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 7,
    name: "Potato Chips",
    price: 40,
    mrp: 50,
    discount: 20,
    category: "Snacks",
    description:
      "Crispy and delicious potato chips, perfect for snack time.",
    images: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1623238913973-21e45cced554?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 8,
    name: "Orange Juice",
    price: 110,
    mrp: 130,
    discount: 15,
    category: "Beverages",
    description:
      "Refreshing orange juice with a naturally sweet and citrusy taste.",
    images: [
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=1000&q=85",
    ],
  },
];

function ProductDetails({
  setCart,
  wishlist,
  setWishlist,
}) {
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    return (
      <main className="product-details-page">
        <div className="product-not-found">
          <h1>Product Not Found</h1>
          <Link to="/shop">Back to Shop</Link>
        </div>
      </main>
    );
  }

  const isWishlisted = wishlist.some(
    (item) => item.name === product.name
  );

  const handleAddToCart = () => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.name === product.name
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.name === product.name
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          image: product.images[0],
          quantity,
        },
      ];
    });

    setAdded(true);
  };

  const handleWishlist = () => {
    setWishlist((currentWishlist) => {
      const alreadyWishlisted = currentWishlist.some(
        (item) => item.name === product.name
      );

      if (alreadyWishlisted) {
        return currentWishlist.filter(
          (item) => item.name !== product.name
        );
      }

      return [
        ...currentWishlist,
        {
          ...product,
          image: product.images[0],
        },
      ];
    });
  };

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <Link to="/shop" className="back-to-shop">
          ← Back to Shop
        </Link>

        <div className="product-details-card">

          {/* Product Gallery */}
          <div className="product-gallery">
            <div className="product-main-image">
              <img
                src={product.images[selectedImage]}
                alt={`${product.name} view ${selectedImage + 1}`}
              />
            </div>

            <div className="product-thumbnails">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`product-thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View ${product.name} image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="product-details-info">
            <span className="product-category">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <p className="product-description">
              {product.description}
            </p>

            <div className="details-price">
              <span className="details-selling-price">
                ₹{product.price}
              </span>

              <span className="details-mrp">
                ₹{product.mrp}
              </span>

              <span className="details-discount">
                {product.discount}% OFF
              </span>
            </div>

            <p className="product-tax">
              Inclusive of applicable taxes
            </p>

            <div className="quantity-section">
              <span>Quantity</span>

              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* Product Actions */}
            <div className="product-action-row">
              <button
                type="button"
                className="details-add-button"
                onClick={handleAddToCart}
              >
                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>

              <button
                type="button"
                className={`details-wishlist-button ${
                  isWishlisted ? "wishlisted" : ""
                }`}
                onClick={handleWishlist}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <Heart
                  size={21}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
                <span>
                  {isWishlisted
                    ? "Wishlisted"
                    : "Wishlist"}
                </span>
              </button>
            </div>

            {added && (
              <Link
                to="/cart"
                className="view-cart-link"
              >
                View Cart →
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;