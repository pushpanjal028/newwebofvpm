import { getPaymentDetailsService, updatePaymentDetailsService } from "./paymentDetails.service.js";

export const getPaymentDetails = async (req, res) => {
  try {
    const result = await getPaymentDetailsService(req.user.id);
    res.json(result);
  } catch (err) {
    console.error("❌ Get payment details controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updatePaymentDetails = async (req, res) => {
  try {
    const { accountHolderName, bankName, accountNumber, IFSC, UPI, qrCodeReference } = req.body;

    const result = await updatePaymentDetailsService(req.user.id, {
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
    res.status(500).json({ message: err.message });
  }
};
