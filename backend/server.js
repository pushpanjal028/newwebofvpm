// app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/userModel.js";
import dns from "node:dns/promises";
dns.setServers(["8.8.8.8","1.1.1.1"]);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

app.use("/api/auth", authRoutes);

app.get("/api/members", async (req, res) => {
  try {
    const users = await User.find(); // assuming your model is named "User"
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});


app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});



app.get("/api/members", async (req, res) => {
  try {
    const members = await User.find({
      paymentStatus: "paid",
      approvalStatus: "approved",
    }).select("name photo organization");

    res.json(members);
  } catch (error) {
    console.error("❌ Fetch members error:", error);
    res.status(500).json({ message: "Failed to fetch members" });
  }
});
