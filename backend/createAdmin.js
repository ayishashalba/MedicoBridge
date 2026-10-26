require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const admin = await User.create({
            email: 'admin@medicobridge.com',
            password: 'admin123',
            role: 'Admin',
            isVerified: true,
            status: 'active',
        });

        console.log('Admin created:', admin.email);
        process.exit();
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const email = "admin@medicobridge.com";
        const password = "admin123";

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log("Admin account already exists.");

            await mongoose.disconnect();
            process.exit(0);
        }

        // IMPORTANT:
        // Give plain password here.
        // User model will hash it automatically.
        const admin = await User.create({
            email,
            password,
            role: "Admin",
            isVerified: true,
            status: "active",
        });

        console.log("Admin created successfully!");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);

        await mongoose.disconnect();
        process.exit(1);
    }
};

createAdmin();