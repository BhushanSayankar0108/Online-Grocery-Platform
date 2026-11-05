
const crypto = require("crypto");
const Order = require("../models/Order");
const razorpay = require("../config/razorpay");

/**
 * Verify Razorpay webhook signature using the raw request body.
 */
const verifyWebhookSignature = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret || !signature || !Buffer.isBuffer(rawBody)) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest();

  let received;

  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

/**
 * Verify Razorpay Checkout payment signature.
 */
const verifyCheckoutSignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !secret ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest();

  let received;

  try {
    received = Buffer.from(razorpaySignature, "hex");
  } catch {
    return false;
  }

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

/**
 * Handle Razorpay QR-code payment webhook.
 *
 * server.js must register this route with express.raw()
 * before express.json() middleware.
 */
const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature.",
    });
  }

  let event;

  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook JSON.",
    });
  }

  // This handler processes QR payments only.
  if (event.event !== "qr_code.credited") {
    return res.status(200).json({ received: true });
  }

  try {
    const qrCodeId = event.payload?.qr_code?.entity?.id;

    if (!qrCodeId) {
      return res.status(200).json({ received: true });
    }

    const order = await Order.findOne({
      razorpayQrCodeId: qrCodeId,
      paymentMethod: "online",
    });

    if (!order || order.paymentStatus === "paid") {
      return res.status(200).json({ received: true });
    }

    const result = await razorpay.qrCode.fetchPayments(qrCodeId);
    const payments = result.items || [];

    const expectedAmount = Math.round(
      Number(order.totalAmount) * 100
    );

    const payment = payments.find(
      (item) =>
        item.status === "captured" &&
        Number(item.amount) === expectedAmount &&
        item.currency === "INR"
    );

    if (!payment) {
      return res.status(200).json({ received: true });
    }

    // Idempotent update prevents duplicate webhook processing.
    await Order.updateOne(
      {
        _id: order._id,
        paymentStatus: "pending",
        paymentMethod: "online",
        razorpayQrCodeId: qrCodeId,
      },
      {
        $set: {
          paymentStatus: "paid",
          paymentReference: payment.id,
        },
      }
    );

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Razorpay QR webhook error:", error.message);

    // Razorpay can retry after a transient server error.
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  }
};

/**
 * Verify Card / UPI payment from Razorpay Checkout.
 *
 * Requires:
 * - An authenticated customer
 * - Order.razorpayOrderId saved during order creation
 * - A valid Razorpay Checkout signature
 */
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing.",
      });
    }

    if (!/^[a-fA-F0-9]{24}$/.test(String(orderId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const customerId = req.customer?._id || req.customer?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication is required.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: customerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.paymentMethod !== "online") {
      return res.status(400).json({
        success: false,
        message: "This order does not use online payment.",
      });
    }

    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order does not match this order.",
      });
    }

    if (
      !verifyCheckoutSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Fetch payment independently from Razorpay.
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      Number(payment.amount) !==
        Math.round(Number(order.totalAmount) * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match the order.",
      });
    }

    // Only captured payments count as paid.
    if (payment.status !== "captured") {
      return res.status(409).json({
        success: false,
        paymentStatus: payment.status,
        message:
          "Payment has not been captured yet. Please check again shortly.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment has already been verified.",
        order,
      });
    }

    if (
      order.status === "cancelled" ||
      order.paymentStatus === "refunded"
    ) {
      return res.status(409).json({
        success: false,
        message: "This order cannot be marked as paid.",
      });
    }

    // Conditional update protects against concurrent requests.
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        customer: customerId,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: "pending",
        status: { $ne: "cancelled" },
      },
      {
        $set: {
          paymentStatus: "paid",
          paymentReference: razorpay_payment_id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedOrder) {
      const latestOrder = await Order.findById(order._id);

      if (latestOrder?.paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          message: "Payment has already been verified.",
          order: latestOrder,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Order payment status changed. Please refresh.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Razorpay payment verification error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment right now.",
    });
  }
};

module.exports = {
  handleRazorpayWebhook,
  verifyRazorpayPayment,
};
