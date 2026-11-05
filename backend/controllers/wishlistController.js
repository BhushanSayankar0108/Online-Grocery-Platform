const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

function sameId(first, second) {
    return String(first || "") === String(second || "");
}

function findVariant(product, variantId) {
    if (!variantId) return null;

    return product.variants.id(variantId) || null;
}

function buildWishlistResponse(wishlist) {
    const items = wishlist.items
        .filter((item) => {
            return (
                item.product &&
                item.product.status === "active"
            );
        })
        .map((item) => {
            const product = item.product;
            const variant = item.variantId
                ? findVariant(product, item.variantId)
                : null;

            return {
                itemId: item._id,
                productId: product._id,
                variantId: item.variantId || null,

                product,

                variant: variant
                    ? {
                        id: variant._id,
                        label: variant.label,
                        quantityValue: variant.quantityValue,
                        quantityUnit: variant.quantityUnit,
                        mrp: variant.mrp,
                        sellingPrice: variant.sellingPrice,
                        stockQuantity: variant.stockQuantity,
                        status: variant.status,
                    }
                    : null,

                addedAt: item.addedAt,
            };
        });

    return {
        id: wishlist._id,
        customer: wishlist.customer,
        items,
        itemCount: items.length,
    };
}

async function loadWishlist(customerId) {
    let wishlist = await Wishlist.findOne({
        customer: customerId,
    });

    if (!wishlist) {
        try {
            wishlist = await Wishlist.create({
                customer: customerId,
                items: [],
            });
        } catch (error) {
            // Handle simultaneous wishlist creation.
            if (error.code !== 11000) {
                throw error;
            }

            wishlist = await Wishlist.findOne({
                customer: customerId,
            });

            if (!wishlist) throw error;
        }
    }

    await wishlist.populate({
        path: "items.product",
        select:
            "name slug description sku images brand unit quantityValue quantityUnit mrp sellingPrice discountPercentage status variants",
    });

    return wishlist;
}

/* =====================================================
   GET CUSTOMER WISHLIST
   GET /api/wishlist
===================================================== */

const getWishlist = async (req, res) => {
    try {
        const wishlist = await loadWishlist(
            req.customer._id
        );

        return res.status(200).json({
            success: true,
            wishlist: buildWishlistResponse(wishlist),
        });
    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve wishlist.",
        });
    }
};

/* =====================================================
   ADD PRODUCT TO WISHLIST
   POST /api/wishlist
   Body: { productId, variantId? }
===================================================== */

const addToWishlist = async (req, res) => {
    try {
        const {
            productId,
            variantId = null,
        } = req.body || {};

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "A valid productId is required.",
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

        let selectedVariant = null;

        if (variantId) {
            selectedVariant = findVariant(
                product,
                variantId
            );

            if (
                !selectedVariant ||
                selectedVariant.status !== "active"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Selected product variant is unavailable.",
                });
            }
        } else if (product.variants.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please select a product variant.",
            });
        }

        const wishlist = await Wishlist.findOneAndUpdate(
            { customer: req.customer._id },
            {
                $setOnInsert: {
                    customer: req.customer._id,
                    items: [],
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        const alreadyExists = wishlist.items.some(
            (item) =>
                sameId(item.product, product._id) &&
                sameId(item.variantId, selectedVariant?._id || null)
        );

        if (alreadyExists) {
            const updatedWishlist = await loadWishlist(
                req.customer._id
            );

            return res.status(200).json({
                success: true,
                message: "Product is already in your wishlist.",
                wishlist: buildWishlistResponse(updatedWishlist),
            });
        }

        wishlist.items.push({
            product: product._id,
            variantId: selectedVariant
                ? selectedVariant._id
                : null,
        });

        await wishlist.save();

        const updatedWishlist = await loadWishlist(
            req.customer._id
        );

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist successfully.",
            wishlist: buildWishlistResponse(updatedWishlist),
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to add product to wishlist.",
        });
    }
};

/* =====================================================
   REMOVE PRODUCT FROM WISHLIST
   DELETE /api/wishlist/:itemId
===================================================== */

const removeFromWishlist = async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!mongoose.isValidObjectId(itemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid wishlist item ID.",
            });
        }

        const wishlist = await Wishlist.findOne({
            customer: req.customer._id,
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found.",
            });
        }

        const item = wishlist.items.id(itemId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Wishlist item not found.",
            });
        }

        item.deleteOne();

        await wishlist.save();

        const updatedWishlist = await loadWishlist(
            req.customer._id
        );

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully.",
            wishlist: buildWishlistResponse(updatedWishlist),
        });
    } catch (error) {
        console.error("Remove from wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to remove product from wishlist.",
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};