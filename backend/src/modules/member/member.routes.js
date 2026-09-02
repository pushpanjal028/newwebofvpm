import express from "express";
import auth from "../../middlewares/auth.js";
import {
  getPublicMembers,
  verifyMembershipId,
  getMemberStatus,
  getCoordinatorDashboard,
} from "./member.controller.js";

const router = express.Router();

router.get("/coordinator", auth, getCoordinatorDashboard);
router.get("/", getPublicMembers);
router.get("/verify/:membershipId", verifyMembershipId);
router.get("/status/:emailOrPhone", getMemberStatus);

export default router;
