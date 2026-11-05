
require("dotenv").config();

const mongoose = require("mongoose");

const PRODUCT_IDS = [
    "6adb00535eb88c1b0d03fb8e", // Apples
    "6adf3d7fb3c29fc61253a5b2", // Dairy and Bakery
];

const ORPHAN_INVENTORY_ID =
    "6ad0b7009895115972e9fd08";

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const db = mongoose.connection.db;

        // 1. Existing inventory records
        const inventories = await db
            .collection("inventories")
            .find({
                $or: [
                    {
                        product: {
                            $in: PRODUCT_IDS.map(
                                (id) => new mongoose.Types.ObjectId(id)
                            ),
                        },
                    },
                    {
                        _id: new mongoose.Types.ObjectId(
                            ORPHAN_INVENTORY_ID
                        ),
                    },
                ],
            })
            .toArray();

        // 2. Existing orders involving these products
        const orders = await db
            .collection("orders")
            .find({
                "items.product": {
                    $in: PRODUCT_IDS.map(
                        (id) => new mongoose.Types.ObjectId(id)
                    ),
                },
            })
            .toArray();

        const orderReport = orders.map((order) => ({
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            paymentType: order.paymentType,
            items: (order.items || [])
                .filter((item) =>
                    PRODUCT_IDS.includes(
                        String(item.product)
                    )
                )
                .map((item) => ({
                    product: item.product,
                    variantId: item.variantId || null,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total,
                })),
        }));

        // 3. All history records linked to the orphan inventory
        const orphanHistory = await db
            .collection("inventoryhistories")
            .find({
                inventory: new mongoose.Types.ObjectId(
                    ORPHAN_INVENTORY_ID
                ),
            })
            .toArray();

        console.log("\n========== INVENTORIES ==========");
        console.log(JSON.stringify(inventories, null, 2));

        console.log("\n========== RELATED ORDERS ==========");
        console.log(JSON.stringify(orderReport, null, 2));

        console.log("\n========== ORPHAN INVENTORY HISTORY ==========");
        console.log(
            JSON.stringify(orphanHistory, null, 2)
        );

        console.log("\nREAD ONLY CHECK COMPLETED");
    } catch (error) {
        console.error("Inspection failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

inspect();
