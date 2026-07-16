import User from "../../models/User.js";

export const getPublicMembersService = async () => {
  return await User.find({
    paymentStatus: "paid",
    approvalStatus: "approved",
  }).select("name photo organization state city membershipId approvalStatus designation");
};

export const verifyMembershipIdService = async (membershipId) => {
  const member = await User.findOne({
    membershipId,
    approvalStatus: "approved",
  }).select("name photo organization state city membershipId approvalStatus designation issueDate expiryDate");

  if (!member) {
    throw new Error("Verification lookup failed: Member not found or unapproved.");
  }

  return member;
};

export const getMemberStatusService = async (emailOrPhone) => {
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  }).select("name photo organization state city designation paymentStatus approvalStatus membershipId issueDate expiryDate");

  if (!user) {
    throw new Error("Registration profile not found.");
  }

  return user;
};
