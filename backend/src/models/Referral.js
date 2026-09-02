import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coordinatorCodeUsed: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "eligible", "rejected"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    eligibleAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes
// A user can only be referred ONCE
referralSchema.index({ referredUserId: 1 }, { unique: true });
// A user cannot be attributed to multiple coordinators
referralSchema.index({ coordinatorId: 1, referredUserId: 1 }, { unique: true });
// Fast lookups for dashboard & counting
referralSchema.index({ coordinatorId: 1, status: 1 });

const Referral = mongoose.models.Referral || mongoose.model("Referral", referralSchema);
export default Referral;
