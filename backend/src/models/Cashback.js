import mongoose from "mongoose";

const cashbackSchema = new mongoose.Schema(
  {
    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referralCount: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      default: 10,
    },
    amount: {
      type: Number,
      default: 500,
    },
    status: {
      type: String,
      enum: ["pending", "eligible", "processing", "paid", "rejected"],
      default: "eligible",
    },
    eligibleAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes
// A coordinator can only earn one cashback per threshold (e.g. one for 10 referrals)
cashbackSchema.index({ coordinatorId: 1, threshold: 1 }, { unique: true });

const Cashback = mongoose.models.Cashback || mongoose.model("Cashback", cashbackSchema);
export default Cashback;
