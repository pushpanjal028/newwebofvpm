import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import dns from "node:dns/promises";
import app from "./app.js";
import User from "./models/User.js";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Ignore DNS config failures
}

dotenv.config();

// Connect to MongoDB and seed admin
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await seedAdmin();
  })
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Auto-seed admin user
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "info.vpm2006@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "adminvpm2006";

    const adminExists = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    if (!adminExists) {
      const newAdmin = new User({
        name: "Admin Assembly",
        email: adminEmail,
        password: hashedPassword,
        phone: "6393287185",
        isAdmin: true,
        paymentStatus: "paid",
        approvalStatus: "approved",
      });
      await newAdmin.save();
      console.log(`✅ Default admin account seeded: ${adminEmail}`);
    } else {
      adminExists.password = hashedPassword;
      adminExists.isAdmin = true;
      await adminExists.save();
      console.log(`✅ Admin account password updated/hashed: ${adminEmail}`);
    }
  } catch (err) {
    console.error("❌ Seeding admin error:", err);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
