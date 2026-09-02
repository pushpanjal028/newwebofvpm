import mongoose from "mongoose";

const memberCardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    cardNumber: { type: String, required: true, unique: true },
    generatedAt: { type: Date, default: Date.now },
    validFrom: { type: Date },
    validUntil: { type: Date },
    pdfUrl: { type: String }, // Local path or S3 key
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },
    emailSentAt: { type: Date },
    emailSendStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    emailLastError: { type: String },
  },
  { timestamps: true }
);

const MemberCard = mongoose.models.MemberCard || mongoose.model("MemberCard", memberCardSchema);
export default MemberCard;
