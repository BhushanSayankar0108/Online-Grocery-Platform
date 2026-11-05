
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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

        // Primary image retained for compatibility with existing components.
        image: {
            type: String,
            trim: true,
            default: ""
        },

        // Gallery images used by Admin Categories.
        images: {
            type: [
                {
                    type: String,
                    trim: true
                }
            ],
            default: [],
            validate: {
                validator: function (images) {
                    return images.length <= 10;
                },
                message: "A category can have a maximum of 10 images."
            }
        },

        imageSize: {
            type: String,
            enum: ["small", "medium", "large"],
            default: "medium"
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

// Keep the primary image synchronized with the gallery.
categorySchema.pre("validate", function () {
    if (Array.isArray(this.images) && this.images.length > 0) {
        this.image = this.images[0];
    } else if (Array.isArray(this.images) && this.images.length === 0) {
        this.image = "";
    }
});

module.exports = mongoose.model("Category", categorySchema);
