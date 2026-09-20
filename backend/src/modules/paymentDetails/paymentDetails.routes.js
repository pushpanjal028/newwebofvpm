import express from "express";
import { getPaymentDetails, updatePaymentDetails } from "./paymentDetails.controller.js";
import auth from "../../middlewares/auth.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.get("/", auth, getPaymentDetails);

// Allow updating Payment Details (JSON with S3 keys)
router.put(
  "/",
  auth,
  updatePaymentDetails
);

export default router;
