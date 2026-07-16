import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import User from "./models/userModel.js";
import dns from "node:dns/promises";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Ignore DNS config failures
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Restrict CORS to known frontend domains, supporting multiple development ports
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve uploads directory statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect to MongoDB and seed admin
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Public verified members endpoint
app.get("/api/members", async (req, res) => {
  try {
    const members = await User.find({
      paymentStatus: "paid",
      approvalStatus: "approved",
    }).select("name photo organization state city membershipId approvalStatus designation");

    res.json(members);
  } catch (error) {
    console.error("❌ Fetch members error:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// Public member lookup verification endpoint
app.get("/api/members/verify/:membershipId", async (req, res) => {
  try {
    const member = await User.findOne({
      membershipId: req.params.membershipId,
      approvalStatus: "approved",
    }).select("name photo organization state city membershipId approvalStatus designation issueDate expiryDate");

    if (!member) {
      return res.status(404).json({ message: "Verification lookup failed: Member not found or unapproved." });
    }

    res.json(member);
  } catch (error) {
    console.error("❌ Verification endpoint error:", error);
    res.status(500).json({ message: "Failed to verify membership ID." });
  }
});

// Public member status lookup endpoint
app.get("/api/members/status/:emailOrPhone", async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.params.emailOrPhone }, { phone: req.params.emailOrPhone }],
    }).select("name photo organization state city designation paymentStatus approvalStatus membershipId issueDate expiryDate");

    if (!user) {
      return res.status(404).json({ message: "Registration profile not found." });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Fetch status error:", error);
    res.status(500).json({ message: "Failed to fetch member registration status." });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
