import express from "express";
import {
  getPublicMembers,
  verifyMembershipId,
  getMemberStatus,
} from "./member.controller.js";

const router = express.Router();

router.get("/", getPublicMembers);
router.get("/verify/:membershipId", verifyMembershipId);
router.get("/status/:emailOrPhone", getMemberStatus);

export default router;
