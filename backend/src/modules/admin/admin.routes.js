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
  getCashbacks,
  updateCashbackStatus,
  resetMemberPassword,
  forceEmailVerification,
  updateAccountStatus,
  getAdmins,
  createAdmin,
  updateAdminRole,
  deleteAdmin
} from "./admin.controller.js";

const router = express.Router();

// Apply admin auth middleware to all admin routes
router.use(adminAuth);

// Super Admin: Admin Management
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.put("/admins/:id/role", updateAdminRole);
router.delete("/admins/:id", deleteAdmin);

// General Dashboard
router.get("/stats", getAdminStats);
router.get("/members", getMembers);
router.get("/audit-logs", getAuditLogs);

// Member Actions
router.put("/members/:id", updateMemberDetails);
router.delete("/members/:id", deleteMemberApplication);
router.post("/members/:id/verify-payment", verifyPayment);
router.post("/members/:id/verify-membership", verifyMembership);

// Cashbacks
router.get("/cashbacks", getCashbacks);
router.put("/cashbacks/:id/status", updateCashbackStatus);

// Account Controls
router.post("/members/:id/reset-password", resetMemberPassword);
router.post("/members/:id/force-email-verification", forceEmailVerification);
router.put("/members/:id/account-status", updateAccountStatus);

export default router;
