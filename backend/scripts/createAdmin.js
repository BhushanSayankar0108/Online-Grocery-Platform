const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Admin = require("../models/Admin");

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = "admin@grocery.com";

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            email: adminEmail
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        // Create admin
        const admin = await Admin.create({
            name: "Super Admin",
            email: adminEmail,
            mobile: "9999999999",
            password: hashedPassword,
            role: "Super Admin",
            status: "Active"
        });

        console.log("Admin created successfully.");
        console.log("Email:", admin.email);
        console.log("Password: Admin@123");

        process.exit(0);

    } catch (error) {
        console.error("Failed to create admin:", error.message);
        process.exit(1);
    }
};

createAdmin();