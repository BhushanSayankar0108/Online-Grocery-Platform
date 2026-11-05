
const express = require("express");

const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const isValidId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

const validStatuses = ["active", "inactive"];

const validateName = (name) =>
    typeof name === "string" && name.trim().length > 0;

// ---------------------------------------------------------
// GET ALL SUBCATEGORIES (PUBLIC)
// GET /api/subcategories
// ---------------------------------------------------------

router.get("/", async (req, res) => {
    try {
        const subCategories = await SubCategory.find()
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: subCategories.length,
            subCategories
        });
    } catch (error) {
        console.error("Get subcategories error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch subcategories."
        });
    }
});

// ---------------------------------------------------------
// GET SUBCATEGORIES BY CATEGORY (PUBLIC)
// GET /api/subcategories/category/:categoryId
// ---------------------------------------------------------

router.get("/category/:categoryId", async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!isValidId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID."
            });
        }

        const parentCategory = await Category.findById(categoryId);

        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: "Parent category not found."
            });
        }

        const subCategories = await SubCategory.find({
            category: categoryId
        })
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: subCategories.length,
            subCategories
        });
    } catch (error) {
        console.error(
            "Get category subcategories error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch subcategories."
        });
    }
});

// ---------------------------------------------------------
// GET SINGLE SUBCATEGORY (PUBLIC)
// GET /api/subcategories/:id
// ---------------------------------------------------------

router.get("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID."
            });
        }

        const subCategory = await SubCategory.findById(
            req.params.id
        ).populate("category", "name");

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found."
            });
        }

        return res.status(200).json({
            success: true,
            subCategory
        });
    } catch (error) {
        console.error("Get subcategory error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch subcategory."
        });
    }
});

// ---------------------------------------------------------
// CREATE SUBCATEGORY (ADMIN ONLY)
// POST /api/subcategories
// ---------------------------------------------------------

router.post("/", protectAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            image,
            category,
            status
        } = req.body;

        if (!validateName(name)) {
            return res.status(400).json({
                success: false,
                message: "Subcategory name is required."
            });
        }

        if (
            typeof category !== "string" ||
            !isValidId(category)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid category ID is required."
            });
        }

        if (
            status !== undefined &&
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive."
            });
        }

        const parentCategory = await Category.findById(category);

        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: "Parent category not found."
            });
        }

        const normalizedName = name.trim();

        const existingSubCategory = await SubCategory.findOne({
            name: normalizedName,
            category
        });

        if (existingSubCategory) {
            return res.status(409).json({
                success: false,
                message:
                    "This subcategory already exists in the selected category."
            });
        }

        const subCategory = await SubCategory.create({
            name: normalizedName,
            description:
                typeof description === "string"
                    ? description.trim()
                    : "",
            image: typeof image === "string" ? image.trim() : "",
            category,
            status: status || "active"
        });

        await subCategory.populate("category", "name");

        return res.status(201).json({
            success: true,
            message: "Subcategory created successfully.",
            subCategory
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This subcategory already exists in the selected category."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Create subcategory error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create subcategory."
        });
    }
});

// ---------------------------------------------------------
// UPDATE SUBCATEGORY (ADMIN ONLY)
// PUT /api/subcategories/:id
// ---------------------------------------------------------

router.put("/:id", protectAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID."
            });
        }

        const {
            name,
            description,
            image,
            category,
            status
        } = req.body;

        const subCategory = await SubCategory.findById(id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found."
            });
        }

        if (name !== undefined && !validateName(name)) {
            return res.status(400).json({
                success: false,
                message: "Subcategory name cannot be empty."
            });
        }

        if (
            status !== undefined &&
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive."
            });
        }

        let targetCategoryId = String(subCategory.category);

        if (category !== undefined) {
            if (
                typeof category !== "string" ||
                !isValidId(category)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID."
                });
            }

            const parentCategory = await Category.findById(category);

            if (!parentCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Parent category not found."
                });
            }

            targetCategoryId = category;
        }

        const targetName =
            name !== undefined ? name.trim() : subCategory.name;

        const duplicateSubCategory = await SubCategory.findOne({
            name: targetName,
            category: targetCategoryId,
            _id: { $ne: subCategory._id }
        });

        if (duplicateSubCategory) {
            return res.status(409).json({
                success: false,
                message:
                    "Another subcategory with this name already exists in the selected category."
            });
        }

        subCategory.name = targetName;
        subCategory.category = targetCategoryId;

        if (description !== undefined) {
            if (typeof description !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Description must be a string."
                });
            }

            subCategory.description = description.trim();
        }

        if (image !== undefined) {
            if (typeof image !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Image must be a string."
                });
            }

            subCategory.image = image.trim();
        }

        if (status !== undefined) {
            subCategory.status = status;
        }

        await subCategory.save();
        await subCategory.populate("category", "name");

        return res.status(200).json({
            success: true,
            message: "Subcategory updated successfully.",
            subCategory
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Another subcategory with this name already exists in the selected category."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Update subcategory error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update subcategory."
        });
    }
});

// ---------------------------------------------------------
// DELETE SUBCATEGORY (ADMIN ONLY)
// DELETE /api/subcategories/:id
// ---------------------------------------------------------

router.delete("/:id", protectAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subcategory ID."
            });
        }

        const subCategory = await SubCategory.findById(id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found."
            });
        }

        await SubCategory.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Subcategory deleted successfully."
        });
    } catch (error) {
        console.error("Delete subcategory error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete subcategory."
        });
    }
});

module.exports = router;
