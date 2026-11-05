
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalOrders,
            revenueResult,
            statusCounts,
            recentOrders
        ] = await Promise.all([
            Order.countDocuments(),

            Order.aggregate([
                { $match: { status: { $ne: "cancelled" } } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                }
            ]),

            Order.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),

            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select(
                    "orderNumber customerName items totalAmount status createdAt"
                )
                .lean()
        ]);

        const ordersByStatus = {
            placed: 0,
            confirmed: 0,
            processing: 0,
            packed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        statusCounts.forEach(({ _id, count }) => {
            if (Object.prototype.hasOwnProperty.call(ordersByStatus, _id)) {
                ordersByStatus[_id] = count;
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalRevenue: revenueResult[0]?.totalRevenue || 0,
                ordersByStatus,
                recentOrders
            }
        });
    } catch (error) {
        console.error("Dashboard statistics error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve dashboard statistics."
        });
    }
};

module.exports = { getDashboardStats };
