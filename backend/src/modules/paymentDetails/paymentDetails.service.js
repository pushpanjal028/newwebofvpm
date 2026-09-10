import PaymentDetails from "../../models/PaymentDetails.js";

export const getPaymentDetailsService = async (userId) => {
  let details = await PaymentDetails.findOne({ userId });
  if (!details) {
    details = new PaymentDetails({ userId });
    await details.save();
  }
  return details;
};

export const updatePaymentDetailsService = async (userId, data) => {
  let details = await PaymentDetails.findOne({ userId });
  if (!details) {
    details = new PaymentDetails({ userId });
  }

  if (data.accountHolderName !== undefined) details.accountHolderName = data.accountHolderName;
  if (data.bankName !== undefined) details.bankName = data.bankName;
  if (data.accountNumber !== undefined) details.accountNumber = data.accountNumber;
  if (data.IFSC !== undefined) details.IFSC = data.IFSC;
  if (data.UPI !== undefined) details.UPI = data.UPI;
  if (data.qrCodePath !== undefined) details.qrCodeReference = data.qrCodePath;

  // Whenever user updates their payment details, reset status
  details.verificationStatus = "needs_update";

  await details.save();

  return { message: "Payment details updated successfully", details };
};
