import mongoose from "mongoose";

const paymentDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accountHolderName: {
      type: String,
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    IFSC: {
      type: String,
    },
    UPI: {
      type: String,
    },
    qrCodeReference: {
      type: String,
    },
    verificationStatus: {
      type: String,
      enum: ["not_added", "added", "verified", "needs_update"],
      default: "not_added",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const PaymentDetails = mongoose.models.PaymentDetails || mongoose.model("PaymentDetails", paymentDetailsSchema);
export default PaymentDetails;
