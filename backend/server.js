
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const addressRoutes = require("./routes/addressRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const cmsRoutes = require("./routes/cmsRoutes");
const couponRoutes = require("./routes/couponRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const {handleRazorpayWebhook,} = require("./controllers/paymentController");
const reportsRoutes = require("./routes/reportsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const returnRoutes = require("./routes/returnRoutes");
const supportRoutes = require("./routes/supportRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL
            ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
            : true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.post(
  "/api/payments/razorpay/webhook",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded images
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// Root endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Online Grocery Platform API is running!",
    });
});

// Health-check endpoint
app.get("/api/health", (req, res) => {
    const mongoose = require("mongoose");
    const databaseConnected = mongoose.connection.readyState === 1;

    res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        server: "running",
        database: databaseConnected ? "connected" : "disconnected",
    });
});

// API routes
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/customers/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/newsletter", newsletterRoutes);
console.log("Return routes mounted: /api/returns");
console.log("Support routes mounted: /api/support");
console.log("Notification routes mounted: /api/notifications");
console.log("Wishlist routes mounted: /api/wishlist");

// SETTINGS ROUTES
app.use("/api/settings", settingsRoutes);

console.log("SETTINGS ROUTES MOUNTED SUCCESSFULLY");
console.log("Settings API: http://localhost:5000/api/settings/public");

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// Central error handler
app.use((err, req, res, next) => {
    console.error("API error:", err.message);

    if (res.headersSent) {
        return next(err);
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "Request payload is too large.",
        });
    }

    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body.",
        });
    }

    return res.status(err.status || 500).json({
        success: false,
        message:
            err.status && err.status < 500
                ? err.message
                : "Internal server error.",
    });
});

// Start server after MongoDB connects
const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
        });

        server.on("error", (error) => {
            console.error("HTTP server error:", error.message);
            process.exitCode = 1;
        });
    } catch (error) {
        console.error("Failed to start the application:", error.message);
        process.exitCode = 1;
    }
};

startServer();

module.exports = app;
