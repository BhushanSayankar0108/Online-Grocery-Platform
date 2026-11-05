
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

const MAX_QUANTITY = 10000;

function parseQuantity(value) {
  const quantity = Number(value);

  if (
    value === undefined ||
    value === null ||
    value === "" ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > MAX_QUANTITY
  ) {
    return null;
  }

  return quantity;
}

function sameId(first, second) {
  return String(first || "") === String(second || "");
}

function findVariant(product, variantId) {
  if (!variantId) return null;

  return product.variants.id(variantId) || null;
}

function getItemPricing(product, variantId) {
  const variant = findVariant(product, variantId);

  if (variantId && !variant) {
    return null;
  }

  if (product.variants.length > 0 && !variantId) {
    return null;
  }

  return {
    variant,
    unitPrice: variant
      ? variant.sellingPrice
      : product.sellingPrice,
    mrp: variant ? variant.mrp : product.mrp,
    label: variant ? variant.label : null,
    quantityValue: variant
      ? variant.quantityValue
      : product.quantityValue,
    quantityUnit: variant
      ? variant.quantityUnit
      : product.quantityUnit,
  };
}

async function getAvailableStock(productId) {
  const inventory = await Inventory.findOne({
    product: productId,
  });

  if (!inventory) return null;

  return Math.max(
    0,
    inventory.stockQuantity - inventory.reservedQuantity
  );
}

function getProductCartQuantity(cart, productId, excludedItemId = null) {
  return cart.items.reduce((total, item) => {
    if (!sameId(item.product, productId)) return total;

    if (
      excludedItemId &&
      sameId(item._id, excludedItemId)
    ) {
      return total;
    }

    return total + item.quantity;
  }, 0);
}

function buildCartResponse(cart) {
  const items = cart.items
    .filter(
      (item) =>
        item.product &&
        item.product.status === "active"
    )
    .map((item) => {
      const product = item.product;
      const pricing = getItemPricing(
        product,
        item.variantId
      );

      // Preserve legacy cart rows if a product's variant was
      // removed after the item was added.
      const unitPrice = pricing
        ? pricing.unitPrice
        : product.sellingPrice;

      return {
        cartItemId: item._id,
        product,
        variantId: item.variantId || null,
        variant: pricing?.variant
          ? {
              id: pricing.variant._id,
              label: pricing.label,
              quantityValue: pricing.quantityValue,
              quantityUnit: pricing.quantityUnit,
              mrp: pricing.mrp,
              sellingPrice: pricing.unitPrice,
              stockQuantity: pricing.variant.stockQuantity,
            }
          : null,
        quantity: item.quantity,
        unitPrice,
        lineTotal: Number(
          (unitPrice * item.quantity).toFixed(2)
        ),
      };
    });

  const subtotal = Number(
    items
      .reduce((sum, item) => sum + item.lineTotal, 0)
      .toFixed(2)
  );

  return {
    id: cart._id,
    customer: cart.customer,
    items,
    itemCount: items.length,
    totalQuantity: items.reduce(
      (sum, item) => sum + item.quantity,
      0
    ),
    subtotal,
  };
}

async function loadCart(customerId) {
  let cart = await Cart.findOne({
    customer: customerId,
  });

  if (!cart) {
    try {
      cart = await Cart.create({
        customer: customerId,
        items: [],
      });
    } catch (error) {
      // Handle a simultaneous request creating the same cart.
      if (error.code !== 11000) throw error;

      cart = await Cart.findOne({
        customer: customerId,
      });

      if (!cart) throw error;
    }
  }

  await cart.populate({
    path: "items.product",
    select:
      "name sku images unit quantityValue quantityUnit mrp sellingPrice status variants",
  });

  return cart;
}

/* =========================================================
   GET CUSTOMER CART
========================================================= */

const getCart = async (req, res) => {
  try {
    const cart = await loadCart(req.customer._id);

    return res.status(200).json({
      success: true,
      cart: buildCartResponse(cart),
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve cart.",
    });
  }
};

/* =========================================================
   ADD ITEM TO CART
   Body: { productId, variantId?, quantity? }
========================================================= */

const addToCart = async (req, res) => {
  try {
    const { productId, variantId = null } = req.body || {};
    const quantity = parseQuantity(
      req.body?.quantity ?? 1
    );

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "A valid productId is required.",
      });
    }

    if (quantity === null) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be positive and no greater than 10000.",
      });
    }

    if (
      variantId !== null &&
      !mongoose.isValidObjectId(variantId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product variant ID.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Active product not found.",
      });
    }

    const pricing = getItemPricing(product, variantId);

    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: product.variants.length
          ? "Select a valid product variant."
          : "The selected product variant was not found.",
      });
    }

    const availableStock = await getAvailableStock(
      product._id
    );

    if (availableStock === null) {
      return res.status(409).json({
        success: false,
        message:
          "Inventory has not been initialized for this product.",
      });
    }

    const cart = await Cart.findOne({
      customer: req.customer._id,
    });

    const currentCart =
      cart || {
        items: [],
      };

    const existingItem = currentCart.items.find(
      (item) =>
        sameId(item.product, product._id) &&
        sameId(item.variantId, variantId)
    );

    const alreadyInCart = existingItem
      ? existingItem.quantity
      : 0;

    const requestedTotal = alreadyInCart + quantity;

    const otherProductQuantity = getProductCartQuantity(
      currentCart,
      product._id
    );

    if (
      otherProductQuantity + quantity >
      availableStock
    ) {
      return res.status(409).json({
        success: false,
        message: "Requested quantity exceeds available stock.",
        availableQuantity: Math.max(
          0,
          availableStock - otherProductQuantity
        ),
      });
    }

    if (
      pricing.variant &&
      requestedTotal > pricing.variant.stockQuantity
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Requested quantity exceeds this variant's available stock.",
        availableQuantity: Math.max(
          0,
          pricing.variant.stockQuantity - alreadyInCart
        ),
      });
    }

    const customerCart =
      cart ||
      new Cart({
        customer: req.customer._id,
        items: [],
      });

    const customerExistingItem =
      customerCart.items.find(
        (item) =>
          sameId(item.product, product._id) &&
          sameId(item.variantId, variantId)
      );

    if (customerExistingItem) {
      customerExistingItem.quantity += quantity;
    } else {
      customerCart.items.push({
        product: product._id,
        variantId: pricing.variant
          ? pricing.variant._id
          : null,
        quantity,
      });
    }

    await customerCart.save();

    const updatedCart = await loadCart(
      req.customer._id
    );

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully.",
      cart: buildCartResponse(updatedCart),
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add product to cart.",
    });
  }
};

/* =========================================================
   UPDATE CART ITEM QUANTITY
========================================================= */

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const quantity = parseQuantity(
      req.body?.quantity
    );

    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID.",
      });
    }

    if (quantity === null) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be positive and no greater than 10000.",
      });
    }

    const cart = await Cart.findOne({
      customer: req.customer._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    const product = await Product.findOne({
      _id: item.product,
      status: "active",
    });

    if (!product) {
      return res.status(409).json({
        success: false,
        message: "This product is no longer available.",
      });
    }

    const pricing = getItemPricing(
      product,
      item.variantId
    );

    if (!pricing) {
      return res.status(409).json({
        success: false,
        message:
          "This product variant is no longer available. Remove it from your cart.",
      });
    }

    const availableStock = await getAvailableStock(
      product._id
    );

    if (availableStock === null) {
      return res.status(409).json({
        success: false,
        message:
          "Inventory is unavailable for this product.",
      });
    }

    const otherProductQuantity = getProductCartQuantity(
      cart,
      product._id,
      item._id
    );

    if (otherProductQuantity + quantity > availableStock) {
      return res.status(409).json({
        success: false,
        message: "Requested quantity exceeds available stock.",
        availableQuantity: Math.max(
          0,
          availableStock - otherProductQuantity
        ),
      });
    }

    if (
      pricing.variant &&
      quantity > pricing.variant.stockQuantity
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Requested quantity exceeds this variant's available stock.",
        availableQuantity: pricing.variant.stockQuantity,
      });
    }

    item.quantity = quantity;

    await cart.save();

    const updatedCart = await loadCart(
      req.customer._id
    );

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully.",
      cart: buildCartResponse(updatedCart),
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update cart item.",
    });
  }
};

/* =========================================================
   REMOVE ITEM FROM CART
========================================================= */

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID.",
      });
    }

    const cart = await Cart.findOne({
      customer: req.customer._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    item.deleteOne();
    await cart.save();

    const updatedCart = await loadCart(
      req.customer._id
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully.",
      cart: buildCartResponse(updatedCart),
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove cart item.",
    });
  }
};

/* =========================================================
   CLEAR CART
========================================================= */

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      customer: req.customer._id,
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty.",
        cart: {
          items: [],
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
        },
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      cart: buildCartResponse(cart),
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to clear cart.",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
