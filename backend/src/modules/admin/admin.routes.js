import express from "express";
import adminAuth from "../../middlewares/adminAuth.js";
import {
  getAdminStats,
  getMembers,
  getAuditLogs,
  updateMemberDetails,
  deleteMemberApplication,
  verifyPayment,
  verifyMembership,
} from "./admin.controller.js";

const router = express.Router();

// Apply admin auth middleware to all admin routes
router.use(adminAuth);

router.get("/stats", getAdminStats);
router.get("/members", getMembers);
router.get("/audit-logs", getAuditLogs);
router.put("/members/:id", updateMemberDetails);
router.delete("/members/:id", deleteMemberApplication);
router.post("/members/:id/verify-payment", verifyPayment);
router.post("/members/:id/verify-membership", verifyMembership);

export default router;
