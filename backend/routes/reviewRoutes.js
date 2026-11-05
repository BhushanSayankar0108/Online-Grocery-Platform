
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const {
  getAdminReviews,
  getProductReviews,
  getPublicReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
} = require("../controllers/reviewController");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const { protectCustomer } = require("../middleware/customerAuthMiddleware");
const reviewUpload = require("../middleware/reviewUpload");

const router = express.Router();

// PUBLIC ROUTES
router.get("/public", getPublicReviews);
router.get("/product/:productId", getProductReviews);

// CUSTOMER ROUTE: SUBMIT REVIEW WITH OPTIONAL IMAGE
router.post(
  "/",
  protectCustomer,
  (req, res, next) => {
    reviewUpload.single("image")(req, res, (error) => {
      if (error) {
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? "Review image must be 5 MB or smaller."
            : error.message || "Unable to upload review image.";

        return res.status(400).json({ message });
      }

      next();
    });
  },
  (req, res, next) => {
    // Remove the uploaded file if the request ultimately fails.
    res.on("finish", () => {
      if (res.statusCode >= 400 && req.file) {
        const uploadedFile = path.join(
          __dirname,
          "..",
          "uploads",
          "reviews",
          path.basename(req.file.filename)
        );

        fs.unlink(uploadedFile).catch((error) => {
          if (error.code !== "ENOENT") {
            console.error(
              "Review upload cleanup failed:",
              error.message
            );
          }
        });
      }
    });

    next();
  },
  createReview
);

// ADMIN ROUTES
router.get(
  "/admin",
  protectAdmin,
  requirePermission("Reviews"),
  getAdminReviews
);

router.patch(
  "/admin/:id/status",
  protectAdmin,
  requirePermission("Reviews"),
  updateReviewStatus
);

router.delete(
  "/admin/:id",
  protectAdmin,
  requirePermission("Reviews"),
  deleteReview
);

module.exports = router;
