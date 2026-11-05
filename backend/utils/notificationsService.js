
const Notification = require("../models/Notifications");
// =====================================================
// CREATE CUSTOMER NOTIFICATION
// =====================================================

const createCustomerNotification = async ({
  customerId,
  title,
  message,
  notificationType = "system",
  referenceId = null,
  referenceType = null,
  metadata = {},
}) => {
  try {
    if (!customerId) return null;

    return await Notification.create({
      recipientType: "customer",
      customer: customerId,
      title,
      message,
      notificationType,
      referenceId,
      referenceType,
      metadata,
    });
  } catch (error) {
    console.error(
      "Customer notification creation failed:",
      error.message
    );
    return null;
  }
};

// =====================================================
// CREATE ADMIN NOTIFICATION
// =====================================================

const createAdminNotification = async ({
  title,
  message,
  notificationType = "system",
  referenceId = null,
  referenceType = null,
  metadata = {},
}) => {
  try {
    return await Notification.create({
      recipientType: "admin",
      title,
      message,
      notificationType,
      referenceId,
      referenceType,
      metadata,
    });
  } catch (error) {
    console.error(
      "Admin notification creation failed:",
      error.message
    );
    return null;
  }
};

// =====================================================
// ORDER PLACED
// =====================================================

const notifyOrderPlaced = async (order) => {
  if (!order) return;

  const orderNumber = order.orderNumber || "Your order";

  await Promise.all([
    createCustomerNotification({
      customerId: order.customer,
      title: "Order placed successfully",
      message: `Your order ${orderNumber} has been created successfully. You can track its status from My Orders.`,
      notificationType: "order",
      referenceId: order._id,
      referenceType: "Order",
      metadata: {
        orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    }),

    createAdminNotification({
      title: "New Order Received",
      message: `A new order ${orderNumber} has been placed by ${order.customerName}.`,
      notificationType: "order",
      referenceId: order._id,
      referenceType: "Order",
      metadata: {
        orderNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    }),
  ]);
};

// =====================================================
// ORDER STATUS UPDATED
// =====================================================

const notifyOrderStatusUpdated = async (order) => {
  if (!order) return;

  const orderNumber = order.orderNumber || "Your order";

  const statusMessages = {
    confirmed: {
      title: "Order confirmed",
      message: `Your order ${orderNumber} has been confirmed.`,
    },
    processing: {
      title: "Order processing",
      message: `Your order ${orderNumber} is now being processed.`,
    },
    packed: {
      title: "Order packed",
      message: `Your order ${orderNumber} has been packed and is ready for dispatch.`,
    },
    shipped: {
      title: "Order out for delivery",
      message: `Your order ${orderNumber} has been shipped and is on its way.`,
    },
    delivered: {
      title: "Order delivered",
      message: `Your order ${orderNumber} has been delivered successfully.`,
    },
  };

  const notification = statusMessages[order.status];

  if (!notification) return;

  await createCustomerNotification({
    customerId: order.customer,
    title: notification.title,
    message: notification.message,
    notificationType: "order",
    referenceId: order._id,
    referenceType: "Order",
    metadata: {
      orderNumber,
      status: order.status,
    },
  });
};

// =====================================================
// ORDER CANCELLED
// =====================================================

const notifyOrderCancelled = async (order, reason) => {
  if (!order) return;

  const orderNumber = order.orderNumber || "Your order";
  const cancellationReason = reason || "Cancelled by admin";

  await Promise.all([
    createCustomerNotification({
      customerId: order.customer,
      title: "Order cancelled",
      message: `Your order ${orderNumber} has been cancelled. Reason: ${cancellationReason}.`,
      notificationType: "order",
      referenceId: order._id,
      referenceType: "Order",
      metadata: {
        orderNumber,
        status: "cancelled",
        reason: cancellationReason,
      },
    }),

    createAdminNotification({
      title: "Order Cancelled",
      message: `Order ${orderNumber} has been cancelled.`,
      notificationType: "order",
      referenceId: order._id,
      referenceType: "Order",
      metadata: {
        orderNumber,
        reason: cancellationReason,
      },
    }),
  ]);
};

// =====================================================
// INVENTORY STOCK STATUS
// =====================================================

const getStockStatus = (availableQuantity, threshold) => {
  if (availableQuantity <= 0) {
    return "out_of_stock";
  }

  if (availableQuantity <= threshold) {
    return "low_stock";
  }

  return "in_stock";
};

// =====================================================
// INVENTORY STOCK ALERT
// Creates notification only when stock enters a new
// low-stock or out-of-stock state.
// =====================================================

const notifyInventoryStockChanged = async ({
  productId,
  productName,
  previousAvailable,
  newAvailable,
  threshold,
}) => {
  try {
    if (!productId || !productName) return null;

    const currentAvailable = Math.max(0, Number(newAvailable) || 0);
    const lowStockThreshold = Math.max(0, Number(threshold) || 0);

    const previousQuantity =
      previousAvailable === null || previousAvailable === undefined
        ? null
        : Math.max(0, Number(previousAvailable) || 0);

    const currentStatus = getStockStatus(
      currentAvailable,
      lowStockThreshold
    );

    const previousStatus =
      previousQuantity === null
        ? "in_stock"
        : getStockStatus(previousQuantity, lowStockThreshold);

    // No notification when stock status has not changed.
    if (currentStatus === previousStatus) {
      return null;
    }

    if (currentStatus === "out_of_stock") {
      return await createAdminNotification({
        title: "Out of Stock Alert",
        message: `${productName} is now out of stock.`,
        notificationType: "inventory",
        referenceId: productId,
        referenceType: "Product",
        metadata: {
          productName,
          previousAvailable: previousQuantity,
          availableQuantity: currentAvailable,
          lowStockThreshold,
          stockStatus: currentStatus,
        },
      });
    }

    if (currentStatus === "low_stock") {
      return await createAdminNotification({
        title: "Low Stock Alert",
        message: `${productName} has only ${currentAvailable} units available. The low-stock threshold is ${lowStockThreshold}.`,
        notificationType: "inventory",
        referenceId: productId,
        referenceType: "Product",
        metadata: {
          productName,
          previousAvailable: previousQuantity,
          availableQuantity: currentAvailable,
          lowStockThreshold,
          stockStatus: currentStatus,
        },
      });
    }

    return null;
  } catch (error) {
    console.error(
      "Inventory notification failed:",
      error.message
    );
    return null;
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createCustomerNotification,
  createAdminNotification,
  notifyOrderPlaced,
  notifyOrderStatusUpdated,
  notifyOrderCancelled,
  notifyInventoryStockChanged,
};
