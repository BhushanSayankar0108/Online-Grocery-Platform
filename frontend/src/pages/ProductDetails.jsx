import { useState } from "react";
import { Link, useParams } from "react-router-dom";

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
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80",
  },
];

function ProductDetails({ setCart }) {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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

  const handleAddToCart = () => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.name === product.name
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...currentCart, { ...product, quantity }];
    });

    setAdded(true);
  };

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <Link to="/shop" className="back-to-shop">
          ← Back to Shop
        </Link>

        <div className="product-details-card">
          <div className="product-details-image">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-details-info">
            <span className="product-category">{product.category}</span>

            <h1>{product.name}</h1>

            <p className="product-description">{product.description}</p>

            <div className="details-price">
              <span className="details-selling-price">
                ₹{product.price}
              </span>

              <span className="details-mrp">₹{product.mrp}</span>

              <span className="details-discount">
                {product.discount}% OFF
              </span>
            </div>

            <p className="product-tax">Inclusive of applicable taxes</p>

            <div className="quantity-section">
              <span>Quantity</span>

              <div className="quantity-control">
                <button
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="details-add-button"
              onClick={handleAddToCart}
            >
              {added ? "Added to Cart ✓" : "Add to Cart"}
            </button>

            {added && (
              <Link to="/cart" className="view-cart-link">
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