const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        image: {
            type: String,
            trim: true,
            default: ""
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        status: {
            type: String,
            required: true,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const SubCategory = mongoose.model(
    "SubCategory",
    subCategorySchema
);

module.exports = SubCategory;