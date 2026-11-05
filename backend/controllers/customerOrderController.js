
const mongoose = require("mongoose");
const Order = require("../models/Order");

// GET /api/customers/orders
// Return only orders belonging to the authenticated customer.
const getMyOrders = async (req, res) => {
  try {
    const customerId = req.customer._id;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const filter = { customer: customerId };

    // Optional order status filter.
    if (req.query.status) {
      const allowedStatuses = [
        "placed",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status.",
        });
      }

      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your orders.",
    });
  }
};

// GET /api/customers/orders/:orderId
// A customer can access only their own order.
const getMyOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: req.customer._id,
    }).lean();

    // Use the same response for a missing order and another
    // customer's order to avoid revealing its existence.
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get customer order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order details.",
    });
  }
};

module.exports = {
  getMyOrders,
  getMyOrderById,
};
