
const mongoose = require("mongoose");
const Order = require("../models/Order");
const ReturnRequest = require("../models/ReturnRequest");

const generateReturnNumber = () =>
  `RET-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// CUSTOMER: GET DELIVERED ORDERS ELIGIBLE FOR RETURN
const getEligibleReturnOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.customer._id,
      status: "delivered",
    })
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      orders.map(async (order) => {
        const returnedItems = await ReturnRequest.find({
          order: order._id,
          customer: req.customer._id,
        })
          .select("orderItemId status")
          .lean();

        const returnedItemIds = new Set(
          returnedItems.map((item) => String(item.orderItemId))
        );

        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          items: order.items
            .filter(
              (item) => !returnedItemIds.has(String(item._id))
            )
            .map((item) => ({
              _id: item._id,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              image: item.image,
            })),
        };
      })
    );

    return res.status(200).json({
      success: true,
      orders: result,
    });
  } catch (error) {
    console.error("Eligible return orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve eligible orders.",
    });
  }
};

// CUSTOMER: CREATE RETURN REQUEST
const createReturnRequest = async (req, res) => {
  try {
    const { orderId, orderItemId, reason, description } =
      req.body || {};

    if (
      !mongoose.isValidObjectId(orderId) ||
      !mongoose.isValidObjectId(orderItemId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid order and product item IDs are required.",
      });
    }

    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select a return reason.",
      });
    }

    const allowedReasons = [
      "Damaged product",
      "Wrong product delivered",
      "Missing item",
      "Expired product",
      "Quality issue",
      "Other",
    ];

    if (!allowedReasons.includes(reason.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid return reason.",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be text.",
      });
    }

    if (typeof description === "string" && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 1000 characters.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: req.customer._id,
      status: "delivered",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Delivered order not found.",
      });
    }

    const orderItem = order.items.id(orderItemId);

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Selected product was not found in this order.",
      });
    }

    const existingRequest = await ReturnRequest.findOne({
      order: order._id,
      orderItemId: orderItem._id,
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "A return request already exists for this product.",
      });
    }

    const returnRequest = await ReturnRequest.create({
      requestNumber: generateReturnNumber(),
      order: order._id,
      orderNumber: order.orderNumber,
      customer: req.customer._id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerMobile: order.customerMobile,
      orderItemId: orderItem._id,
      product: orderItem.product,
      productName: orderItem.productName,
      sku: orderItem.sku,
      quantity: orderItem.quantity,
      reason: reason.trim(),
      description: description?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully.",
      returnRequest,
    });
  } catch (error) {
    console.error("Create return request error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A return request already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit return request.",
    });
  }
};

// CUSTOMER: GET OWN RETURN REQUESTS
const getCustomerReturnRequests = async (req, res) => {
  try {
    const requests = await ReturnRequest.find({
      customer: req.customer._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Customer return requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve return requests.",
    });
  }
};

// ADMIN: GET ALL RETURN REQUESTS
const getAllReturnRequests = async (req, res) => {
  try {
    const requests = await ReturnRequest.find()
      .populate("customer", "name email mobile")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Admin return requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve return requests.",
    });
  }
};

// ADMIN: UPDATE RETURN REQUEST STATUS
const updateReturnRequestStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body || {};

    const allowedStatuses = [
      "approved",
      "rejected",
      "completed",
    ];

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return request ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return request status.",
      });
    }

    const request = await ReturnRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Return request not found.",
      });
    }

    if (
      request.status === "rejected" ||
      request.status === "completed"
    ) {
      return res.status(409).json({
        success: false,
        message: "This return request is already finalized.",
      });
    }

    if (
      status === "completed" &&
      request.status !== "approved"
    ) {
      return res.status(409).json({
        success: false,
        message: "Only approved requests can be completed.",
      });
    }

    request.status = status;
    request.adminNote =
      typeof adminNote === "string" ? adminNote.trim() : "";

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Return request updated successfully.",
      returnRequest: request,
    });
  } catch (error) {
    console.error("Update return request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update return request.",
    });
  }
};

module.exports = {
  getEligibleReturnOrders,
  createReturnRequest,
  getCustomerReturnRequests,
  getAllReturnRequests,
  updateReturnRequestStatus,
};
