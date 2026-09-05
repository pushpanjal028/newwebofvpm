import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "PAYMENT_APPROVED", "MEMBERSHIP_REJECTED", "MEMBER_EDITED"
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    deviceDetails: {
      type: String,
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
