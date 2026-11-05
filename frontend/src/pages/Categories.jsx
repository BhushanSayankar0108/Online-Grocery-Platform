
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Apple,
  Milk,
  Wheat,
  Cookie,
  Coffee,
  SprayCan,
  HeartPulse,
  ShoppingBasket,
  ArrowRight,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const defaultCategories = [
  {
    name: "Fruits & Vegetables",
    description: "Fresh fruits, vegetables and leafy greens",
    items:
      "Fresh Fruits • Vegetables • Leafy Vegetables • Exotic Vegetables",
  },
  {
    name: "Dairy & Bakery",
    description: "Daily dairy and bakery essentials",
    items: "Milk • Curd • Paneer • Cheese • Bread • Bakery",
  },
  {
    name: "Staples",
    description: "Everyday kitchen essentials",
    items: "Rice • Wheat • Flour • Pulses • Dal • Sugar • Salt",
  },
  {
    name: "Snacks",
    description: "Tasty snacks for every occasion",
    items: "Biscuits • Chips • Namkeen • Chocolates",
  },
  {
    name: "Beverages",
    description: "Refreshing drinks for every day",
    items: "Tea • Coffee • Juices • Soft Drinks",
  },
  {
    name: "Household",
    description: "Keep your home clean and fresh",
    items: "Cleaning • Laundry • Kitchen",
  },
  {
    name: "Personal Care",
    description: "Everyday personal care essentials",
    items: "Bath & Body • Hair Care • Oral Care",
  },
];

const iconComponents = {
  apple: Apple,
  milk: Milk,
  wheat: Wheat,
  cookie: Cookie,
  coffee: Coffee,
  spraycan: SprayCan,
  heartpulse: HeartPulse,
  shoppingbasket: ShoppingBasket,
};

function getCategoryName(category) {
  if (typeof category === "string") return category;

  return (
    category?.name ||
    category?.categoryName ||
    category?.title ||
    category?.category_name ||
    ""
  );
}

function getCategoryIcon(name) {
  const normalizedName = name.toLowerCase();

  if (
    normalizedName.includes("fruit") ||
    normalizedName.includes("vegetable")
  ) {
    return Apple;
  }

  if (
    normalizedName.includes("dairy") ||
    normalizedName.includes("bakery") ||
    normalizedName.includes("milk")
  ) {
    return Milk;
  }

  if (
    normalizedName.includes("staple") ||
    normalizedName.includes("grain") ||
    normalizedName.includes("rice")
  ) {
    return Wheat;
  }

  if (
    normalizedName.includes("snack") ||
    normalizedName.includes("biscuit")
  ) {
    return Cookie;
  }

  if (
    normalizedName.includes("beverage") ||
    normalizedName.includes("drink")
  ) {
    return Coffee;
  }

  if (
    normalizedName.includes("household") ||
    normalizedName.includes("clean")
  ) {
    return SprayCan;
  }

  if (
    normalizedName.includes("personal care") ||
    normalizedName.includes("beauty")
  ) {
    return HeartPulse;
  }

  return ShoppingBasket;
}

function normalizeCategory(category, index) {
  const name = getCategoryName(category).trim();

  if (!name) return null;

  const defaultCategory = defaultCategories.find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );

  const Icon = getCategoryIcon(name);

  return {
    id: category?._id || category?.id || `${name}-${index}`,
    name,
    description:
      category?.description ||
      defaultCategory?.description ||
      `Explore our ${name.toLowerCase()} collection.`,
    items:
      category?.items ||
      category?.subcategories
        ?.map((item) =>
          typeof item === "string" ? item : item?.name
        )
        .filter(Boolean)
        .join(" • ") ||
      defaultCategory?.items ||
      "Explore products in this category",
    Icon,
  };
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/categories`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load categories.");
        }

        const result = await response.json();

        if (result?.success === false) {
          throw new Error(
            result.message || "Unable to load categories."
          );
        }

        const categoryList = Array.isArray(result)
          ? result
          : Array.isArray(result?.categories)
          ? result.categories
          : Array.isArray(result?.data?.categories)
          ? result.data.categories
          : Array.isArray(result?.data)
          ? result.data
          : [];

        const activeCategories = categoryList
          .filter((category) => {
            if (typeof category === "string") {
              return category.trim().length > 0;
            }

            if (!category) return false;

            const status = String(
              category.status || "active"
            ).toLowerCase();

            return (
              status === "active" &&
              category.isActive !== false &&
              category.is_active !== false
            );
          })
          .map(normalizeCategory)
          .filter(Boolean);

        setCategories(activeCategories);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Categories API error:", err);
        setError(
          "We couldn't load categories from the server. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  return (
    <main className="categories-page">
      <div className="categories-container">
        <div className="categories-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="categories-breadcrumb">
            Home / Categories
          </p>

          <span className="categories-eyebrow">
            SHOP BY CATEGORY
          </span>

          <h1>Everything you need, in one place.</h1>

          <p className="categories-intro">
            Browse fresh groceries and everyday essentials
            by category and find what you need faster.
          </p>
        </div>

        {loading && (
          <div className="categories-loading">
            Loading categories...
          </div>
        )}

        {!loading && error && (
          <div className="categories-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="categories-empty">
            <ShoppingBasket size={36} />
            <h2>No categories available</h2>
            <p>Please check back later for available categories.</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="categories-grid">
            {categories.map((category) => {
              const Icon =
                category.Icon ||
                iconComponents.shoppingbasket;

              return (
                <Link
                  to={`/shop?category=${encodeURIComponent(
                    category.name
                  )}`}
                  key={category.id}
                  className="category-page-card"
                >
                  <div className="category-page-top">
                    <div className="category-page-icon">
                      <Icon size={30} strokeWidth={1.8} />
                    </div>

                    <ArrowRight
                      className="category-page-arrow"
                      size={20}
                    />
                  </div>

                  <div className="category-page-content">
                    <h2>{category.name}</h2>
                    <p>{category.description}</p>
                    <span>{category.items}</span>
                  </div>

                  <div className="category-page-footer">
                    <strong>Shop Category</strong>
                    <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="categories-bottom">
          <div>
            <span>NEED SOMETHING ELSE?</span>
            <h2>Browse all products</h2>
            <p>
              Explore our complete grocery collection.
            </p>
          </div>

          <Link
            to="/shop"
            className="categories-shop-button"
          >
            View All Products
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Categories;
