import express from "express";
import { getPaymentDetails, updatePaymentDetails } from "./paymentDetails.controller.js";
import auth from "../../middlewares/auth.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.get("/", auth, getPaymentDetails);

// Allow uploading QR Code
router.put(
  "/",
  auth,
  upload.fields([{ name: "qrCode", maxCount: 1 }]),
  updatePaymentDetails
);

export default router;
