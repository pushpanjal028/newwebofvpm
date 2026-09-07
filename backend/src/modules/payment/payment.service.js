import PaymentAttempt from "../../models/PaymentAttempt.js";
import User from "../../models/User.js";

export const submitPaymentReceiptService = async (emailOrPhone, transactionId, paymentScreenshot, paymentAttemptId) => {
  if (!emailOrPhone || !transactionId) {
    throw new Error("Email or Phone and Transaction/Reference ID are required.");
  }

  if (!paymentScreenshot) {
    throw new Error("Payment screenshot is required.");
  }

  if (!paymentAttemptId) {
    throw new Error("Payment attempt ID is required for security verification.");
  }

  const attempt = await PaymentAttempt.findOne({ paymentAttemptId });
  if (!attempt) {
    throw new Error("Payment attempt expired or invalid.");
  }

  const isValidScreenshot = attempt.keys.some(k => paymentScreenshot.endsWith(k));

  if (!isValidScreenshot) {
    throw new Error("Uploaded payment screenshot is invalid or does not belong to this session.");
  }

  const cleanInput = emailOrPhone.trim();
  // Find member (case-insensitive for email, exact for phone)
  const user = await User.findOne({
    $or: [
      { email: { $regex: new RegExp(`^${cleanInput}$`, "i") } }, 
      { phone: cleanInput }
    ],
  });

  if (!user) {
    throw new Error("No registered member found with this Email or Phone.");
  }

  // Check duplicate transaction ID (excluding the current user)
  const duplicateTxn = await User.findOne({ 
    paymentReferenceId: transactionId,
    _id: { $ne: user._id }
  });
  if (duplicateTxn) {
    throw new Error("This Transaction ID has already been submitted by another user.");
  }

  user.paymentReferenceId = transactionId;
  user.paymentScreenshot = paymentScreenshot;
  user.paymentStatus = "verification_pending";

  await user.save();

  return { message: "Payment receipt submitted successfully. Verification pending." };
};
