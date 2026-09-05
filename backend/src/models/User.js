
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
    documentProof: { type: String }, // ID/Document proof front side file path
    documentProofBack: { type: String }, // ID/Document proof back side file path

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
    paymentRejectionReason: { type: String },
    paymentNotes: { type: String },
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
    membershipRejectionReason: { type: String },

    // Role & Account Status
    isAdmin: { type: Boolean, default: false },
    adminRole: { 
      type: String, 
      enum: ["admin", "super_admin", "verification_admin", "content_admin", "support_admin", "read_only_admin"] 
    },
    accountStatus: { 
      type: String, 
      enum: ["active", "deactivated", "blocked"], 
      default: "active" 
    },

    // Referral System
    coordinatorCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Email Verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String },
    emailVerificationExpires: { type: Date },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ emailVerificationTokenHash: 1 }, { sparse: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
