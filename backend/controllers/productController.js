
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Inventory = require("../models/Inventory");
const InventoryHistory = require("../models/InventoryHistory");

// =========================================================
// HELPERS
// =========================================================

const isValidId = (id) =>
    typeof id === "string" &&
    mongoose.isValidObjectId(id);

const createControllerError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const validateVariants = (variants) => {
    if (variants === undefined) return null;

    if (!Array.isArray(variants)) {
        return "Variants must be an array.";
    }

    const labels = new Set();

    for (const variant of variants) {
        if (
            !variant ||
            typeof variant.label !== "string" ||
            !variant.label.trim()
        ) {
            return "Every variant must have a size label.";
        }

        const label = variant.label.trim().toLowerCase();

        if (labels.has(label)) {
            return "Variant size labels must be unique.";
        }

        labels.add(label);

        const quantityValue = Number(variant.quantityValue);
        const mrp = Number(variant.mrp);
        const sellingPrice = Number(variant.sellingPrice);
        const stockQuantity = Number(variant.stockQuantity ?? 0);

        if (
            !Number.isFinite(quantityValue) ||
            quantityValue <= 0 ||
            !Number.isFinite(mrp) ||
            mrp < 0 ||
            !Number.isFinite(sellingPrice) ||
            sellingPrice < 0 ||
            sellingPrice > mrp ||
            !Number.isFinite(stockQuantity) ||
            stockQuantity < 0 ||
            typeof variant.quantityUnit !== "string" ||
            !variant.quantityUnit.trim()
        ) {
            return `Invalid price, size, unit, or stock for ${variant.label}.`;
        }

        if (
            variant.status !== undefined &&
            !["active", "inactive"].includes(variant.status)
        ) {
            return `Invalid status for variant ${variant.label}.`;
        }

        if (
            variant.sku !== undefined &&
            typeof variant.sku !== "string"
        ) {
            return `Invalid SKU for variant ${variant.label}.`;
        }

        if (
            variant._id !== undefined &&
            !mongoose.isValidObjectId(variant._id)
        ) {
            return `Invalid variant ID for ${variant.label}.`;
        }
    }

    return null;
};

const validateReferences = async (
    categoryId,
    subCategoryId,
    session = null
) => {
    if (
        !mongoose.isValidObjectId(categoryId) ||
        !mongoose.isValidObjectId(subCategoryId)
    ) {
        return "Valid category and subcategory IDs are required.";
    }

    let categoryQuery = Category.findById(categoryId);
    let subCategoryQuery = SubCategory.findById(subCategoryId);

    if (session) {
        categoryQuery = categoryQuery.session(session);
        subCategoryQuery = subCategoryQuery.session(session);
    }

    const [category, subCategory] = await Promise.all([
        categoryQuery,
        subCategoryQuery,
    ]);

    if (!category) return "Category not found.";

    if (category.status !== "active") {
        return "Products cannot be assigned to an inactive category.";
    }

    if (!subCategory) return "Subcategory not found.";

    if (subCategory.status !== "active") {
        return "Products cannot be assigned to an inactive subcategory.";
    }

    if (
        String(subCategory.category) !==
        String(category._id)
    ) {
        return "The subcategory does not belong to the selected category.";
    }

    return null;
};

const populateProductReferences = (query) =>
    query
        .populate("category", "name")
        .populate("subCategory", "name");

// =========================================================
// DEFAULT VARIANT
// =========================================================

const createDefaultVariant = (data) => {
    const quantityValue = Number(data.quantityValue || 1);
    const quantityUnit = String(
        data.quantityUnit || "piece"
    ).trim();

    const unit = String(data.unit || "piece").trim();

    const label = `${quantityValue} ${quantityUnit}`;

    return {
        label,
        quantityValue,
        quantityUnit,
        mrp: Number(data.mrp),
        sellingPrice: Number(data.sellingPrice),
        stockQuantity: Number(data.stockQuantity ?? 0),
        sku: data.sku || "",
        status: "active",
    };
};

// =========================================================
// INVENTORY HELPERS
// =========================================================

const createVariantInventory = async ({
    product,
    variant,
    session,
    performedBy = null,
    reason = "Initial product stock",
}) => {
    const stockQuantity = Number(
        variant.stockQuantity ?? 0
    );

    const threshold = Number(
        product.lowStockThreshold ?? 10
    );

    if (
        !Number.isFinite(stockQuantity) ||
        stockQuantity < 0 ||
        !Number.isFinite(threshold) ||
        threshold < 0
    ) {
        throw new Error(
            `Invalid inventory configuration for ${product.name} - ${variant.label}.`
        );
    }

    const existingInventory = await Inventory.findOne({
        product: product._id,
        variantId: variant._id,
    }).session(session);

    if (existingInventory) {
        throw createControllerError(
            `Inventory already exists for variant ${variant.label}.`,
            409
        );
    }

    const [inventory] = await Inventory.create(
        [
            {
                product: product._id,
                variantId: variant._id,
                variantLabel: variant.label,
                stockQuantity,
                reservedQuantity: 0,
                lowStockThreshold: threshold,
                updatedBy: performedBy,
            },
        ],
        { session }
    );

    await InventoryHistory.create(
        [
            {
                product: product._id,
                inventory: inventory._id,
                variantId: variant._id,
                variantLabel: variant.label,
                changeType: "initial_stock",
                quantityChange: stockQuantity,
                previousStock: 0,
                newStock: stockQuantity,
                reason,
                performedBy,
            },
        ],
        { session }
    );

    return inventory;
};

const synchronizeProductStock = (product) => {
    product.stockQuantity = (product.variants || []).reduce(
        (total, variant) =>
            total + Number(variant.stockQuantity || 0),
        0
    );
};

// =========================================================
// ERROR HANDLER
// =========================================================

const handleError = (res, error, operation) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    if (error?.code === 11000) {
        return res.status(409).json({
            success: false,
            message:
                "A product, variant, SKU or inventory record already exists.",
        });
    }

    if (
        error?.name === "ValidationError" ||
        error?.name === "CastError"
    ) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    console.error(`${operation}:`, error);

    return res.status(500).json({
        success: false,
        message:
            error.message ||
            "An unexpected product error occurred.",
    });
};

// =========================================================
// GET /api/products
// Public: active products with search, filters and pagination.
// =========================================================

const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            subCategory,
            brand,
            minPrice,
            maxPrice,
            sort = "newest",
            page = "1",
            limit = "12",
        } = req.query;

        const pageNumber = Number(page);
        const pageSize = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(pageSize) ||
            pageSize < 1 ||
            pageSize > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit.",
            });
        }

        const filter = { status: "active" };

        if (category) {
            if (!isValidId(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID.",
                });
            }

            filter.category = category;
        }

        if (subCategory) {
            if (!isValidId(subCategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subcategory ID.",
                });
            }

            filter.subCategory = subCategory;
        }

        if (brand?.trim()) {
            filter.brand = brand.trim();
        }

        if (search?.trim()) {
            filter.$text = {
                $search: search.trim(),
            };
        }

        if (
            minPrice !== undefined ||
            maxPrice !== undefined
        ) {
            const priceFilter = {};

            if (minPrice !== undefined) {
                priceFilter.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                priceFilter.$lte = Number(maxPrice);
            }

            if (
                Object.values(priceFilter).some(
                    (value) =>
                        !Number.isFinite(value) || value < 0
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Price filters must be valid non-negative numbers.",
                });
            }

            if (
                priceFilter.$gte !== undefined &&
                priceFilter.$lte !== undefined &&
                priceFilter.$gte > priceFilter.$lte
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Minimum price cannot exceed maximum price.",
                });
            }

            filter.$and = [
                ...(filter.$and || []),
                {
                    $or: [
                        { sellingPrice: priceFilter },
                        {
                            variants: {
                                $elemMatch: {
                                    sellingPrice: priceFilter,
                                    status: "active",
                                },
                            },
                        },
                    ],
                },
            ];
        }

        const sortOptions = {
            newest: { createdAt: -1 },
            priceLowToHigh: { sellingPrice: 1 },
            priceHighToLow: { sellingPrice: -1 },
            name: { name: 1 },
        };

        if (!sortOptions[sort]) {
            return res.status(400).json({
                success: false,
                message: "Unsupported sort option.",
            });
        }

        const [products, total] = await Promise.all([
            populateProductReferences(Product.find(filter))
                .sort(sortOptions[sort])
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize),

            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: pageNumber,
            pages: Math.ceil(total / pageSize),
            products,
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Get products error"
        );
    }
};

// =========================================================
// GET /api/products/admin/all
// Admin: active and inactive products.
// =========================================================

const getAdminProducts = async (req, res) => {
    try {
        const pageNumber = Number(req.query.page || 1);
        const pageSize = Number(req.query.limit || 100);

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(pageSize) ||
            pageSize < 1 ||
            pageSize > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit.",
            });
        }

        const [products, total] = await Promise.all([
            populateProductReferences(Product.find({}))
                .sort({ createdAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize),

            Product.countDocuments({}),
        ]);

        return res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: pageNumber,
            pages: Math.ceil(total / pageSize),
            products,
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Get admin products error"
        );
    }
};

// =========================================================
// GET /api/products/:id
// Public: one active product.
// =========================================================

const getProductById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const product = await populateProductReferences(
            Product.findOne({
                _id: req.params.id,
                status: "active",
            })
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        return res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Get product error"
        );
    }
};

// =========================================================
// POST /api/products
// Admin: create product and variant inventories.
// =========================================================

const createProduct = async (req, res) => {
    let session;

    try {
        const {
            name,
            description,
            sku,
            barcode,
            category,
            subCategory,
            brand,
            images,
            unit,
            quantityValue,
            quantityUnit,
            mrp,
            sellingPrice,
            gstPercentage,
            stockQuantity,
            lowStockThreshold,
            isFeatured,
            status,
            slug,
            variants,
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof sku !== "string" ||
            !sku.trim() ||
            !category ||
            !subCategory ||
            mrp === undefined ||
            sellingPrice === undefined ||
            quantityValue === undefined ||
            !unit ||
            !quantityUnit
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, SKU, category, subcategory, unit, quantity, quantity unit, MRP and selling price are required.",
            });
        }

        const variantError = validateVariants(variants);

        if (variantError) {
            return res.status(400).json({
                success: false,
                message: variantError,
            });
        }

        if (
            images !== undefined &&
            (
                !Array.isArray(images) ||
                !images.every(
                    (image) => typeof image === "string"
                )
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Images must be an array of strings.",
            });
        }

        const productStock = Number(stockQuantity ?? 0);

        if (
            !Number.isFinite(productStock) ||
            productStock < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Product stock must be a non-negative number.",
            });
        }

        const initialVariants =
            Array.isArray(variants) && variants.length > 0
                ? variants
                : [
                    createDefaultVariant({
                        name,
                        sku,
                        unit,
                        quantityValue,
                        quantityUnit,
                        mrp,
                        sellingPrice,
                        stockQuantity: productStock,
                    }),
                ];

        session = await mongoose.startSession();

        let createdProduct;

        await session.withTransaction(async () => {
            const referenceError = await validateReferences(
                String(category),
                String(subCategory),
                session
            );

            if (referenceError) {
                throw createControllerError(
                    referenceError,
                    400
                );
            }

            const product = new Product({
                name: name.trim(),
                description,
                sku: sku.trim().toUpperCase(),
                barcode,
                category,
                subCategory,
                brand,
                images,
                unit,
                quantityValue,
                quantityUnit,
                mrp,
                sellingPrice,
                gstPercentage,
                stockQuantity: 0,
                lowStockThreshold,
                isFeatured,
                status,
                slug: slug || undefined,
                variants: initialVariants,
            });

            synchronizeProductStock(product);

            await product.save({ session });

            for (const variant of product.variants) {
                await createVariantInventory({
                    product,
                    variant,
                    session,
                    performedBy: req.admin?._id || null,
                    reason: "Initial stock during product creation",
                });
            }

            synchronizeProductStock(product);

            await product.save({ session });

            createdProduct = product;
        });

        await createdProduct.populate(
            "category",
            "name"
        );

        await createdProduct.populate(
            "subCategory",
            "name"
        );

        return res.status(201).json({
            success: true,
            message:
                "Product and variant inventories created successfully.",
            product: createdProduct,
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Create product error"
        );
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

// =========================================================
// PUT /api/products/:id
// Admin: update product and safely synchronize variants.
// =========================================================

const updateProduct = async (req, res) => {
    let session;

    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const allowedFields = [
            "name",
            "description",
            "sku",
            "barcode",
            "category",
            "subCategory",
            "brand",
            "images",
            "unit",
            "quantityValue",
            "quantityUnit",
            "mrp",
            "sellingPrice",
            "gstPercentage",
            "lowStockThreshold",
            "isFeatured",
            "status",
            "slug",
        ];

        if (req.body.variants !== undefined) {
            const variantError = validateVariants(
                req.body.variants
            );

            if (variantError) {
                return res.status(400).json({
                    success: false,
                    message: variantError,
                });
            }
        }

        if (
            req.body.images !== undefined &&
            (
                !Array.isArray(req.body.images) ||
                !req.body.images.every(
                    (image) => typeof image === "string"
                )
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Images must be an array of strings.",
            });
        }

        session = await mongoose.startSession();

        let updatedProduct;

        await session.withTransaction(async () => {
            const product = await Product.findById(
                req.params.id
            ).session(session);

            if (!product) {
                throw createControllerError(
                    "Product not found.",
                    404
                );
            }

            const originalVariants = product.variants.map(
                (variant) => ({
                    id: String(variant._id),
                    label: variant.label,
                })
            );

            const oldVariantIds = new Set(
                originalVariants.map((variant) => variant.id)
            );

            const requestedVariants =
                req.body.variants !== undefined
                    ? req.body.variants
                    : product.variants.map((variant) =>
                        variant.toObject()
                    );

            const finalVariants =
                requestedVariants.length > 0
                    ? requestedVariants
                    : [
                        createDefaultVariant({
                            name: req.body.name || product.name,
                            sku: req.body.sku || product.sku,
                            unit: req.body.unit || product.unit,
                            quantityValue:
                                req.body.quantityValue ??
                                product.quantityValue,
                            quantityUnit:
                                req.body.quantityUnit ||
                                product.quantityUnit,
                            mrp: req.body.mrp ?? product.mrp,
                            sellingPrice:
                                req.body.sellingPrice ??
                                product.sellingPrice,
                            stockQuantity: 0,
                        }),
                    ];

            const incomingIds = new Set(
                finalVariants
                    .filter((variant) => variant._id)
                    .map((variant) => String(variant._id))
            );

            // Validate that supplied variant IDs belong to this product.
            for (const id of incomingIds) {
                if (!oldVariantIds.has(id)) {
                    throw createControllerError(
                        "An invalid or unrelated variant ID was supplied.",
                        400
                    );
                }
            }

            // Existing variants cannot be silently deleted.
            const removedVariantIds = [
                ...oldVariantIds,
            ].filter((id) => !incomingIds.has(id));

            for (const variantId of removedVariantIds) {
                const inventory = await Inventory.findOne({
                    product: product._id,
                    variantId,
                }).session(session);

                const historyExists =
                    inventory
                        ? await InventoryHistory.exists({
                            inventory: inventory._id,
                        }).session(session)
                        : false;

                if (
                    inventory &&
                    (
                        inventory.stockQuantity > 0 ||
                        inventory.reservedQuantity > 0
                    )
                ) {
                    throw createControllerError(
                        "A variant with available or reserved stock cannot be deleted. Set it to inactive instead.",
                        409
                    );
                }

                if (inventory || historyExists) {
                    throw createControllerError(
                        "This variant has inventory history and cannot be deleted. Set it to inactive instead.",
                        409
                    );
                }
            }

            // Apply normal product fields.
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    product[field] = req.body[field];
                }
            }

            if (req.body.sku !== undefined) {
                product.sku = String(
                    req.body.sku
                ).trim().toUpperCase();
            }

            if (
                req.body.category !== undefined ||
                req.body.subCategory !== undefined
            ) {
                const categoryId = String(
                    product.category?._id ||
                    product.category ||
                    ""
                );

                const subCategoryId = String(
                    product.subCategory?._id ||
                    product.subCategory ||
                    ""
                );

                const referenceError =
                    await validateReferences(
                        categoryId,
                        subCategoryId,
                        session
                    );

                if (referenceError) {
                    throw createControllerError(
                        referenceError,
                        400
                    );
                }
            }

            // Restore stock from Inventory for existing variants.
            const preparedVariants = [];

            for (const incoming of finalVariants) {
                const variantData = { ...incoming };

                if (variantData._id) {
                    const existingInventory =
                        await Inventory.findOne({
                            product: product._id,
                            variantId: variantData._id,
                        }).session(session);

                    if (existingInventory) {
                        // Inventory is authoritative.
                        variantData.stockQuantity =
                            existingInventory.stockQuantity;

                        existingInventory.variantLabel =
                            variantData.label.trim();

                        await existingInventory.save({
                            session,
                        });
                    }
                }

                preparedVariants.push(variantData);
            }

            product.variants = preparedVariants;

            // Every product must have at least one variant.
            if (!product.variants.length) {
                throw createControllerError(
                    "Every product must have at least one inventory-managed variant.",
                    400
                );
            }

            await product.save({ session });

            // Create inventory only for genuinely new variants.
            for (const variant of product.variants) {
                const isExistingVariant =
                    oldVariantIds.has(String(variant._id));

                if (!isExistingVariant) {
                    await createVariantInventory({
                        product,
                        variant,
                        session,
                        performedBy:
                            req.admin?._id || null,
                        reason:
                            "Initial stock during variant creation",
                    });
                }
            }

            // Recalculate legacy product stock from variant stocks.
            for (const variant of product.variants) {
                const inventory = await Inventory.findOne({
                    product: product._id,
                    variantId: variant._id,
                }).session(session);

                if (!inventory) {
                    throw createControllerError(
                        `Inventory is not initialized for variant ${variant.label}.`,
                        409
                    );
                }

                variant.stockQuantity =
                    inventory.stockQuantity;
            }

            synchronizeProductStock(product);

            await product.save({ session });

            updatedProduct = product;
        });

        await updatedProduct.populate(
            "category",
            "name"
        );

        await updatedProduct.populate(
            "subCategory",
            "name"
        );

        return res.status(200).json({
            success: true,
            message:
                "Product and variants updated successfully.",
            product: updatedProduct,
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Update product error"
        );
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

// =========================================================
// POST /api/products/admin/initialize-inventory
// Legacy endpoint intentionally disabled.
// Use the dedicated migration process instead.
// =========================================================

const initializeMissingInventory = async (req, res) => {
    return res.status(409).json({
        success: false,
        message:
            "Automatic product-level inventory initialization is disabled. Complete the variant inventory migration before initializing stock.",
    });
};

// =========================================================
// DELETE /api/products/:id
// Admin: safely delete product.
// =========================================================

const deleteProduct = async (req, res) => {
    let session;

    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        session = await mongoose.startSession();

        let deletedProduct;

        await session.withTransaction(async () => {
            const product = await Product.findById(
                req.params.id
            ).session(session);

            if (!product) {
                throw createControllerError(
                    "Product not found.",
                    404
                );
            }

            const inventories = await Inventory.find({
                product: product._id,
            }).session(session);

            for (const inventory of inventories) {
                if (
                    inventory.stockQuantity > 0 ||
                    inventory.reservedQuantity > 0
                ) {
                    throw createControllerError(
                        "This product has stock or reserved inventory and cannot be deleted.",
                        409
                    );
                }
            }

            const historyExists =
                await InventoryHistory.exists({
                    product: product._id,
                }).session(session);

            if (historyExists) {
                throw createControllerError(
                    "This product has inventory history and cannot be permanently deleted. Set its status to inactive instead.",
                    409
                );
            }

            if (inventories.length > 0) {
                await Inventory.deleteMany({
                    product: product._id,
                }).session(session);
            }

            await Product.deleteOne({
                _id: product._id,
            }).session(session);

            deletedProduct = product;
        });

        return res.status(200).json({
            success: true,
            message:
                "Product deleted successfully.",
            productId: deletedProduct._id,
        });
    } catch (error) {
        return handleError(
            res,
            error,
            "Delete product error"
        );
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    getProducts,
    getAdminProducts,
    getProductById,
    createProduct,
    updateProduct,
    initializeMissingInventory,
    deleteProduct,
};
