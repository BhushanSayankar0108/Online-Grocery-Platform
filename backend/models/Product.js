
const mongoose = require("mongoose");

// =========================================================
// PRODUCT VARIANT SCHEMA
// Example sizes: 250 g, 500 g, 1 kg
// Each variant has its own price and stock quantity.
// =========================================================

const productVariantSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        quantityValue: {
            type: Number,
            required: true,
            min: 0.001
        },

        quantityUnit: {
            type: String,
            required: true,
            trim: true,
            default: "g"
        },

        mrp: {
            type: Number,
            required: true,
            min: 0
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0
        },

        stockQuantity: {
            type: Number,
            default: 0,
            min: 0
        },

        sku: {
            type: String,
            trim: true,
            uppercase: true,
            default: ""
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

// A variant's selling price cannot exceed its MRP.
productVariantSchema.pre("validate", function () {
    if (
        this.mrp !== undefined &&
        this.sellingPrice !== undefined &&
        this.sellingPrice > this.mrp
    ) {
        this.invalidate(
            "sellingPrice",
            "Variant selling price cannot exceed MRP."
        );
    }
});

// =========================================================
// PRODUCT SCHEMA
// =========================================================

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        slug: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            unique: true
        },

        barcode: {
            type: String,
            trim: true,
            default: ""
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true
        },

        brand: {
            type: String,
            trim: true,
            default: ""
        },

        images: {
            type: [String],
            default: []
        },

        unit: {
            type: String,
            required: true,
            trim: true,
            default: "piece"
        },

        quantityValue: {
            type: Number,
            required: true,
            min: 0.001
        },

        quantityUnit: {
            type: String,
            required: true,
            trim: true,
            default: "kg"
        },

        // Default or legacy product-level price.
        // Variant prices take priority when a customer
        // selects a specific size.
        mrp: {
            type: Number,
            required: true,
            min: 0
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0
        },

        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        gstPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        stockQuantity: {
            type: Number,
            default: 0,
            min: 0
        },

        lowStockThreshold: {
            type: Number,
            default: 10,
            min: 0
        },

        // Independently priced and stocked sizes.
        variants: {
            type: [productVariantSchema],
            default: []
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// =========================================================
// VALIDATION AND AUTOMATIC DISCOUNT CALCULATION
// =========================================================

productSchema.pre("validate", function () {
    if (
        this.mrp !== undefined &&
        this.sellingPrice !== undefined &&
        this.sellingPrice > this.mrp
    ) {
        this.invalidate(
            "sellingPrice",
            "Selling price cannot exceed MRP."
        );
    }

    this.discountPercentage =
        this.mrp > 0
            ? Number(
                (
                    ((this.mrp - this.sellingPrice) / this.mrp) *
                    100
                ).toFixed(2)
            )
            : 0;

    // Ensure variant labels are unique within a product.
    const labels = this.variants.map((variant) =>
        variant.label.trim().toLowerCase()
    );

    if (new Set(labels).size !== labels.length) {
        this.invalidate(
            "variants",
            "Each product variant must have a unique size label."
        );
    }
});

// =========================================================
// INDEXES
// =========================================================

productSchema.index({
    category: 1,
    status: 1
});

productSchema.index({
    subCategory: 1,
    status: 1
});

productSchema.index({
    name: "text",
    description: "text",
    brand: "text"
});

productSchema.index({
    createdAt: -1
});

// =========================================================
// EXPORT MODEL
// =========================================================

module.exports = mongoose.model("Product", productSchema);
