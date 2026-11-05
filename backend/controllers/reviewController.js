const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");

const Review = require("../models/Review");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

function getReviewImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  const prefix = "/uploads/reviews/";
  if (!imageUrl.startsWith(prefix)) return null;

  const filename = path.basename(imageUrl);
  if (!filename || filename !== imageUrl.slice(prefix.length)) return null;

  return path.join(__dirname, "..", "uploads", "reviews", filename);
}

async function removeReviewImage(imageUrl) {
  const imagePath = getReviewImagePath(imageUrl);
  if (!imagePath) return;

  try {
    await fs.unlink(imagePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Unable to delete review image:", error.message);
    }
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ADMIN: GET ALL REVIEWS WITH SEARCH/FILTERS
const getAdminReviews = async (req, res) => {
  try {
    const { search = "", status = "all", rating = "all" } = req.query;
    const filter = {};

    if (["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    if (rating !== "all") {
      const parsedRating = Number(rating);

      if (![1, 2, 3, 4, 5].includes(parsedRating)) {
        return res.status(400).json({ message: "Invalid rating filter." });
      }

      filter.rating = parsedRating;
    }

    const searchTerm = String(search).trim();

    if (searchTerm) {
      const regex = new RegExp(escapeRegex(searchTerm), "i");

      const [customers, products] = await Promise.all([
        Customer.find({ name: regex }).select("_id").lean(),
        Product.find({ name: regex }).select("_id").lean(),
      ]);

      filter.$or = [
        { comment: regex },
        { customer: { $in: customers.map((item) => item._id) } },
        { product: { $in: products.map((item) => item._id) } },
      ];
    }

    const [
      reviews,
      total,
      pending,
      approved,
      rejected,
      averageResult,
    ] = await Promise.all([
      Review.find(filter)
        .populate("customer", "name")
        .populate("product", "name")
        .populate("order", "orderNumber status")
        .sort({ createdAt: -1 })
        .lean(),

      Review.countDocuments(),
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "approved" }),
      Review.countDocuments({ status: "rejected" }),

      Review.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, average: { $avg: "$rating" } } },
      ]),
    ]);

    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(),
      customer: review.customer?.name || "Unknown Customer",
      product: review.product?.name || "Deleted Product",
      orderNumber: review.order?.orderNumber || "",
      rating: review.rating,
      comment: review.comment,
      imageUrl: review.imageUrl || "",
      date: review.createdAt,
      status: review.status,
    }));

    return res.json({
      reviews: formattedReviews,
      stats: {
        total,
        pending,
        approved,
        rejected,
        average: Number((averageResult[0]?.average || 0).toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Get admin reviews error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews." });
  }
};

// PUBLIC: GET APPROVED REVIEWS FOR A PRODUCT
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const reviews = await Review.find({
      product: productId,
      status: "approved",
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .lean();

    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(),
      customer: review.customer?.name || "Customer",
      rating: review.rating,
      comment: review.comment,
      imageUrl: review.imageUrl || "",
      date: review.createdAt,
    }));

    const average = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

    return res.json({
      reviews: formattedReviews,
      total: reviews.length,
      average: Number(average.toFixed(1)),
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    return res.status(500).json({
      message: "Failed to fetch product reviews.",
    });
  }
};

// CUSTOMER: SUBMIT A PRODUCT REVIEW
const createReview = async (req, res) => {
  let savedImageUrl = "";

  try {
    const customerId = req.customer?._id || req.customer?.id;

    if (!customerId || !mongoose.isValidObjectId(customerId)) {
      return res.status(401).json({
        message: "Please log in to submit a review.",
      });
    }

    const { productId, rating, comment = "" } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Please select a rating between 1 and 5 stars.",
      });
    }

    if (typeof comment !== "string" || comment.trim().length > 2000) {
      return res.status(400).json({
        message: "Review comment must be 2,000 characters or fewer.",
      });
    }

    const product = await Product.findById(productId);

    if (!product || product.status !== "active") {
      return res.status(404).json({
        message: "This product is unavailable.",
      });
    }

    // Find all delivered orders containing this product.
    const deliveredOrders = await Order.find({
      customer: customerId,
      status: "delivered",
      "items.product": product._id,
    })
      .select("_id")
      .sort({ createdAt: -1 })
      .lean();

    if (!deliveredOrders.length) {
      return res.status(403).json({
        message:
          "You can review this product only after it has been delivered in your order.",
      });
    }

    // A separate review is allowed for each delivered order.
    const deliveredOrderIds = deliveredOrders.map((order) => order._id);

    const existingReviews = await Review.find({
      customer: customerId,
      product: product._id,
      order: { $in: deliveredOrderIds },
    })
      .select("order")
      .lean();

    const alreadyReviewedOrders = new Set(
      existingReviews.map((review) => review.order.toString())
    );

    const eligibleOrder = deliveredOrders.find(
      (order) => !alreadyReviewedOrders.has(order._id.toString())
    );

    if (!eligibleOrder) {
      return res.status(409).json({
        message:
          "You have already reviewed this product for every eligible delivered order.",
      });
    }

    if (req.file) {
      savedImageUrl = `/uploads/reviews/${req.file.filename}`;
    }

    const review = await Review.create({
      product: product._id,
      customer: customerId,
      order: eligibleOrder._id,
      rating: numericRating,
      comment: comment.trim(),
      imageUrl: savedImageUrl,
      status: "pending",
    });

    return res.status(201).json({
      message:
        "Review submitted successfully. It is awaiting admin approval.",
      review: {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        imageUrl: review.imageUrl,
        status: review.status,
      },
    });
  } catch (error) {
    if (savedImageUrl) {
      await removeReviewImage(savedImageUrl);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A review for this product and delivered order already exists.",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      message: "Failed to submit your review.",
    });
  }
};

// PUBLIC: HOMEPAGE CUSTOMER REVIEWS
const getPublicReviews = async (req, res) => {
  try {
    const [reviews, aggregate, total] = await Promise.all([
      Review.find({ status: "approved" })
        .populate("customer", "name")
        .populate("product", "name")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),

      Review.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, average: { $avg: "$rating" } } },
      ]),

      Review.countDocuments({ status: "approved" }),
    ]);

    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(),
      customer: review.customer?.name || "Customer",
      product: review.product?.name || "Product",
      rating: review.rating,
      comment: review.comment,
      imageUrl: review.imageUrl || "",
      date: review.createdAt,
    }));

    return res.json({
      reviews: formattedReviews,
      total,
      average: Number((aggregate[0]?.average || 0).toFixed(1)),
    });
  } catch (error) {
    console.error("Get public reviews error:", error);
    return res.status(500).json({
      message: "Failed to fetch customer reviews.",
    });
  }
};

// ADMIN: UPDATE REVIEW STATUS
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid review ID." });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid review status." });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    return res.json({
      message: "Review status updated successfully.",
      review: { id: review._id.toString(), status: review.status },
    });
  } catch (error) {
    console.error("Update review status error:", error);
    return res.status(500).json({
      message: "Failed to update review status.",
    });
  }
};

// ADMIN: DELETE REVIEW AND ITS LOCAL IMAGE
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid review ID." });
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    await removeReviewImage(review.imageUrl);

    return res.json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      message: "Failed to delete review.",
    });
  }
};

module.exports = {
  getAdminReviews,
  getProductReviews,
  getPublicReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
};