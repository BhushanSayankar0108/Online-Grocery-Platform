const DeliverySlot = require("../models/DeliverySlot");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const InventoryHistory = require("../models/InventoryHistory");
const Coupon = require("../models/Coupon");
const razorpay = require("../config/razorpay");
const {
  notifyOrderPlaced,
  notifyOrderStatusUpdated,
  notifyOrderCancelled,
  notifyInventoryStockChanged,
} = require("../utils/notificationsService");

const isValidId = (id) => mongoose.isValidObjectId(id);

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const createOrderError = (message, statusCode, details = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

const sendError = (res, error, fallback = "Order operation failed.") => {
  console.error("Order error:", error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details || {}),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate order reference. Please retry.",
    });
  }

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: fallback,
  });
};

const validateAddress = (address) => {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return false;
  }

  return [
    "fullName",
    "mobile",
    "addressLine1",
    "city",
    "state",
    "postalCode",
  ].every(
    (key) =>
      typeof address[key] === "string" &&
      address[key].trim().length > 0
  );
};

const generateOrderNumber = () =>
  `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// =====================================================
// COUPON HELPERS
// =====================================================

const reserveCoupon = async (rawCode, subtotal) => {
  const code = String(rawCode || "").trim().toUpperCase();

  if (!code) {
    return {
      couponId: null,
      couponCode: "",
      discountAmount: 0,
    };
  }

  const now = new Date();
  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    throw createOrderError("Coupon code is invalid.", 400);
  }

  if (coupon.status !== "active") {
    throw createOrderError("This coupon is inactive.", 400);
  }

  if (coupon.startDate && new Date(coupon.startDate) > now) {
    throw createOrderError("This coupon is not valid yet.", 400);
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    throw createOrderError("This coupon has expired.", 400);
  }

  if (subtotal < Number(coupon.minOrderAmount || 0)) {
    throw createOrderError(
      `Minimum order amount for this coupon is ₹${roundMoney(
        coupon.minOrderAmount
      )}.`,
      400
    );
  }

  const usageLimit = Number(coupon.usageLimit || 0);
  const usedCount = Number(coupon.usedCount || 0);

  if (usageLimit > 0 && usedCount >= usageLimit) {
    throw createOrderError(
      "This coupon has reached its usage limit.",
      400
    );
  }

  const value = Number(coupon.discountValue || 0);
  let calculatedDiscount;

  if (coupon.discountType === "percentage") {
    calculatedDiscount = (subtotal * value) / 100;
  } else if (coupon.discountType === "fixed") {
    calculatedDiscount = value;
  } else {
    throw createOrderError("Invalid coupon discount type.", 400);
  }

  const maxDiscount = Number(coupon.maxDiscount || 0);

  // Keep order-time calculation consistent with POST /api/coupons/validate.
  if (maxDiscount > 0) {
    calculatedDiscount = Math.min(calculatedDiscount, maxDiscount);
  }

  const discountAmount = roundMoney(
    Math.min(Math.max(0, calculatedDiscount), subtotal)
  );

  if (discountAmount <= 0) {
    throw createOrderError(
      "This coupon provides no valid discount.",
      400
    );
  }

  const filter = {
    _id: coupon._id,
    status: "active",
    usedCount,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  };

  if (usageLimit > 0) {
    filter.$expr = { $lt: ["$usedCount", "$usageLimit"] };
  }

  const claimedCoupon = await Coupon.findOneAndUpdate(
    filter,
    { $inc: { usedCount: 1 } },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!claimedCoupon) {
    throw createOrderError(
      "Coupon availability changed. Please try again.",
      409
    );
  }

  return {
    couponId: claimedCoupon._id,
    couponCode: claimedCoupon.code,
    discountAmount,
  };
};

const releaseCoupon = async (couponId) => {
  if (!couponId) return;

  try {
    await Coupon.updateOne(
      { _id: couponId, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  } catch (error) {
    console.error(
      "CRITICAL: Coupon usage compensation failed:",
      error.message
    );
  }
};

// Release the coupon usage when an order is cancelled.
const releaseCouponByCode = async (rawCode) => {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return { released: false };

  try {
    const result = await Coupon.updateOne(
      { code, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );

    if (!result.matchedCount) {
      console.error(
        "CRITICAL: Coupon usage could not be released. Review coupon:",
        code
      );
      return { released: false };
    }

    return { released: true };
  } catch (error) {
    console.error(
      "CRITICAL: Failed to release coupon after order cancellation:",
      code,
      error.message
    );
    return { released: false };
  }
};

// =====================================================
// CREATE ORDER
// POST /api/orders
// POST /api/orders/customer
// =====================================================

const createOrder = async (req, res) => {
  const stockChanges = [];
  let orderCreated = false;
  let couponReservation = null;
  let createdQrCodeId = null;

  try {
    const body = req.body || {};

    const {
      customerName,
      customerEmail,
      customerMobile,
      items,
      deliveryAddress,
      deliverySlot,
      paymentMethod,
      paymentType: requestedPaymentType,
      promoCode,
      couponCode,
    } = body;

    const authenticatedCustomer = req.customer || null;

    const finalCustomerName = authenticatedCustomer
      ? authenticatedCustomer.name
      : customerName;

    const finalCustomerEmail = authenticatedCustomer
      ? authenticatedCustomer.email
      : customerEmail;

    const finalCustomerMobile = authenticatedCustomer
      ? authenticatedCustomer.mobile
      : customerMobile;

    if (
      typeof finalCustomerName !== "string" ||
      !finalCustomerName.trim() ||
      typeof finalCustomerMobile !== "string" ||
      !finalCustomerMobile.trim()
    ) {
      throw createOrderError(
        "Customer name and mobile are required.",
        400
      );
    }

    if (
      finalCustomerEmail != null &&
      typeof finalCustomerEmail !== "string"
    ) {
      throw createOrderError(
        "Customer email must be a string.",
        400
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw createOrderError(
        "At least one order item is required.",
        400
      );
    }

    if (!validateAddress(deliveryAddress)) {
      throw createOrderError(
        "A complete delivery address is required.",
        400
      );
    }

    // Checkout sends the MongoDB _id of the selected active delivery slot.
    if (!deliverySlot || !isValidId(deliverySlot)) {
      throw createOrderError(
        "Please select a valid delivery slot.",
        400
      );
    }

    const selectedDeliverySlot = await DeliverySlot.findOne({
      _id: deliverySlot,
      status: "active",
    }).lean();

    if (!selectedDeliverySlot) {
      throw createOrderError(
        "The selected delivery slot is no longer available. Please select another slot.",
        409
      );
    }

    if (!["cod", "online"].includes(paymentMethod)) {
      throw createOrderError(
        "paymentMethod must be cod or online.",
        400
      );
    }

    // Normalize the payment type received from Checkout.jsx.
    const rawPaymentType = String(
      requestedPaymentType || ""
    ).trim().toLowerCase();

    let paymentType = "cod";

    if (paymentMethod === "online") {
      if (["qr_code", "qr code"].includes(rawPaymentType)) {
        paymentType = "qr_code";
      } else if (["upi_id", "upi id"].includes(rawPaymentType)) {
        paymentType = "upi_id";
      } else if (
        [
          "card",
          "credit / debit card",
          "credit/debit card",
          "credit card",
          "debit card",
        ].includes(rawPaymentType)
      ) {
        paymentType = "card";
      } else {
        throw createOrderError(
          "Select Credit / Debit Card, UPI ID, QR Code, or Cash on Delivery.",
          400
        );
      }
    } else if (
      rawPaymentType &&
      rawPaymentType !== "cod" &&
      rawPaymentType !== "cash on delivery"
    ) {
      throw createOrderError(
        "Cash on Delivery payment type is invalid.",
        400
      );
    }

    // Combine duplicate product IDs.
    const requested = new Map();

    for (const item of items) {
      if (!item.productId || !isValidId(item.productId)) {
        throw createOrderError(
          "Every item must contain a valid productId.",
          400
        );
      }

      const quantity = item.quantity;

      if (
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > 10000
      ) {
        throw createOrderError(
          "Each quantity must be a positive number no greater than 10000.",
          400
        );
      }

      const key = String(item.productId);
      const totalQuantity = (requested.get(key) || 0) + quantity;

      if (totalQuantity > 10000) {
        throw createOrderError(
          "Total product quantity is too large.",
          400
        );
      }

      requested.set(key, totalQuantity);
    }

    const productIds = [...requested.keys()];

    const products = await Product.find({
      _id: { $in: productIds },
      status: "active",
    });

    if (products.length !== productIds.length) {
      throw createOrderError(
        "One or more products do not exist or are inactive.",
        400
      );
    }

    const productMap = new Map(
      products.map((product) => [String(product._id), product])
    );

    const orderItems = [];
    let subtotal = 0;
    let taxAmount = 0;

    for (const [productId, quantity] of requested.entries()) {
      const product = productMap.get(productId);

      const inventory = await Inventory.findOne({
        product: product._id,
      });

      if (!inventory) {
        throw createOrderError(
          `Inventory is not initialized for ${product.name}.`,
          409
        );
      }

      const available =
        Number(inventory.stockQuantity) -
        Number(inventory.reservedQuantity || 0);

      if (available < quantity) {
        throw createOrderError(
          `Insufficient stock for ${product.name}.`,
          409,
          {
            availableQuantity: Math.max(0, available),
            requestedQuantity: quantity,
          }
        );
      }

      const unitPrice = roundMoney(product.sellingPrice);
      const gstPercentage = Number(product.gstPercentage || 0);
      const lineTotal = roundMoney(unitPrice * quantity);
      const lineTax = roundMoney(
        (lineTotal * gstPercentage) / 100
      );

      subtotal = roundMoney(subtotal + lineTotal);
      taxAmount = roundMoney(taxAmount + lineTax);

      orderItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        image: product.images?.[0] || "",
        unit: product.unit,
        quantity,
        mrp: product.mrp,
        unitPrice,
        gstPercentage,
        lineTotal,
      });
    }

    // =========================================
    // COUPON VALIDATION
    // =========================================

    const requestedCouponCode = String(
      promoCode || couponCode || ""
    ).trim().toUpperCase();

    const couponResult = await reserveCoupon(
      requestedCouponCode,
      subtotal
    );

    couponReservation = couponResult.couponId;

    // Free delivery on orders of ₹500 or more.
    const deliveryCharge = subtotal === 0 || subtotal >= 500 ? 0 : 40;

    const totalAmount = roundMoney(
      Math.max(
        0,
        subtotal +
          taxAmount +
          deliveryCharge -
          couponResult.discountAmount
      )
    );

    // =========================================
    // CREATE ORDER
    // =========================================

    const createdOrder = new Order({
      orderNumber: generateOrderNumber(),

      customer: authenticatedCustomer
        ? authenticatedCustomer._id
        : null,

      customerName: finalCustomerName.trim(),

      customerEmail:
        typeof finalCustomerEmail === "string"
          ? finalCustomerEmail.trim().toLowerCase()
          : "",

      customerMobile: finalCustomerMobile.trim(),

      items: orderItems,

      deliveryAddress: {
        fullName: deliveryAddress.fullName.trim(),
        mobile: deliveryAddress.mobile.trim(),
        addressLine1: deliveryAddress.addressLine1.trim(),
        addressLine2:
          typeof deliveryAddress.addressLine2 === "string"
            ? deliveryAddress.addressLine2.trim()
            : "",
        city: deliveryAddress.city.trim(),
        state: deliveryAddress.state.trim(),
        postalCode: deliveryAddress.postalCode.trim(),
        landmark:
          typeof deliveryAddress.landmark === "string"
            ? deliveryAddress.landmark.trim()
            : "",
      },

      // DELIVERY SLOT DETAILS
      deliverySlot: selectedDeliverySlot._id,
      deliverySlotName: selectedDeliverySlot.name || "Delivery",
      deliverySlotStartTime: selectedDeliverySlot.startTime || "",
      deliverySlotEndTime: selectedDeliverySlot.endTime || "",

      paymentMethod,
      paymentType,
      paymentStatus: "pending",

      subtotal,
      taxAmount,
      deliveryCharge,
      couponCode: couponResult.couponCode,
      discountAmount: couponResult.discountAmount,
      totalAmount,

      status: "placed",

      statusHistory: [
        {
          status: "placed",
          note: "Order placed",
        },
      ],
    });

    // =========================================
    // INVENTORY DEDUCTION
    // =========================================

    // Deduct inventory atomically to reduce overselling.
    for (const [productId, quantity] of requested.entries()) {
      const product = productMap.get(productId);

      const updatedInventory = await Inventory.findOneAndUpdate(
        {
          product: product._id,
          $expr: {
            $gte: [
              {
                $subtract: [
                  "$stockQuantity",
                  "$reservedQuantity",
                ],
              },
              quantity,
            ],
          },
        },
        { $inc: { stockQuantity: -quantity } },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

      if (!updatedInventory) {
        throw createOrderError(
          `Insufficient stock or concurrent stock change for ${product.name}.`,
          409,
          { productId: String(product._id) }
        );
      }

      const change = {
        productId: product._id,
        productName: product.name,
        inventoryId: updatedInventory._id,
        quantity,
        previousStock: updatedInventory.stockQuantity + quantity,
        newStock: updatedInventory.stockQuantity,
        reservedQuantity: Number(updatedInventory.reservedQuantity || 0),
        lowStockThreshold: updatedInventory.lowStockThreshold,
      };

      stockChanges.push(change);

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            stockQuantity: updatedInventory.stockQuantity,
          },
        }
      );

      await InventoryHistory.create({
        product: product._id,
        inventory: updatedInventory._id,
        changeType: "stock_out",
        quantityChange: -quantity,
        previousStock: change.previousStock,
        newStock: change.newStock,
        reason: `Stock deducted for order ${createdOrder.orderNumber}`,
        performedBy: null,
      });
    }

    // =========================================
    // RAZORPAY PAYMENT INITIALIZATION
    // =========================================

    let razorpayCheckout = null;
    let qrCodeResponse = null;

    if (paymentMethod === "online") {
      if (totalAmount < 1) {
        throw createOrderError(
          "Online payment requires an order total of at least ₹1.",
          400
        );
      }

      if (paymentType === "qr_code") {
        const closeBy = Math.floor(Date.now() / 1000) + 30 * 60;
        let qrCode;

        console.log("Creating Razorpay QR Code:", {
          sdkVersion: require("razorpay/package.json").version,
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          usage: "single_use",
          type: "upi_qr",
        });

        try {
          qrCode = await razorpay.qrCode.create({
            type: "upi_qr",
            name: "Grocery Order",
            usage: "single_use",
            fixed_amount: true,
            payment_amount: Math.round(totalAmount * 100),
            description: `Payment for ${createdOrder.orderNumber}`,
            close_by: closeBy,
            notes: {
              orderNumber: createdOrder.orderNumber,
              mongoOrderId: String(createdOrder._id),
            },
          });
        } catch (qrError) {
          console.error("Razorpay QR Code API failed:", {
            statusCode: qrError.statusCode || qrError.status,
            message: qrError.message,
            code: qrError.error?.code || qrError.code,
            description:
              qrError.error?.description || qrError.description || null,
            source: qrError.error?.source || null,
            step: qrError.error?.step || null,
            reason: qrError.error?.reason || null,
            metadata: qrError.error?.metadata || null,
            requestId:
              qrError.response?.headers?.["x-razorpay-request-id"] ||
              qrError.response?.headers?.["x-request-id"] ||
              null,
          });
          throw qrError;
        }

        createdQrCodeId = qrCode.id;

        createdOrder.razorpayQrCodeId = qrCode.id;
        createdOrder.paymentQrImageUrl = qrCode.image_url;
        createdOrder.paymentQrExpiresAt = new Date(
          qrCode.close_by * 1000
        );

        qrCodeResponse = {
          id: qrCode.id,
          imageUrl: qrCode.image_url,
          expiresAt: createdOrder.paymentQrExpiresAt,
        };
      } else {
        console.log(
          "Razorpay SDK version:",
          require("razorpay/package.json").version
        );

        console.log("Creating Razorpay order:", {
          paymentType,
          amount: Math.round(totalAmount * 100),
          currency: "INR",
        });

        // Card / UPI Checkout uses a Razorpay Order.
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          receipt: createdOrder.orderNumber,
          notes: {
            orderNumber: createdOrder.orderNumber,
            mongoOrderId: String(createdOrder._id),
            paymentType,
          },
        });

        createdOrder.razorpayOrderId = razorpayOrder.id;

        razorpayCheckout = {
          key: process.env.RAZORPAY_KEY_ID,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Online Grocery Store",
          description: `Payment for ${createdOrder.orderNumber}`,
          prefill: {
            name: createdOrder.customerName,
            email: createdOrder.customerEmail,
            contact: createdOrder.customerMobile,
          },
        };
      }
    }

    // Save the order once after payment initialization.
    await createdOrder.save();
    orderCreated = true;

    // Generate stock alerts only after the order is successfully saved.
    try {
      await Promise.all(
        stockChanges.map((change) =>
          notifyInventoryStockChanged({
            productId: change.productId,
            productName: change.productName,
            previousAvailable: Math.max(
              0,
              change.previousStock - change.reservedQuantity
            ),
            newAvailable: Math.max(
              0,
              change.newStock - change.reservedQuantity
            ),
            threshold: change.lowStockThreshold,
          })
        )
      );
    } catch (notificationError) {
      console.error(
        "Inventory notification failed:",
        notificationError.message
      );
    }

    // Generate the order notification after successful order creation.
    try {
      await notifyOrderPlaced(createdOrder);
    } catch (notificationError) {
      console.error(
        "Order placed notification failed:",
        notificationError.message
      );
    }

    return res.status(201).json({
      success: true,
      message:
        paymentMethod === "cod"
          ? "Order placed successfully."
          : paymentType === "qr_code"
            ? "Order created. Complete payment using the QR code."
            : "Order created. Complete payment using Razorpay Checkout.",

      order: createdOrder,
      qrCode: qrCodeResponse,
      razorpayCheckout,
    });
  } catch (error) {
    if (!orderCreated) {
      // Close an unused QR code if order creation fails.
      if (createdQrCodeId) {
        try {
          await razorpay.qrCode.close(createdQrCodeId);
        } catch (closeError) {
          console.error(
            "Unable to close unused Razorpay QR:",
            closeError.message
          );
        }
      }

      // Compensate for stock deductions made before failure.
      for (const change of [...stockChanges].reverse()) {
        try {
          const restoredInventory = await Inventory.findOneAndUpdate(
            {
              _id: change.inventoryId,
              stockQuantity: change.newStock,
            },
            { $inc: { stockQuantity: change.quantity } },
            { returnDocument: "after" }
          );

          if (!restoredInventory) {
            console.error(
              "CRITICAL: Inventory compensation needs manual review:",
              String(change.productId)
            );
            continue;
          }

          await Product.updateOne(
            { _id: change.productId },
            {
              $set: {
                stockQuantity: restoredInventory.stockQuantity,
              },
            }
          );

          await InventoryHistory.create({
            product: change.productId,
            inventory: change.inventoryId,
            changeType: "adjustment",
            quantityChange: change.quantity,
            previousStock: change.newStock,
            newStock: restoredInventory.stockQuantity,
            reason: "Compensation after failed order creation",
            performedBy: null,
          });
        } catch (compensationError) {
          console.error(
            "CRITICAL: Failed to restore inventory:",
            compensationError.message
          );
        }
      }

      if (couponReservation) {
        await releaseCoupon(couponReservation);
      }
    }

    return sendError(res, error, "Unable to create order.");
  }
};

// =====================================================
// ADMIN: GET ALL ORDERS
// GET /api/orders
// =====================================================

const getOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const filter = {};

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
        throw createOrderError("Invalid order status.", 400);
      }

      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

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
    return sendError(res, error, "Unable to retrieve orders.");
  }
};

// =====================================================
// ADMIN: GET ORDER BY ID
// GET /api/orders/:id
// =====================================================

const getOrderById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      throw createOrderError("Invalid order ID.", 400);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw createOrderError("Order not found.", 404);
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return sendError(res, error, "Unable to retrieve order.");
  }
};

// =====================================================
// ADMIN: UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
// =====================================================

const allowedTransitions = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body || {};

    if (!isValidId(req.params.id)) {
      throw createOrderError("Invalid order ID.", 400);
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        allowedTransitions,
        status
      )
    ) {
      throw createOrderError("Invalid order status.", 400);
    }

    if (status === "cancelled") {
      throw createOrderError(
        "Use the cancellation endpoint to cancel and restore stock.",
        400
      );
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw createOrderError("Order not found.", 404);
    }

    if (!allowedTransitions[order.status].includes(status)) {
      throw createOrderError(
        `Cannot change order status from ${order.status} to ${status}.`,
        409
      );
    }

    order.status = status;

    order.statusHistory.push({
      status,
      note: typeof note === "string" ? note.trim() : "",
      changedBy: req.admin?._id || null,
    });

    await order.save();

    // Notify customer about the updated order status.
    try {
      await notifyOrderStatusUpdated(order);
    } catch (notificationError) {
      console.error(
        "Order status notification failed:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    return sendError(res, error, "Unable to update order status.");
  }
};

// =====================================================
// ADMIN: CANCEL ORDER AND RESTORE STOCK
// PATCH /api/orders/:id/cancel
// =====================================================

const cancelOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      throw createOrderError("Invalid order ID.", 400);
    }

    const reason =
      typeof req.body?.reason === "string" &&
      req.body.reason.trim()
        ? req.body.reason.trim()
        : "Cancelled by admin";

    const order = await Order.findOne({
      _id: req.params.id,
      status: {
        $in: ["placed", "confirmed", "processing", "packed"],
      },
    });

    if (!order) {
      const existing = await Order.findById(req.params.id);

      if (!existing) {
        throw createOrderError("Order not found.", 404);
      }

      throw createOrderError(
        `Order cannot be cancelled from status ${existing.status}.`,
        409
      );
    }

    // Claim cancellation once to prevent duplicate stock restoration.
    const claimedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        status: order.status,
      },
      {
        $set: {
          status: "cancelled",
          cancellationReason: reason,
        },
        $push: {
          statusHistory: {
            status: "cancelled",
            note: reason,
            changedBy: req.admin?._id || null,
            changedAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );

    if (!claimedOrder) {
      throw createOrderError(
        "Order status changed concurrently. Reload and retry.",
        409
      );
    }

    // Release the coupon claim once cancellation has been won atomically.
    if (claimedOrder.couponCode) {
      await releaseCouponByCode(claimedOrder.couponCode);
    }

    const restored = [];

    try {
      for (const item of claimedOrder.items) {
        const quantity = item.quantity;

        const inventory = await Inventory.findOneAndUpdate(
          { product: item.product },
          { $inc: { stockQuantity: quantity } },
          { returnDocument: "after" }
        );

        if (!inventory) {
          throw new Error(
            `Inventory missing for product ${item.product}`
          );
        }

        await Product.updateOne(
          { _id: item.product },
          { $set: { stockQuantity: inventory.stockQuantity } }
        );

        await InventoryHistory.create({
          product: item.product,
          inventory: inventory._id,
          changeType: "stock_in",
          quantityChange: quantity,
          previousStock: inventory.stockQuantity - quantity,
          newStock: inventory.stockQuantity,
          reason: `Stock restored for cancelled order ${claimedOrder.orderNumber}`,
          performedBy: req.admin?._id || null,
        });

        restored.push({
          product: item.product,
          quantity,
        });
      }
    } catch (restoreError) {
      console.error(
        "CRITICAL: Order cancelled but stock restoration was incomplete:",
        claimedOrder.orderNumber,
        restoreError.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Order was cancelled, but stock restoration needs manual review.",
        orderId: claimedOrder._id,
      });
    }

    // Notification errors must not be reported as inventory restoration errors.
    try {
      await notifyOrderCancelled(claimedOrder, reason);
    } catch (notificationError) {
      console.error(
        "Cancellation notification failed:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled and stock restored.",
      order: claimedOrder,
      restored,
    });
  } catch (error) {
    return sendError(res, error, "Unable to cancel order.");
  }
};

// =====================================================
// CUSTOMER: GET ALL OWN ORDERS
// GET /api/orders/customer
// =====================================================

const getCustomerOrders = async (req, res) => {
  try {
    if (!req.customer?._id) {
      throw createOrderError(
        "Customer authentication is required.",
        401
      );
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const filter = {
      customer: req.customer._id,
    };

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
    return sendError(res, error, "Unable to retrieve your orders.");
  }
};

// =====================================================
// CUSTOMER: GET OWN ORDER BY ID OR ORDER NUMBER
// GET /api/orders/customer/:id
// =====================================================

const getCustomerOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.trim()) {
      throw createOrderError("Order ID is required.", 400);
    }

    if (!req.customer?._id) {
      throw createOrderError(
        "Customer authentication is required.",
        401
      );
    }

    const query = {
      customer: req.customer._id,
    };

    if (mongoose.isValidObjectId(id)) {
      query.$or = [
        { _id: id },
        { orderNumber: id },
      ];
    } else {
      query.orderNumber = id;
    }

    const order = await Order.findOne(query).lean();

    if (!order) {
      throw createOrderError("Order not found.", 404);
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to retrieve order details."
    );
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getCustomerOrders,
  getCustomerOrderById,
  updateOrderStatus,
  cancelOrder,
};