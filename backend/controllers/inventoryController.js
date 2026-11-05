
const mongoose = require("mongoose");

const Inventory = require("../models/Inventory");
const InventoryHistory = require("../models/InventoryHistory");
const Product = require("../models/Product");

const {
    notifyInventoryStockChanged,
} = require("../utils/notificationsService");

// =====================================================
// HELPERS
// =====================================================

const isValidId = (id) =>
    typeof id === "string" &&
    mongoose.isValidObjectId(id);

const sendError = (
    res,
    error,
    fallback = "Inventory operation failed."
) => {
    console.error("Inventory error:", error);

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message:
                "Inventory already exists for this product variant.",
        });
    }

    if (
        error.name === "ValidationError" ||
        error.name === "CastError"
    ) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    return res.status(500).json({
        success: false,
        message: fallback,
    });
};

const getVariantFromProduct = (product, variantId) => {
    if (!product || !Array.isArray(product.variants)) {
        return null;
    }

    return product.variants.id(variantId);
};

const calculateAvailable = (inventory) =>
    Math.max(
        0,
        Number(inventory.stockQuantity) -
        Number(inventory.reservedQuantity || 0)
    );

const getStockStatus = (available, threshold) => {
    if (available <= 0) return "out_of_stock";

    if (available <= threshold) return "low_stock";

    return "in_stock";
};

// Notifications are outside the transaction.
// A notification failure must not turn a committed inventory
// operation into an apparent API failure.

const sendInventoryNotification = async ({
    productId,
    productName,
    previousAvailable,
    newAvailable,
    threshold,
}) => {
    try {
        await notifyInventoryStockChanged({
            productId,
            productName,
            previousAvailable,
            newAvailable,
            threshold,
        });
    } catch (error) {
        console.error(
            "Inventory notification failed:",
            error
        );
    }
};

// =====================================================
// GET /api/inventory
// Admin: inventory list, one record per variant.
// =====================================================

const getInventoryList = async (req, res) => {
    try {
        const filter = {};

        if (req.query.lowStock === "true") {
            filter.$expr = {
                $lte: [
                    {
                        $subtract: [
                            "$stockQuantity",
                            "$reservedQuantity",
                        ],
                    },
                    "$lowStockThreshold",
                ],
            };
        }

        if (req.query.productId) {
            if (!isValidId(req.query.productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID.",
                });
            }

            filter.product = req.query.productId;
        }

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            100,
            Math.max(
                1,
                parseInt(req.query.limit, 10) || 20
            )
        );

        const [inventory, total] = await Promise.all([
            Inventory.find(filter)
                .populate("product", "name sku status")
                .populate("updatedBy", "name email")
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean({ virtuals: true }),

            Inventory.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            count: inventory.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            inventory,
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to retrieve inventory."
        );
    }
};

// =====================================================
// GET /api/inventory/product/:productId
// Public: inventory for every product variant.
// =====================================================

const getInventoryByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!isValidId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const product = await Product.findOne({
            _id: productId,
            status: "active",
        }).select("_id name sku variants status");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Active product not found.",
            });
        }

        const inventories = await Inventory.find({
            product: productId,
        }).lean();

        const inventoryMap = new Map(
            inventories.map((item) => [
                String(item.variantId),
                item,
            ])
        );

        const variants = (product.variants || []).map(
            (variant) => {
                const inventory = inventoryMap.get(
                    String(variant._id)
                );

                const stockQuantity = inventory
                    ? Number(inventory.stockQuantity)
                    : 0;

                const reservedQuantity = inventory
                    ? Number(inventory.reservedQuantity || 0)
                    : 0;

                const availableQuantity = Math.max(
                    0,
                    stockQuantity - reservedQuantity
                );

                const threshold = inventory
                    ? Number(inventory.lowStockThreshold)
                    : 10;

                return {
                    variantId: variant._id,
                    variantLabel: variant.label,
                    sku: variant.sku || "",
                    stockQuantity,
                    reservedQuantity,
                    availableQuantity,
                    lowStockThreshold: threshold,
                    stockStatus: getStockStatus(
                        availableQuantity,
                        threshold
                    ),
                    inventoryId: inventory
                        ? inventory._id
                        : null,
                };
            }
        );

        return res.status(200).json({
            success: true,
            product: {
                id: product._id,
                name: product.name,
                sku: product.sku,
            },
            count: variants.length,
            variants,
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to retrieve product variant inventory."
        );
    }
};

// =====================================================
// POST /api/inventory
// Admin: initialize inventory for one variant.
// =====================================================

const createInventory = async (req, res) => {
    let session;

    try {
        const {
            productId,
            variantId,
            stockQuantity,
            lowStockThreshold,
            reason,
        } = req.body;

        if (!isValidId(productId)) {
            return res.status(400).json({
                success: false,
                message: "A valid productId is required.",
            });
        }

        if (!isValidId(variantId)) {
            return res.status(400).json({
                success: false,
                message: "A valid variantId is required.",
            });
        }

        const quantity = Number(stockQuantity);

        const threshold =
            lowStockThreshold === undefined
                ? 10
                : Number(lowStockThreshold);

        if (
            stockQuantity === undefined ||
            !Number.isFinite(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "stockQuantity must be a non-negative number.",
            });
        }

        if (
            !Number.isFinite(threshold) ||
            threshold < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "lowStockThreshold must be a non-negative number.",
            });
        }

        if (
            typeof reason !== "string" ||
            !reason.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "A reason is required for initial stock.",
            });
        }

        session = await mongoose.startSession();

        let createdInventory = null;
        let productName = "";

        await session.withTransaction(async () => {
            const product = await Product.findById(
                productId
            ).session(session);

            if (!product) {
                const error = new Error("Product not found.");
                error.statusCode = 404;
                throw error;
            }

            productName = product.name;

            const variant = getVariantFromProduct(
                product,
                variantId
            );

            if (!variant) {
                const error = new Error(
                    "The selected variant does not belong to this product."
                );

                error.statusCode = 404;
                throw error;
            }

            const existingInventory =
                await Inventory.findOne({
                    product: productId,
                    variantId,
                }).session(session);

            if (existingInventory) {
                const error = new Error(
                    "Inventory already exists for this product variant."
                );

                error.statusCode = 409;
                throw error;
            }

            const [inventory] = await Inventory.create(
                [
                    {
                        product: productId,
                        variantId,
                        variantLabel: variant.label,
                        stockQuantity: quantity,
                        reservedQuantity: 0,
                        lowStockThreshold: threshold,
                        updatedBy: req.admin?._id || null,
                    },
                ],
                { session }
            );

            // Compatibility synchronization.
            variant.stockQuantity = quantity;

            await product.save({ session });

            await InventoryHistory.create(
                [
                    {
                        product: product._id,
                        inventory: inventory._id,
                        variantId: variant._id,
                        variantLabel: variant.label,
                        changeType: "initial_stock",
                        quantityChange: quantity,
                        previousStock: 0,
                        newStock: quantity,
                        reason: reason.trim(),
                        performedBy: req.admin?._id || null,
                    },
                ],
                { session }
            );

            createdInventory = inventory;
        });

        await sendInventoryNotification({
            productId,
            productName,
            previousAvailable: null,
            newAvailable: quantity,
            threshold,
        });

        return res.status(201).json({
            success: true,
            message:
                "Variant inventory initialized successfully.",
            inventory: createdInventory,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        return sendError(
            res,
            error,
            "Unable to initialize variant inventory."
        );
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

// =====================================================
// PATCH /api/inventory/:productId/adjust
// Admin: adjust stock of a specific variant.
// =====================================================

const adjustInventory = async (req, res) => {
    let session;

    try {
        const { productId } = req.params;

        const {
            variantId,
            quantityChange,
            reason,
            changeType,
        } = req.body;

        if (!isValidId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        if (!isValidId(variantId)) {
            return res.status(400).json({
                success: false,
                message: "A valid variantId is required.",
            });
        }

        if (
            typeof quantityChange !== "number" ||
            !Number.isFinite(quantityChange) ||
            quantityChange === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "quantityChange must be a non-zero number.",
            });
        }

        if (
            typeof reason !== "string" ||
            !reason.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "A reason is required for stock adjustment.",
            });
        }

        if (
            changeType !== undefined &&
            ![
                "stock_in",
                "stock_out",
                "adjustment",
            ].includes(changeType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid changeType.",
            });
        }

        if (
            changeType === "stock_in" &&
            quantityChange < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "stock_in requires a positive quantityChange.",
            });
        }

        if (
            changeType === "stock_out" &&
            quantityChange > 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "stock_out requires a negative quantityChange.",
            });
        }

        session = await mongoose.startSession();

        let result = null;

        await session.withTransaction(async () => {
            const product = await Product.findById(
                productId
            ).session(session);

            if (!product) {
                const error = new Error("Product not found.");
                error.statusCode = 404;
                throw error;
            }

            const variant = getVariantFromProduct(
                product,
                variantId
            );

            if (!variant) {
                const error = new Error(
                    "The selected variant does not belong to this product."
                );

                error.statusCode = 404;
                throw error;
            }

            const inventory = await Inventory.findOne({
                product: productId,
                variantId,
            }).session(session);

            if (!inventory) {
                const error = new Error(
                    "Inventory not found for this variant. Initialize its stock first."
                );

                error.statusCode = 404;
                throw error;
            }

            const previousStock = Number(
                inventory.stockQuantity
            );

            const previousAvailable =
                calculateAvailable(inventory);

            const newStock =
                previousStock + quantityChange;

            if (newStock < 0) {
                const error = new Error(
                    "Insufficient stock. Stock cannot become negative."
                );

                error.statusCode = 400;
                throw error;
            }

            if (
                newStock <
                Number(inventory.reservedQuantity)
            ) {
                const error = new Error(
                    "Stock cannot be reduced below the reserved quantity."
                );

                error.statusCode = 400;
                throw error;
            }

            const resolvedChangeType =
                changeType ||
                (
                    quantityChange > 0
                        ? "stock_in"
                        : "stock_out"
                );

            inventory.stockQuantity = newStock;
            inventory.variantLabel = variant.label;
            inventory.updatedBy = req.admin?._id || null;

            await inventory.save({ session });

            // Keep embedded variant stock synchronized.
            variant.stockQuantity = newStock;

            await product.save({ session });

            await InventoryHistory.create(
                [
                    {
                        product: product._id,
                        inventory: inventory._id,
                        variantId: variant._id,
                        variantLabel: variant.label,
                        changeType: resolvedChangeType,
                        quantityChange,
                        previousStock,
                        newStock,
                        reason: reason.trim(),
                        performedBy: req.admin?._id || null,
                    },
                ],
                { session }
            );

            result = {
                inventory,
                productName: product.name,
                previousAvailable,
                newAvailable: calculateAvailable(
                    inventory
                ),
                previousStock,
                quantityChange,
                newStock,
            };
        });

        await sendInventoryNotification({
            productId,
            productName: result.productName,
            previousAvailable: result.previousAvailable,
            newAvailable: result.newAvailable,
            threshold:
                result.inventory.lowStockThreshold,
        });

        return res.status(200).json({
            success: true,
            message:
                "Variant stock adjusted successfully.",
            inventory: result.inventory,
            stockChange: {
                previousStock: result.previousStock,
                quantityChange: result.quantityChange,
                newStock: result.newStock,
            },
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }

        return sendError(
            res,
            error,
            "Unable to adjust variant stock."
        );
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

// =====================================================
// GET /api/inventory/:productId/history
// Optional query: ?variantId=VARIANT_ID
// =====================================================

const getInventoryHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { variantId } = req.query;

        if (!isValidId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        if (
            variantId &&
            !isValidId(variantId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid variant ID.",
            });
        }

        const product = await Product.findById(
            productId
        ).select("_id name sku variants");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        const filter = {
            product: productId,
        };

        let selectedVariant = null;

        if (variantId) {
            selectedVariant = getVariantFromProduct(
                product,
                variantId
            );

            if (!selectedVariant) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Variant not found for this product.",
                });
            }

            filter.variantId = variantId;
        }

        const history = await InventoryHistory.find(
            filter
        )
            .populate("performedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            product: {
                id: product._id,
                name: product.name,
                sku: product.sku,
            },
            variant: selectedVariant
                ? {
                    id: selectedVariant._id,
                    label: selectedVariant.label,
                }
                : null,
            count: history.length,
            history,
        });
    } catch (error) {
        return sendError(
            res,
            error,
            "Unable to retrieve inventory history."
        );
    }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getInventoryList,
    getInventoryByProduct,
    createInventory,
    adjustInventory,
    getInventoryHistory,
};
