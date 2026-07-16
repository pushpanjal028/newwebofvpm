import User from "../../models/User.js";

export const submitPaymentReceiptService = async (emailOrPhone, transactionId, file) => {
  if (!emailOrPhone || !transactionId) {
    throw new Error("Email or Phone and Transaction/Reference ID are required.");
  }

  if (!file) {
    throw new Error("Payment screenshot is required.");
  }

  // Check duplicate transaction ID
  const duplicateTxn = await User.findOne({ paymentReferenceId: transactionId });
  if (duplicateTxn) {
    throw new Error("This Transaction ID has already been submitted.");
  }

  // Find member
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!user) {
    throw new Error("No registered member found with this Email or Phone.");
  }

  user.paymentReferenceId = transactionId;
  user.paymentScreenshot = `/uploads/${file.filename}`;
  user.paymentStatus = "verification_pending";

  await user.save();

  return { message: "Payment receipt submitted successfully. Verification pending." };
};
