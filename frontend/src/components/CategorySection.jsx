
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
} from "lucide-react";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

// Used only if the category API request fails.
const defaultCategories = [
  { name: "Fruits & Vegetables", iconName: "apple" },
  { name: "Dairy & Bakery", iconName: "milk" },
  { name: "Staples", iconName: "wheat" },
  { name: "Snacks", iconName: "cookie" },
  { name: "Beverages", iconName: "coffee" },
  { name: "Household", iconName: "spray" },
  { name: "Personal Care", iconName: "heart" },
];

// --------------------------------------------------
// CATEGORY ICONS
// --------------------------------------------------

const iconComponents = {
  apple: Apple,
  milk: Milk,
  wheat: Wheat,
  cookie: Cookie,
  coffee: Coffee,
  spray: SprayCan,
  heart: HeartPulse,
  basket: ShoppingBasket,
};

// --------------------------------------------------
// GET CATEGORY NAME
// Supports different backend field names.
// --------------------------------------------------

function getCategoryName(category) {
  if (typeof category === "string") {
    return category.trim();
  }

  if (!category || typeof category !== "object") {
    return "";
  }

  const name =
    category.name ||
    category.categoryName ||
    category.title ||
    category.category_name ||
    "";

  return typeof name === "string" ? name.trim() : "";
}

// --------------------------------------------------
// SELECT ICON BASED ON CATEGORY NAME
// --------------------------------------------------

function getIconName(name) {
  const value = name.toLowerCase();

  if (
    value.includes("fruit") ||
    value.includes("vegetable")
  ) {
    return "apple";
  }

  if (
    value.includes("dairy") ||
    value.includes("bakery") ||
    value.includes("milk")
  ) {
    return "milk";
  }

  if (
    value.includes("staple") ||
    value.includes("grain") ||
    value.includes("rice")
  ) {
    return "wheat";
  }

  if (
    value.includes("snack") ||
    value.includes("biscuit") ||
    value.includes("cookie")
  ) {
    return "cookie";
  }

  if (
    value.includes("beverage") ||
    value.includes("drink") ||
    value.includes("juice")
  ) {
    return "coffee";
  }

  if (
    value.includes("household") ||
    value.includes("clean")
  ) {
    return "spray";
  }

  if (
    value.includes("personal care") ||
    value.includes("health") ||
    value.includes("beauty")
  ) {
    return "heart";
  }

  return "basket";
}

// --------------------------------------------------
// NORMALIZE CATEGORY API RESPONSE
// --------------------------------------------------

function normalizeCategories(categoryList) {
  if (!Array.isArray(categoryList)) {
    return [];
  }

  return categoryList
    .filter((category) => {
      if (typeof category === "string") {
        return category.trim().length > 0;
      }

      if (!category || typeof category !== "object") {
        return false;
      }

      const status = String(
        category.status || "active"
      ).toLowerCase();

      return (
        status === "active" &&
        category.isActive !== false &&
        category.is_active !== false
      );
    })
    .map((category, index) => {
      const name = getCategoryName(category);

      return {
        id:
          category?._id ||
          category?.id ||
          `${name}-${index}`,
        name,
        iconName: getIconName(name),
      };
    })
    .filter((category) => category.name);
}

// --------------------------------------------------
// CATEGORY SECTION COMPONENT
// --------------------------------------------------

function CategorySection() {
  const [categories, setCategories] = useState(
    defaultCategories
  );

  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);

  // --------------------------------------------------
  // FETCH CATEGORIES FROM BACKEND
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/categories`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Categories API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (result?.success === false) {
          throw new Error(
            result.message || "Unable to load categories."
          );
        }

        // Support common backend response formats.
        const categoryList = Array.isArray(result)
          ? result
          : Array.isArray(result?.categories)
            ? result.categories
            : Array.isArray(result?.data?.categories)
              ? result.data.categories
              : Array.isArray(result?.data)
                ? result.data
                : [];

        const normalizedCategories =
          normalizeCategories(categoryList);

        if (!cancelled) {
          // A successful empty response means no active
          // categories are currently available.
          setCategories(normalizedCategories);
          setApiFailed(false);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Unable to load categories:",
            error.message
          );

          if (!cancelled) {
            // Fallback only when the API request fails.
            setCategories(defaultCategories);
            setApiFailed(true);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <section className="category-section">

      {/* SECTION HEADING */}
      <div className="section-heading category-heading">
        <div>
          <p>SHOP BY CATEGORY</p>
          <h2>Shop your everyday essentials</h2>
        </div>

        <Link
          to="/categories"
          className="view-all-link"
        >
          View all categories →
        </Link>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="category-grid">
          <p>Loading categories...</p>
        </div>
      ) : categories.length > 0 ? (

        /* CATEGORY CARDS */
        <div className="category-grid">
          {categories.map((category) => {
            const Icon =
              iconComponents[category.iconName] ||
              ShoppingBasket;

            return (
              <Link
                to={`/shop?category=${encodeURIComponent(
                  category.name
                )}`}
                className="category-card"
                key={category.id}
              >
                <div className="category-icon">
                  <Icon size={28} />
                </div>

                <h3>{category.name}</h3>

                <span>Explore</span>
              </Link>
            );
          })}
        </div>
      ) : (

        /* EMPTY STATE */
        <div className="category-empty-state">
          <ShoppingBasket size={32} />

          <p>
            No categories are currently available.
          </p>

          <Link to="/shop">
            Explore products
          </Link>
        </div>
      )}

      {/* API FALLBACK INFORMATION */}
      {apiFailed && (
        <p className="category-fallback-message">
          Showing default categories because the category
          service is currently unavailable.
        </p>
      )}

    </section>
  );
}

export default CategorySection;
