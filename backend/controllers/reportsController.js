
const Order = require("../models/Order");

const parseDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

    const date = new Date(`${value}T00:00:00+05:30`);

    if (
        Number.isNaN(date.getTime()) ||
        new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(date) !== value
    ) {
        return null;
    }

    return date;
};

const getRevenueMatch = (dateFilter) => ({
    ...dateFilter,
    $or: [
        { paymentStatus: "paid" },
        { paymentMethod: "cod", status: "delivered" },
    ],
});

const revenueEligibleExpression = {
    $or: [
        { $eq: ["$paymentStatus", "paid"] },
        {
            $and: [
                { $eq: ["$paymentMethod", "cod"] },
                { $eq: ["$status", "delivered"] },
            ],
        },
    ],
};

const getRevenue = async (dateFilter) => {
    const result = await Order.aggregate([
        { $match: getRevenueMatch(dateFilter) },
        {
            $group: {
                _id: null,
                revenue: {
                    $sum: { $ifNull: ["$totalAmount", 0] },
                },
            },
        },
    ]);

    return result[0]?.revenue || 0;
};

const getOrderCount = (dateFilter) => Order.countDocuments(dateFilter);

const getAdminReports = async (req, res) => {
    try {
        const start = parseDate(req.query.startDate);
        const end = parseDate(req.query.endDate);

        if (!start || !end || start > end) {
            return res.status(400).json({
                success: false,
                message: "Provide valid startDate and endDate in YYYY-MM-DD format.",
            });
        }

        // Exclusive end boundary includes the entire selected end date.
        const endExclusive = new Date(end);
        endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

        const dateFilter = {
            createdAt: { $gte: start, $lt: endExclusive },
        };

        // Immediately preceding period with the same duration.
        const periodLength = endExclusive.getTime() - start.getTime();
        const previousEnd = new Date(start);
        const previousStart = new Date(start.getTime() - periodLength);

        const previousFilter = {
            createdAt: { $gte: previousStart, $lt: previousEnd },
        };

        const nonCancelledFilter = {
            ...dateFilter,
            status: { $ne: "cancelled" },
        };

        const [
            totalOrders,
            totalRevenue,
            previousOrders,
            previousRevenue,
            customersResult,
            productsSoldResult,
            statusCounts,
            monthlySales,
            topProducts,
            categorySales,
            paymentGroups,
        ] = await Promise.all([
            // Total order count includes cancelled orders.
            getOrderCount(dateFilter),
            getRevenue(dateFilter),
            getOrderCount(previousFilter),
            getRevenue(previousFilter),

            Order.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            $ifNull: [
                                "$customer",
                                {
                                    $ifNull: [
                                        "$customerEmail",
                                        { $ifNull: ["$customerMobile", "$_id"] },
                                    ],
                                },
                            ],
                        },
                    },
                },
                { $count: "total" },
            ]),

            // Product units count all non-cancelled orders, including unpaid ones.
            Order.aggregate([
                { $match: nonCancelledFilter },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: null,
                        units: {
                            $sum: { $ifNull: ["$items.quantity", 0] },
                        },
                    },
                },
            ]),

            Order.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),

            // Monthly order count matches totalOrders; revenue uses recognized payments.
            Order.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            year: {
                                $year: {
                                    date: "$createdAt",
                                    timezone: "Asia/Kolkata",
                                },
                            },
                            month: {
                                $month: {
                                    date: "$createdAt",
                                    timezone: "Asia/Kolkata",
                                },
                            },
                        },
                        orders: { $sum: 1 },
                        revenue: {
                            $sum: {
                                $cond: [
                                    revenueEligibleExpression,
                                    { $ifNull: ["$totalAmount", 0] },
                                    0,
                                ],
                            },
                        },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]),

            // Normalize product IDs to strings before grouping. MongoDB treats
            // ObjectId("...") and "..." as different values otherwise.
            Order.aggregate([
                { $match: nonCancelledFilter },
                { $unwind: "$items" },
                {
    $addFields: {
        normalizedProductId: {
            $toLower: {
                $trim: {
                    input: {
                        $convert: {
                            input: "$items.product",
                            to: "string",
                            onError: "",
                            onNull: "",
                        },
                    },
                },
            },
        },
    },
},
                {
                    $group: {
                        _id: "$normalizedProductId",
                        name: { $first: "$items.productName" },
                        units: {
                            $sum: { $ifNull: ["$items.quantity", 0] },
                        },
                        revenue: {
                            $sum: {
                                $cond: [
                                    revenueEligibleExpression,
                                    { $ifNull: ["$items.lineTotal", 0] },
                                    0,
                                ],
                            },
                        },
                    },
                },
                {
    $project: {
        _id: 1,
        name: 1,
        units: 1,
        revenue: 1,
        normalizedId: "$_id"
    }
},
                { $sort: { revenue: -1, units: -1 } },
                { $limit: 5 },
                {
                    $addFields: {
                        productObjectId: {
                            $convert: {
                                input: "$_id",
                                to: "objectId",
                                onError: null,
                                onNull: null,
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productObjectId",
                        foreignField: "_id",
                        as: "productDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$productDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $addFields: {
                        categoryObjectId: {
                            $convert: {
                                input: "$productDetails.category",
                                to: "objectId",
                                onError: null,
                                onNull: null,
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "categoryObjectId",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$categoryDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        name: 1,
                        productId: "$_id",
                        units: 1,
                        revenue: 1,
                        category: {
                            $ifNull: ["$categoryDetails.name", "Uncategorized"],
                        },
                    },
                },
            ]),

            // Category order counts include non-cancelled orders. Category revenue
            // follows the recognized-payment rule and uses item line totals.
            Order.aggregate([
                { $match: nonCancelledFilter },
                { $unwind: "$items" },
                {
                    $addFields: {
                        productObjectId: {
                            $convert: {
                                input: "$items.product",
                                to: "objectId",
                                onError: null,
                                onNull: null,
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productObjectId",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $unwind: {
                        path: "$product",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $addFields: {
                        categoryObjectId: {
                            $convert: {
                                input: "$product.category",
                                to: "objectId",
                                onError: null,
                                onNull: null,
                            },
                        },
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "categoryObjectId",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                {
                    $unwind: {
                        path: "$category",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $group: {
                        _id: {
                            categoryId: "$category._id",
                            categoryName: {
                                $ifNull: ["$category.name", "Uncategorized"],
                            },
                            orderId: "$_id",
                        },
                        revenue: {
                            $sum: {
                                $cond: [
                                    revenueEligibleExpression,
                                    { $ifNull: ["$items.lineTotal", 0] },
                                    0,
                                ],
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            categoryId: "$_id.categoryId",
                            categoryName: "$_id.categoryName",
                        },
                        revenue: { $sum: "$revenue" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { revenue: -1, orders: -1 } },
            ]),

            // All payment groups remain visible; only recognized payments add amount.
            Order.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            method: "$paymentMethod",
                            type: "$paymentType",
                        },
                        orders: { $sum: 1 },
                        amount: {
                            $sum: {
                                $cond: [
                                    revenueEligibleExpression,
                                    { $ifNull: ["$totalAmount", 0] },
                                    0,
                                ],
                            },
                        },
                    },
                },
                { $sort: { amount: -1, orders: -1 } },
            ]),
        ]);

        const revenueChange = previousRevenue
            ? Number(
                  (
                      ((totalRevenue - previousRevenue) / previousRevenue) *
                      100
                  ).toFixed(1)
              )
            : 0;

        const orderChange = previousOrders
            ? Number(
                  (
                      ((totalOrders - previousOrders) / previousOrders) *
                      100
                  ).toFixed(1)
              )
            : 0;

        const ordersByStatus = {
            placed: 0,
            confirmed: 0,
            processing: 0,
            packed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
        };

        statusCounts.forEach(({ _id, count }) => {
            if (Object.prototype.hasOwnProperty.call(ordersByStatus, _id)) {
                ordersByStatus[_id] = count;
            }
        });

        const statusTotal = statusCounts.reduce(
            (sum, item) => sum + item.count,
            0
        );

        const orderStatusData = Object.entries(ordersByStatus).map(
            ([status, count]) => ({
                status,
                count,
                percentage: statusTotal
                    ? Number(((count / statusTotal) * 100).toFixed(1))
                    : 0,
            })
        );

        const paymentLabels = {
            cod: "Cash on Delivery",
            online: "Online",
        };

        const totalPaymentAmount = paymentGroups.reduce(
            (sum, item) => sum + item.amount,
            0
        );

        const paymentData = paymentGroups.map((item) => ({
            method:
                paymentLabels[item._id.method] ||
                item._id.method ||
                "Unknown",
            paymentType: item._id.type || "unknown",
            orders: item.orders,
            amount: item.amount,
            percentage: totalPaymentAmount
                ? Number(
                      ((item.amount / totalPaymentAmount) * 100).toFixed(1)
                  )
                : 0,
        }));

        const totalCategoryRevenue = categorySales.reduce(
            (sum, item) => sum + item.revenue,
            0
        );

        const formattedCategorySales = categorySales.map((item) => ({
            name: item._id.categoryName,
            orders: item.orders,
            revenue: item.revenue,
            percentage: totalCategoryRevenue
                ? Number(
                      ((item.revenue / totalCategoryRevenue) * 100).toFixed(1)
                  )
                : 0,
        }));

        const deliveryMetrics = [
            { label: "Delivered", value: ordersByStatus.delivered },
            {
                label: "In Progress",
                value:
                    ordersByStatus.processing +
                    ordersByStatus.packed +
                    ordersByStatus.shipped,
            },
            { label: "Cancelled", value: ordersByStatus.cancelled },
        ];

        return res.status(200).json({
            success: true,
            data: {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                summary: {
                    revenue: totalRevenue,
                    orders: totalOrders,
                    customers: customersResult[0]?.total || 0,
                    productsSold: productsSoldResult[0]?.units || 0,
                    previousRevenue,
                    previousOrders,
                    revenueChange,
                    orderChange,
                },
                monthlySales: monthlySales.map((item) => ({
                    month: `${item._id.year}-${String(
                        item._id.month
                    ).padStart(2, "0")}`,
                    revenue: item.revenue,
                    orders: item.orders,
                })),
                topProducts,
                categorySales: formattedCategorySales,
                paymentData,
                orderStatusData,
                deliveryMetrics,
            },
        });
    } catch (error) {
        console.error("Admin reports error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to generate reports.",
        });
    }
};

module.exports = { getAdminReports };
