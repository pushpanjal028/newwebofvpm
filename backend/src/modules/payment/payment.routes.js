import express from "express";
import { submitPaymentReceipt } from "./payment.controller.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.post("/submit", upload.single("paymentScreenshot"), submitPaymentReceipt);

export default router;
