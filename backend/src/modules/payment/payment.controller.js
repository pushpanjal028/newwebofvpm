import { submitPaymentReceiptService } from "./payment.service.js";

export const submitPaymentReceipt = async (req, res) => {
  try {
    const { emailOrPhone, transactionId } = req.body;
    const result = await submitPaymentReceiptService(emailOrPhone, transactionId, req.file);
    res.json(result);
  } catch (err) {
    console.error("❌ Payment submit controller error:", err);
    res.status(500).json({ message: err.message });
  }
};
