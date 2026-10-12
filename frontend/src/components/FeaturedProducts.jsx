import { useState } from "react";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import products from "../data/products";

function FeaturedProducts({ setCart, cart, wishlist, setWishlist }) {
  const [selectedVariants, setSelectedVariants] = useState({});

  const getVariant = (product, variantId) =>
    product.variants?.find((variant) => variant.id === variantId) ||
    product.variants?.[0] ||
    null;

  const getSelectedVariant = (product) =>
    getVariant(
      product,
      selectedVariants[product.id] || product.variants?.[0]?.id
    );

  const getCartKey = (product, variant) =>
    `${product.id}-${variant?.id || product.quantity}`;

  const createCartProduct = (product, variant) => ({
    ...product,
    quantity: 1,
    variantId: variant?.id || null,
    variantLabel: variant?.label || product.quantity,
    price: variant?.price ?? product.price,
    mrp: variant?.mrp ?? product.mrp,
    cartKey: getCartKey(product, variant),
  });

  const addToCart = (product, variant) => {
    const cartProduct = createCartProduct(product, variant);

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) =>
          item.cartKey === cartProduct.cartKey ||
          (!item.cartKey &&
            item.id === product.id &&
            item.variantId === cartProduct.variantId)
      );

      if (existing) {
        return currentCart.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, cartProduct];
    });
  };

  const decreaseQuantity = (product, variant) => {
    const key = getCartKey(product, variant);

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          (item.cartKey === key ||
            (!item.cartKey &&
              item.id === product.id &&
              item.variantId === (variant?.id || null)))
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getCartQuantity = (product, variant) => {
    const key = getCartKey(product, variant);

    return (
      cart.find(
        (item) =>
          item.cartKey === key ||
          (!item.cartKey &&
            item.id === product.id &&
            item.variantId === (variant?.id || null))
      )?.quantity || 0
    );
  };

  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some(
        (item) => item.id === product.id
      );

      return exists
        ? currentWishlist.filter((item) => item.id !== product.id)
        : [...currentWishlist, product];
    });
  };

  const isWishlisted = (product) =>
    wishlist.some((item) => item.id === product.id);

  const featuredProducts = products.slice(0, 4);

  return (
    <section className="featured-section">
      <div className="section-heading featured-heading">
        <div>
          <p>HANDPICKED FOR YOU</p>
          <h2>Featured Products</h2>
        </div>

        <Link to="/shop" className="view-all-link">
          View all products →
        </Link>
      </div>

      <div className="product-list">
        {featuredProducts.map((product, index) => {
          const variant = getSelectedVariant(product);

          return (
            <div className="featured-product-wrapper" key={product.id}>
              <Link
                to={`/product/${product.id}`}
                className="featured-product-link"
              >
                <ProductCard
                  product={product}
                  name={product.name}
                  quantity={product.quantity}
                  price={product.price}
                  mrp={product.mrp}
                  discount={
                    product.mrp > 0
                      ? Math.round(
                          ((product.mrp - product.price) / product.mrp) * 100
                        )
                      : 0
                  }
                  image={product.image}
                  variants={product.variants || []}
                  selectedVariantId={variant?.id}
                  onVariantChange={(variantId) =>
                    setSelectedVariants((current) => ({
                      ...current,
                      [product.id]: variantId,
                    }))
                  }
                  imagePriority={index < 2}
                  cartQuantity={getCartQuantity(product, variant)}
                  onAddToCart={() => addToCart(product, variant)}
                  onIncreaseQuantity={() => addToCart(product, variant)}
                  onDecreaseQuantity={() => decreaseQuantity(product, variant)}
                  onToggleWishlist={() => toggleWishlist(product)}
                  isWishlisted={isWishlisted(product)}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturedProducts;