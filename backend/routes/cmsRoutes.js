
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { protectAdmin } = require("../middleware/authMiddleware");

const {
    getAdminCMS,
    saveAdminCMS,
    getPublicCMS,
    uploadCMSImages,
} = require("../controllers/cmsController");

const router = express.Router();

const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    "cms"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        cb(null, uniqueName);
    },
});

const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },

    fileFilter: (req, file, cb) => {
        if (!allowedImageTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only JPG, PNG, WEBP and GIF images are allowed.")
            );
        }

        cb(null, true);
    },
});

// Public website
router.get("/public", getPublicCMS);

// Protected admin CMS
router.get("/admin", protectAdmin, getAdminCMS);
router.put("/admin", protectAdmin, saveAdminCMS);
router.post(
    "/upload",
    protectAdmin,
    (req, res, next) => {
        upload.array("images", 10)(req, res, (error) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message || "Image upload failed.",
                });
            }

            next();
        });
    },
    uploadCMSImages
);

module.exports = router;
