
require("dotenv").config();

const mongoose = require("mongoose");

const TARGETS = {
    applesProduct: "6adb00535eb88c1b0d03fb8e",

    dairyProduct: "6adf3d7fb3c29fc61253a5b2",
    dairyVariant500g: "6adf3fb0b3c29fc61253a5b3",
    dairyVariant1kg: "6adf401fb3c29fc61253a5c0",

    orphanProduct: "6ad0b5d59895115972e9fd07",
    orphanInventory: "6ad0b7009895115972e9fd08",
};

const targetEntries = Object.entries(TARGETS);

function getId(value) {
    if (!value) return null;

    if (value instanceof mongoose.Types.ObjectId) {
        return value.toString();
    }

    if (
        typeof value === "object" &&
        value._id instanceof mongoose.Types.ObjectId
    ) {
        return value._id.toString();
    }

    return null;
}

function findMatches(value, path = "", matches = []) {
    if (value === null || value === undefined) {
        return matches;
    }

    if (
        value instanceof mongoose.Types.ObjectId
    ) {
        const found = targetEntries.find(
            ([, targetId]) =>
                targetId === value.toString()
        );

        if (found) {
            matches.push({
                target: found[0],
                path,
            });
        }

        return matches;
    }

    if (Array.isArray(value)) {
        value.forEach((item, index) => {
            findMatches(
                item,
                `${path}[${index}]`,
                matches
            );
        });

        return matches;
    }

    if (typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
            findMatches(
                child,
                path ? `${path}.${key}` : key,
                matches
            );
        }

        return matches;
    }

    if (typeof value === "string") {
        const found = targetEntries.find(
            ([, targetId]) => targetId === value
        );

        if (found) {
            matches.push({
                target: found[0],
                path,
            });
        }
    }

    return matches;
}

async function runVerification() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI missing from .env");
        }

        await mongoose.connect(process.env.MONGO_URI);

        const db = mongoose.connection.db;

        console.log("\n====================================");
        console.log(" INVENTORY REFERENCE VERIFICATION");
        console.log("====================================");
        console.log("Database:", db.databaseName);
        console.log("Mode: READ ONLY\n");

        const collections = await db
            .listCollections({}, { nameOnly: true })
            .toArray();

        const report = {
            targetIds: TARGETS,
            collectionMatches: [],
            inventoryRecords: [],
            historyRecords: [],
            collectionNames: collections.map(
                (collection) => collection.name
            ),
        };

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;

            const collection = db.collection(collectionName);

            const cursor = collection.find({});

            while (await cursor.hasNext()) {
                const document = await cursor.next();

                const matches = findMatches(document);

                if (matches.length === 0) continue;

                const uniqueMatches = [
                    ...new Map(
                        matches.map((match) => [
                            `${match.target}:${match.path}`,
                            match,
                        ])
                    ).values(),
                ];

                const result = {
                    collection: collectionName,
                    documentId: getId(document._id),
                    matches: uniqueMatches,
                };

                report.collectionMatches.push(result);

                if (collectionName === "inventories") {
                    report.inventoryRecords.push({
                        documentId: getId(document._id),
                        product: getId(document.product),
                        variantId: getId(document.variantId),
                        variantLabel: document.variantLabel || "",
                        stockQuantity: document.stockQuantity,
                        reservedQuantity:
                            document.reservedQuantity ?? 0,
                        matches: uniqueMatches,
                    });
                }

                if (
                    collectionName === "inventoryhistories" ||
                    collectionName === "inventoryhistories"
                ) {
                    report.historyRecords.push({
                        documentId: getId(document._id),
                        product: getId(document.product),
                        inventory: getId(document.inventory),
                        variantId: getId(document.variantId),
                        changeType: document.changeType,
                        quantityChange: document.quantityChange,
                        previousStock: document.previousStock,
                        newStock: document.newStock,
                        matches: uniqueMatches,
                    });
                }
            }
        }

        console.log("\n========== COLLECTION NAMES ==========");
        console.log(
            JSON.stringify(report.collectionNames, null, 2)
        );

        console.log("\n========== INVENTORY RECORDS ==========");
        console.log(
            JSON.stringify(report.inventoryRecords, null, 2)
        );

        console.log("\n========== INVENTORY HISTORY REFERENCES ==========");
        console.log(
            JSON.stringify(report.historyRecords, null, 2)
        );

        console.log("\n========== ALL COLLECTION MATCHES ==========");
        console.log(
            JSON.stringify(report.collectionMatches, null, 2)
        );

        console.log("\n====================================");
        console.log("VERIFICATION COMPLETED");
        console.log("NO DATABASE CHANGES MADE");
        console.log("====================================\n");
    } catch (error) {
        console.error("Verification failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();
