import { getPaymentDetailsService, updatePaymentDetailsService } from "./paymentDetails.service.js";

export const getPaymentDetails = async (req, res) => {
  try {
    const result = await getPaymentDetailsService(req.user._id);
    res.json(result);
  } catch (err) {
    console.error("❌ Get payment details controller error:", err);
    res.status(500).json({ message: err.message || "Failed to get payment details" });
  }
};

export const updatePaymentDetails = async (req, res) => {
  try {
    const { accountHolderName, bankName, accountNumber, IFSC, UPI, qrCodeReference } = req.body;

    const result = await updatePaymentDetailsService(req.user._id, {
      accountHolderName,
      bankName,
      accountNumber,
      IFSC,
      UPI,
      qrCodePath: qrCodeReference,
    });
    
    res.json(result);
  } catch (err) {
    console.error("❌ Update payment details controller error:", err);
    res.status(500).json({ message: err.message || "Failed to update payment details" });
  }
};
