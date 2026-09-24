import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import MemberCard from "./src/models/MemberCard.js";
import { verifyMembershipService } from "./src/modules/admin/admin.service.js";
import dns from "node:dns/promises";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {}

dotenv.config();

const testApproval = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vpmh_local");
  
  // 1. Find a user that is pending approval
  let user = await User.findOne({ email: "testmember_approve@example.com" });
  if (!user) {
    user = new User({
        name: "Test Member",
        email: "testmember_approve@example.com",
        phone: "9876543210",
        photo: "uploads/test.jpg",
        documentProof: "uploads/doc.jpg",
        paymentStatus: "paid"
    });
    await user.save();
    console.log("Created mock pending user.");
  } else {
    user.paymentStatus = "paid";
    user.photo = "uploads/test.jpg";
    user.documentProof = "uploads/doc.jpg";
    await user.save();
  }

  // 2. Mock Admin User
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
     console.log("No admin found to perform action.");
     process.exit(1);
  }

  // 3. Approve User
  console.log("Approving user:", user.email);
  try {
    const result = await verifyMembershipService(adminUser, user._id, { status: "approved" });
    console.log("Approval result:", result.message);
    
    if (result.user.memberCard) {
        console.log("Member card was successfully attached to the response:", result.user.memberCard);
    } else {
        console.log("Member card is MISSING from the response!");
    }
  } catch (err) {
    console.error("Error during approval:", err);
  }
  
  process.exit(0);
};

testApproval();
