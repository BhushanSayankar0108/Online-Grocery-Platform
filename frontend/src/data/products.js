
const API_BASE_URL = "http://localhost:5000/api/products";

/**
 * Converts a backend product into the structure used by frontend components.
 * Supports products with multiple sizes, such as 250 g, 500 g and 1 kg.
 */
export const normalizeProduct = (product) => {
  if (!product) return null;

  const images = Array.isArray(product.images)
    ? product.images
        .map((image) => {
          if (typeof image === "string") return image;
          return image?.url || image?.imageUrl || image?.path || "";
        })
        .filter(Boolean)
    : [];

  const variants = Array.isArray(product.variants)
    ? product.variants
        .filter((variant) => variant.status !== "inactive")
        .map((variant) => ({
          id: String(variant._id || variant.id || ""),
          label:
            variant.label ||
            `${variant.quantityValue ?? ""} ${variant.quantityUnit ?? ""}`.trim(),
          quantityValue: Number(variant.quantityValue || 0),
          quantityUnit: variant.quantityUnit || "",
          price: Number(variant.sellingPrice ?? variant.price ?? 0),
          mrp: Number(variant.mrp ?? variant.sellingPrice ?? variant.price ?? 0),
          stockQuantity: Number(variant.stockQuantity ?? 0),
          sku: variant.sku || "",
        }))
    : [];

  const category =
    typeof product.category === "object"
      ? product.category?.name || ""
      : product.category || "";

  const basePrice = Number(product.sellingPrice ?? product.price ?? 0);
  const baseMrp = Number(product.mrp ?? basePrice);

  return {
    ...product,
    id: String(product._id || product.id || ""),
    name: product.name || "",
    description: product.description || "",
    category,
    image: images[0] || product.image || "",
    images,
    quantity: `${product.quantityValue ?? 1} ${product.quantityUnit || product.unit || "piece"}`,
    price: basePrice,
    mrp: baseMrp,
    discount:
      baseMrp > 0
        ? Math.round(((baseMrp - basePrice) / baseMrp) * 100)
        : 0,
    stockQuantity: Number(product.stockQuantity ?? 0),
    variants,
    createdAt: product.createdAt || "",
  };
};

/**
 * Fetches active products from the backend.
 * The backend response is expected to contain { products: [...] }.
 */
export const fetchProducts = async () => {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error(`Unable to load products (${response.status}).`);
  }

  const result = await response.json();

  const records = Array.isArray(result)
    ? result
    : Array.isArray(result.products)
      ? result.products
      : Array.isArray(result.data)
        ? result.data
        : [];

  return records.map(normalizeProduct).filter(Boolean);
};

/**
 * Fetches one active product by MongoDB ID.
 */
export const fetchProductById = async (id) => {
  if (!id) throw new Error("A product ID is required.");

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Product not found."
        : `Unable to load product (${response.status}).`
    );
  }

  const result = await response.json();
  const product = result.product || result.data || result;

  return normalizeProduct(product);
};

export default fetchProducts;
