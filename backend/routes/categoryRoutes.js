
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const Category = require("../models/Category");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "../uploads/categories");
fs.mkdirSync(uploadDirectory, { recursive: true });

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDirectory),

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeName = path
            .basename(file.originalname, path.extname(file.originalname))
            .replace(/[^a-zA-Z0-9_-]/g, "-")
            .slice(0, 60);

        cb(
            null,
            `${safeName || "category"}-${Date.now()}-${crypto.randomUUID()}${extension}`
        );
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_IMAGES
    },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return cb(
                new Error("Only JPEG, PNG, WebP, and GIF images are allowed.")
            );
        }

        cb(null, true);
    }
});

const isValidId = (id) => /^[a-fA-F0-9]{24}$/.test(id);
const validStatuses = ["active", "inactive"];
const validImageSizes = ["small", "medium", "large"];

const getImageUrls = (category) => {
    if (Array.isArray(category.images) && category.images.length) {
        return category.images.filter(Boolean);
    }

    return category.image ? [category.image] : [];
};

const removeUploadedFiles = (files = []) => {
    for (const file of files) {
        if (!file?.path) continue;

        try {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (error) {
            console.error("Upload cleanup failed:", error.message);
        }
    }
};

const removeCategoryImage = (imageUrl) => {
    const prefix = "/uploads/categories/";

    if (typeof imageUrl !== "string" || !imageUrl.startsWith(prefix)) {
        return;
    }

    const filename = imageUrl.slice(prefix.length);

    if (!filename || path.basename(filename) !== filename) return;

    const filePath = path.join(uploadDirectory, filename);

    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error) {
        console.error("Category image cleanup failed:", error.message);
    }
};

const validateFields = ({ status, imageSize }) => {
    if (status !== undefined && !validStatuses.includes(status)) {
        return "Status must be active or inactive.";
    }

    if (
        imageSize !== undefined &&
        !validImageSizes.includes(imageSize)
    ) {
        return "Image size must be small, medium, or large.";
    }

    return null;
};

const getRequestedExistingImages = (value, currentImages) => {
    if (value === undefined) return currentImages;

    let requested;

    try {
        requested = typeof value === "string" ? JSON.parse(value) : value;
    } catch {
        throw new Error("existingImages must contain a valid JSON array.");
    }

    if (!Array.isArray(requested)) {
        throw new Error("existingImages must be an array.");
    }

    if (requested.some((url) => typeof url !== "string")) {
        throw new Error("Invalid existing image URL.");
    }

    // An edit can retain only images already assigned to this category.
    if (requested.some((url) => !currentImages.includes(url))) {
        throw new Error("An existing image URL is invalid.");
    }

    return requested;
};

const uploadImages = upload.array("images", MAX_IMAGES);

// ---------------------------------------------------------
// GET ALL CATEGORIES
// GET /api/categories
// ---------------------------------------------------------

router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error("Get categories error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to load categories."
        });
    }
});

// ---------------------------------------------------------
// GET SINGLE CATEGORY
// GET /api/categories/:id
// ---------------------------------------------------------

router.get("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID."
            });
        }

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        return res.status(200).json({ success: true, category });
    } catch (error) {
        console.error("Get category error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to load category."
        });
    }
});

// ---------------------------------------------------------
// CREATE CATEGORY
// POST /api/categories
// FormData: name, description, status, imageSize, images
// ---------------------------------------------------------

router.post("/", protectAdmin, uploadImages, async (req, res) => {
    try {
        const { name, description, status, imageSize } = req.body;

        if (typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Category name must contain at least 2 characters."
            });
        }

        const validationError = validateFields({ status, imageSize });

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const normalizedName = name.trim();

        const duplicate = await Category.findOne({
            name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "A category with this name already exists."
            });
        }

        const images = (req.files || []).map(
            (file) => `/uploads/categories/${file.filename}`
        );

        const category = await Category.create({
            name: normalizedName,
            description:
                typeof description === "string" ? description.trim() : "",
            images,
            image: images[0] || "",
            imageSize: imageSize || "medium",
            status: status || "active"
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A category with this name already exists."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Create category error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create category."
        });
    } finally {
        // Files are retained after a successful create. On failures, the
        // request's files must be cleaned up by the error-aware logic below.
    }
});

// ---------------------------------------------------------
// UPDATE CATEGORY
// PUT /api/categories/:id
// FormData: existingImages (JSON array), images (new files), other fields
// ---------------------------------------------------------

router.put("/:id", protectAdmin, uploadImages, async (req, res) => {
    let savedSuccessfully = false;

    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID."
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        const { name, description, status, imageSize } = req.body;

        if (typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Category name must contain at least 2 characters."
            });
        }

        const validationError = validateFields({ status, imageSize });

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const normalizedName = name.trim();

        const duplicate = await Category.findOne({
            name: {
                $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            },
            _id: { $ne: category._id }
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "A category with this name already exists."
            });
        }

        const previousImages = getImageUrls(category);

        let retainedImages;

        try {
            retainedImages = getRequestedExistingImages(
                req.body.existingImages,
                previousImages
            );
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        const newImages = (req.files || []).map(
            (file) => `/uploads/categories/${file.filename}`
        );

        if (retainedImages.length + newImages.length > MAX_IMAGES) {
            return res.status(400).json({
                success: false,
                message: `A category can contain a maximum of ${MAX_IMAGES} images.`
            });
        }

        category.name = normalizedName;
        category.description =
            typeof description === "string" ? description.trim() : "";
        category.status = status ?? category.status;
        category.imageSize = imageSize ?? category.imageSize;
        category.images = [...retainedImages, ...newImages];
        category.image = category.images[0] || "";

        await category.save();
        savedSuccessfully = true;

        // Remove only images that were removed from the saved gallery.
        const retainedSet = new Set(category.images);

        for (const oldImage of previousImages) {
            if (!retainedSet.has(oldImage)) {
                removeCategoryImage(oldImage);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A category with this name already exists."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Update category error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update category."
        });
    } finally {
        if (!savedSuccessfully) {
            removeUploadedFiles(req.files || []);
        }
    }
});

// ---------------------------------------------------------
// DELETE CATEGORY
// DELETE /api/categories/:id
// ---------------------------------------------------------

router.delete("/:id", protectAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID."
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        const SubCategory = require("../models/SubCategory");

        const hasSubcategories = await SubCategory.exists({
            category: category._id
        });

        if (hasSubcategories) {
            return res.status(409).json({
                success: false,
                message:
                    "Delete or reassign this category's subcategories before deleting it."
            });
        }

        await Category.findByIdAndDelete(category._id);

        for (const image of getImageUrls(category)) {
            removeCategoryImage(image);
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully."
        });
    } catch (error) {
        console.error("Delete category error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete category."
        });
    }
});

// ---------------------------------------------------------
// MULTER ERROR HANDLER
// ---------------------------------------------------------

router.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err instanceof multer.MulterError) {
        let message = "Invalid image upload.";

        if (err.code === "LIMIT_FILE_SIZE") {
            message = "Each image must be 5 MB or smaller.";
        } else if (err.code === "LIMIT_FILE_COUNT") {
            message = `A category can contain a maximum of ${MAX_IMAGES} images.`;
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "Use the images field to upload category images.";
        }

        removeUploadedFiles(req.files || []);

        return res.status(400).json({ success: false, message });
    }

    if (
        err.message ===
        "Only JPEG, PNG, WebP, and GIF images are allowed."
    ) {
        removeUploadedFiles(req.files || []);

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    console.error("Category route error:", err.message);

    return res.status(500).json({
        success: false,
        message: "An unexpected category error occurred."
    });
});

module.exports = router;
