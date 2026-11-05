
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Address = require("../models/Address");

const getAdminCustomers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 20)
        );
        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "").trim().toLowerCase();

        const filter = {};

        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );
            const searchRegex = new RegExp(escapedSearch, "i");

            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { mobile: searchRegex }
            ];
        }

        if (status && status !== "all") {
            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer status."
                });
            }

            filter.status = status;
        }

        const [customers, total, activeCount, inactiveCount] =
            await Promise.all([
                Customer.find(filter)
                    .select("-password")
                    .sort({ created_at: -1, _id: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),

                Customer.countDocuments(filter),
                Customer.countDocuments({ status: "active" }),
                Customer.countDocuments({ status: "inactive" })
            ]);

        const customerIds = customers.map((customer) => customer._id);

        const [orderStats, addresses] = await Promise.all([
            customerIds.length
                ? Order.aggregate([
                    {
                        $match: {
                            customer: { $in: customerIds }
                        }
                    },
                    {
                        $group: {
                            _id: "$customer",
                            totalOrders: {
                                $sum: {
                                    $cond: [
                                        { $ne: ["$status", "cancelled"] },
                                        1,
                                        0
                                    ]
                                }
                            },
                            totalSpending: {
                                $sum: {
                                    $cond: [
                                        { $ne: ["$status", "cancelled"] },
                                        { $ifNull: ["$totalAmount", 0] },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ])
                : Promise.resolve([]),

            customerIds.length
                ? Address.find({
                    customer: { $in: customerIds }
                })
                    .sort({ isDefault: -1, createdAt: -1 })
                    .lean()
                : Promise.resolve([])
        ]);

        const statsByCustomer = new Map(
            orderStats.map((item) => [
                String(item._id),
                {
                    totalOrders: item.totalOrders,
                    totalSpending: Math.round(
                        (item.totalSpending + Number.EPSILON) * 100
                    ) / 100
                }
            ])
        );

        const addressByCustomer = new Map();

        for (const address of addresses) {
            const customerId = String(address.customer);

            // Addresses are sorted with defaults first, then newest.
            if (!addressByCustomer.has(customerId)) {
                addressByCustomer.set(customerId, address);
            }
        }

        const result = customers.map((customer) => {
            const customerId = String(customer._id);
            const stats = statsByCustomer.get(customerId) || {
                totalOrders: 0,
                totalSpending: 0
            };
            const address = addressByCustomer.get(customerId);

            return {
                ...customer,
                id: customerId,
                registeredDate: customer.created_at,
                totalOrders: stats.totalOrders,
                totalSpending: stats.totalSpending,
                address: address
                    ? [
                        address.addressLine1,
                        address.addressLine2,
                        address.city,
                        address.state,
                        address.postalCode
                    ].filter(Boolean).join(", ")
                    : ""
            };
        });

        return res.status(200).json({
            success: true,
            count: result.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            stats: {
                totalCustomers: await Customer.countDocuments(),
                activeCustomers: activeCount,
                inactiveCustomers: inactiveCount
            },
            customers: result
        });
    } catch (error) {
        console.error("Admin customer list error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve customers."
        });
    }
};

const updateAdminCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = String(req.body?.status || "").trim().toLowerCase();

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID."
            });
        }

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive."
            });
        }

        const customer = await Customer.findByIdAndUpdate(
            id,
            { $set: { status } },
{ returnDocument: "after", runValidators: true }        ).select("-password");

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer status updated successfully.",
            customer
        });
    } catch (error) {
        console.error("Admin customer status update error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update customer status."
        });
    }
};

module.exports = {
    getAdminCustomers,
    updateAdminCustomerStatus
};
