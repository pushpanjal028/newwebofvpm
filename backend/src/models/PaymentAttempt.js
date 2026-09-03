import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  paymentAttemptId: {
    type: String,
    required: true,
    unique: true,
  },
  keys: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Automatically delete abandoned attempts after 24 hours (86400 seconds)
  },
});

const PaymentAttempt = mongoose.models.PaymentAttempt || mongoose.model("PaymentAttempt", attemptSchema);
export default PaymentAttempt;
