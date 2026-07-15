
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    organization: { type: String },
    state: { type: String },
    city: { type: String },
    designation: { type: String },
    
    // Uploaded paths
    photo: { type: String }, // Profile photo file path
    documentProof: { type: String }, // ID/Document proof file path

    // Membership details
    membershipFee: { type: Number, default: 100 },
    paymentStatus: {
      type: String,
      enum: ["pending", "verification_pending", "paid", "rejected"],
      default: "pending",
    },
    paymentReferenceId: { type: String, unique: true, sparse: true },
    paymentScreenshot: { type: String },
    paymentVerifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Verification and ID Card
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    membershipId: { type: String, unique: true, sparse: true },
    issueDate: { type: Date },
    expiryDate: { type: Date },

    // Role
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
