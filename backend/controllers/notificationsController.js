
const mongoose = require("mongoose");
const Notification = require("../models/Notifications");
const Customer = require("../models/Customer");

// -----------------------------------------------------
// COMMON HELPERS
// -----------------------------------------------------

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// -----------------------------------------------------
// CUSTOMER NOTIFICATIONS
// -----------------------------------------------------

// GET /api/notifications/customer
const getCustomerNotifications = async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return sendError(res, 401, "Customer authentication required.");
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );

    const filter = {
      recipientType: "customer",
      customer: customerId,
    };

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        ...filter,
        isRead: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get customer notifications error:", error);
    return sendError(res, 500, "Unable to fetch customer notifications.");
  }
};

// PATCH /api/notifications/customer/:id/read
const markCustomerNotificationRead = async (req, res) => {
  try {
    const customerId = req.customer?._id;
    const { id } = req.params;

    if (!customerId) {
      return sendError(res, 401, "Customer authentication required.");
    }

    if (!isValidId(id)) {
      return sendError(res, 400, "Invalid notification ID.");
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipientType: "customer",
        customer: customerId,
      },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, "Notification not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark customer notification read error:", error);
    return sendError(res, 500, "Unable to update notification.");
  }
};

// PATCH /api/notifications/customer/read-all
const markAllCustomerNotificationsRead = async (req, res) => {
  try {
    const customerId = req.customer?._id;

    if (!customerId) {
      return sendError(res, 401, "Customer authentication required.");
    }

    const result = await Notification.updateMany(
      {
        recipientType: "customer",
        customer: customerId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All customer notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all customer notifications read error:", error);
    return sendError(res, 500, "Unable to update notifications.");
  }
};

// DELETE /api/notifications/customer/:id
const deleteCustomerNotification = async (req, res) => {
  try {
    const customerId = req.customer?._id;
    const { id } = req.params;

    if (!customerId) {
      return sendError(res, 401, "Customer authentication required.");
    }

    if (!isValidId(id)) {
      return sendError(res, 400, "Invalid notification ID.");
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientType: "customer",
      customer: customerId,
    });

    if (!notification) {
      return sendError(res, 404, "Notification not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete customer notification error:", error);
    return sendError(res, 500, "Unable to delete notification.");
  }
};

// -----------------------------------------------------
// ADMIN NOTIFICATIONS
// -----------------------------------------------------

// GET /api/notifications/admin
const getAdminNotifications = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );

    const filter = {
      recipientType: "admin",
    };

    if (req.query.type && req.query.type !== "all") {
      filter.notificationType = req.query.type;
    }

    if (req.query.status === "read") {
      filter.isRead = true;
    } else if (req.query.status === "unread") {
      filter.isRead = false;
    }

    const [notifications, total, unreadCount, orderAlerts] =
      await Promise.all([
        Notification.find(filter)
          .sort({ created_at: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),

        Notification.countDocuments(filter),

        Notification.countDocuments({
          ...filter,
          isRead: false,
        }),

        Notification.countDocuments({
          recipientType: "admin",
          notificationType: "order",
          isRead: false,
        }),
      ]);

    return res.status(200).json({
      success: true,
      notifications,
      total,
      unreadCount,
      orderAlerts,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get admin notifications error:", error);
    return sendError(res, 500, "Unable to fetch admin notifications.");
  }
};

// PATCH /api/notifications/admin/:id/read
const updateAdminNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    if (!isValidId(id)) {
      return sendError(res, 400, "Invalid notification ID.");
    }

    if (typeof isRead !== "boolean") {
      return sendError(res, 400, "isRead must be true or false.");
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipientType: "admin",
      },
      { $set: { isRead } },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, "Notification not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Notification status updated.",
      notification,
    });
  } catch (error) {
    console.error("Update admin notification error:", error);
    return sendError(res, 500, "Unable to update notification.");
  }
};

// PATCH /api/notifications/admin/read-all
const markAllAdminNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipientType: "admin",
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All admin notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all admin notifications read error:", error);
    return sendError(res, 500, "Unable to update notifications.");
  }
};

// DELETE /api/notifications/admin/:id
const deleteAdminNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "Invalid notification ID.");
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientType: "admin",
    });

    if (!notification) {
      return sendError(res, 404, "Notification not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Admin notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin notification error:", error);
    return sendError(res, 500, "Unable to delete notification.");
  }
};

// POST /api/notifications/admin
const createAdminNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      notificationType = "system",
      referenceId = null,
      referenceType = null,
      metadata = {},
    } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return sendError(res, 400, "Title and message are required.");
    }

    const notification = await Notification.create({
      recipientType: "admin",
      customer: null,
      title: title.trim(),
      message: message.trim(),
      notificationType,
      referenceId,
      referenceType,
      metadata,
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: "Admin notification created successfully.",
      notification,
    });
  } catch (error) {
    console.error("Create admin notification error:", error);
    return sendError(res, 500, "Unable to create admin notification.");
  }
};

// GET /api/notifications/admin/unread-count
const getAdminUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipientType: "admin",
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Get admin unread count error:", error);
    return sendError(res, 500, "Unable to fetch unread count.");
  }
};

// -----------------------------------------------------
// ADMIN BROADCAST TO ALL ACTIVE CUSTOMERS
// -----------------------------------------------------

// POST /api/notifications/admin/broadcast
const broadcastCustomerNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      notificationType = "marketing",
    } = req.body;

    const allowedTypes = [
      "order",
      "inventory",
      "customer",
      "payment",
      "review",
      "delivery",
      "marketing",
      "system",
    ];

    if (typeof title !== "string" || !title.trim()) {
      return sendError(res, 400, "Notification title is required.");
    }

    if (typeof message !== "string" || !message.trim()) {
      return sendError(res, 400, "Notification message is required.");
    }

    if (title.trim().length > 150) {
      return sendError(res, 400, "Title cannot exceed 150 characters.");
    }

    if (message.trim().length > 2000) {
      return sendError(res, 400, "Message cannot exceed 2000 characters.");
    }

    if (!allowedTypes.includes(notificationType)) {
      return sendError(res, 400, "Invalid notification type.");
    }

    // Only active customers receive broadcast notifications.
    const activeCustomers = await Customer.find({
      status: "active",
    })
      .select("_id")
      .lean();

    if (activeCustomers.length === 0) {
      return res.status(200).json({
        success: true,
        sentCount: 0,
        message: "No active customers found. Notification was not sent.",
      });
    }

    const notificationDocuments = activeCustomers.map((customer) => ({
      recipientType: "customer",
      customer: customer._id,
      title: title.trim(),
      message: message.trim(),
      notificationType,
      isRead: false,
      metadata: {
        source: "admin_broadcast",
      },
    }));

    // Insert in batches to avoid sending one very large database operation.
    const batchSize = 500;
    let sentCount = 0;

    for (let index = 0; index < notificationDocuments.length; index += batchSize) {
      const batch = notificationDocuments.slice(index, index + batchSize);

      const inserted = await Notification.insertMany(batch, {
        ordered: true,
      });

      sentCount += inserted.length;
    }

    return res.status(201).json({
      success: true,
      sentCount,
      message: `Notification successfully sent to ${sentCount} active customers.`,
    });
  } catch (error) {
    console.error("Broadcast customer notification error:", error);
    return sendError(
      res,
      500,
      error.message || "Unable to send notification to customers."
    );
  }
};

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------

module.exports = {
  getCustomerNotifications,
  markCustomerNotificationRead,
  markAllCustomerNotificationsRead,
  deleteCustomerNotification,

  getAdminNotifications,
  updateAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
  createAdminNotification,
  getAdminUnreadCount,

  broadcastCustomerNotification,
};
