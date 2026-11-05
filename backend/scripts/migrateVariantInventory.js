
require("dotenv").config();

const mongoose = require("mongoose");

const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const InventoryHistory = require("../models/InventoryHistory");

const id = (value) => (value ? String(value) : null);

async function runDryRun() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from .env");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("\n======================================");
        console.log(" VARIANT INVENTORY MIGRATION DRY RUN");
        console.log("======================================");
        console.log("Database:", mongoose.connection.name);
        console.log("Mode: READ ONLY");
        console.log("No database changes will be performed.\n");

        const products = await Product.find({})
            .select(
                "name sku stockQuantity unit quantityValue quantityUnit mrp sellingPrice lowStockThreshold variants status"
            )
            .lean();

        // Use the raw collection to inspect legacy documents,
        // including records that may not match the current schema.
        const inventories = await Inventory.collection
            .find({})
            .toArray();

        const historyCount = await InventoryHistory.countDocuments();

        const indexes = await Inventory.collection.indexes();

        const inventoryByProduct = new Map();

        for (const inventory of inventories) {
            const productId = id(inventory.product);

            if (!inventoryByProduct.has(productId)) {
                inventoryByProduct.set(productId, []);
            }

            inventoryByProduct.get(productId).push(inventory);
        }

        const productIds = new Set(
            products.map((product) => id(product._id))
        );

        const report = {
            summary: {
                totalProducts: products.length,
                totalInventoryRecords: inventories.length,
                totalInventoryHistoryRecords: historyCount,
                productsWithoutVariants: 0,
                productsWithVariants: 0,
                legacyInventoryRecords: 0,
                orphanInventoryRecords: 0,
                productsRequiringManualReview: 0,
            },
            products: [],
            orphanInventories: [],
            indexes: indexes.map((index) => ({
                name: index.name,
                key: index.key,
                unique: index.unique === true,
            })),
        };

        for (const product of products) {
            const productId = id(product._id);

            const variants = product.variants || [];

            const productInventories =
                inventoryByProduct.get(productId) || [];

            const legacyInventories =
                productInventories.filter(
                    (inventory) =>
                        !inventory.variantId
                );

            const variantInventories =
                productInventories.filter(
                    (inventory) =>
                        Boolean(inventory.variantId)
                );

            const item = {
                productId,
                productName: product.name,
                productSku: product.sku,
                productStock: product.stockQuantity,
                variantCount: variants.length,
                variants: [],
                legacyInventoryRecords: legacyInventories.length,
                variantInventoryRecords: variantInventories.length,
                proposedAction: "",
                status: "REVIEW",
                issues: [],
            };

            report.summary.legacyInventoryRecords +=
                legacyInventories.length;

            if (variants.length === 0) {
                report.summary.productsWithoutVariants++;

                const proposedLabel =
                    `${product.quantityValue || 1} ` +
                    `${product.quantityUnit || product.unit || "piece"}`;

                item.proposedDefaultVariant = {
                    label: proposedLabel,
                    quantityValue: product.quantityValue || 1,
                    quantityUnit:
                        product.quantityUnit || product.unit || "piece",
                    mrp: product.mrp,
                    sellingPrice: product.sellingPrice,
                };

                if (legacyInventories.length === 1) {
                    item.proposedAction =
                        "Create one default variant and map the existing inventory record to it.";

                    item.proposedStock =
                        legacyInventories[0].stockQuantity;

                    item.status = "POTENTIAL_AUTO_MIGRATION";
                } else if (legacyInventories.length === 0) {
                    item.proposedAction =
                        "Create a default variant. Stock source needs verification.";

                    item.proposedStock =
                        product.stockQuantity;

                    item.issues.push(
                        "No legacy inventory record found."
                    );
                } else {
                    item.proposedAction =
                        "Multiple legacy inventory records found. Manual review required.";

                    item.issues.push(
                        "Cannot safely decide which inventory record belongs to the default variant."
                    );
                }
            } else {
                report.summary.productsWithVariants++;

                item.variants = variants.map((variant) => {
                    const matchingInventory =
                        variantInventories.find(
                            (inventory) =>
                                id(inventory.variantId) ===
                                id(variant._id)
                        );

                    return {
                        variantId: id(variant._id),
                        label: variant.label,
                        variantStock: variant.stockQuantity,
                        matchingInventory: matchingInventory
                            ? {
                                inventoryId: id(matchingInventory._id),
                                stockQuantity:
                                    matchingInventory.stockQuantity,
                                reservedQuantity:
                                    matchingInventory.reservedQuantity ?? 0,
                            }
                            : null,
                    };
                });

                if (
                    variants.length === 1 &&
                    legacyInventories.length === 1 &&
                    variantInventories.length === 0
                ) {
                    item.proposedAction =
                        "One variant and one legacy inventory record. Mapping may be possible after verification.";

                    item.status = "POTENTIAL_AUTO_MIGRATION";
                } else if (legacyInventories.length > 0) {
                    item.proposedAction =
                        "Legacy product-level inventory exists alongside variants. Manual stock allocation required.";

                    item.issues.push(
                        "Do not distribute legacy stock automatically across variants."
                    );
                } else {
                    const missingVariantInventory =
                        item.variants.filter(
                            (variant) =>
                                !variant.matchingInventory
                        );

                    if (missingVariantInventory.length > 0) {
                        item.proposedAction =
                            "Some variants do not have inventory records.";

                        item.issues.push(
                            `${missingVariantInventory.length} variant(s) have no matching inventory record.`
                        );
                    } else {
                        item.proposedAction =
                            "Variant inventory records are present. Verify stock consistency.";

                        item.status = "REVIEW";
                    }
                }
            }

            // Check for duplicate or unexpected variant inventory records.
            const variantIds = new Set(
                variants.map((variant) => id(variant._id))
            );

            const unmatchedInventory =
                variantInventories.filter(
                    (inventory) =>
                        !variantIds.has(id(inventory.variantId))
                );

            if (unmatchedInventory.length > 0) {
                item.issues.push(
                    `${unmatchedInventory.length} inventory record(s) reference unknown variants.`
                );
            }

            if (item.issues.length > 0) {
                report.summary.productsRequiringManualReview++;
            }

            report.products.push(item);
        }

        // Find inventory records whose product no longer exists.
        for (const inventory of inventories) {
            const productId = id(inventory.product);

            if (!productIds.has(productId)) {
                report.summary.orphanInventoryRecords++;

                report.orphanInventories.push({
                    inventoryId: id(inventory._id),
                    productId,
                    variantId: id(inventory.variantId),
                    stockQuantity: inventory.stockQuantity,
                    reservedQuantity:
                        inventory.reservedQuantity ?? 0,
                });
            }
        }

        const oldUniqueProductIndex = indexes.find(
            (index) =>
                index.unique === true &&
                index.key?.product === 1 &&
                Object.keys(index.key).length === 1
        );

        report.oldUniqueProductIndexExists =
            Boolean(oldUniqueProductIndex);

        console.log("\n========== SUMMARY ==========");
        console.log(
            JSON.stringify(report.summary, null, 2)
        );

        console.log("\n========== PRODUCTS ==========");
        console.log(
            JSON.stringify(report.products, null, 2)
        );

        console.log("\n========== ORPHAN INVENTORIES ==========");
        console.log(
            JSON.stringify(report.orphanInventories, null, 2)
        );

        console.log("\n========== INDEXES ==========");
        console.log(
            JSON.stringify(report.indexes, null, 2)
        );

        console.log(
            "\nOld unique product index exists:",
            report.oldUniqueProductIndexExists
        );

        console.log("\n======================================");
        console.log("DRY RUN COMPLETED - NO DATA MODIFIED");
        console.log("======================================\n");
    } catch (error) {
        console.error("\nDRY RUN FAILED:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

runDryRun();
