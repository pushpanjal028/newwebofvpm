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
    grossAmount: {
      type: Number,
      default: 200,
    },
    processingFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 200,
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
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    isHistorical: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
// A coordinator can only earn one cashback per threshold (e.g. one for 10 referrals)
cashbackSchema.index({ coordinatorId: 1, threshold: 1 }, { unique: true });

const Cashback = mongoose.models.Cashback || mongoose.model("Cashback", cashbackSchema);
export default Cashback;
