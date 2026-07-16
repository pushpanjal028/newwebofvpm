import { submitPaymentReceiptService } from "./payment.service.js";

export const submitPaymentReceipt = async (req, res) => {
  try {
    const { emailOrPhone, transactionId, paymentScreenshot } = req.body;
    const result = await submitPaymentReceiptService(emailOrPhone, transactionId, paymentScreenshot);
    res.json(result);
  } catch (err) {
    console.error("❌ Payment submit controller error:", err);
    res.status(500).json({ message: err.message });
  }
};
