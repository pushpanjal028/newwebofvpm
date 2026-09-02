import crypto from "crypto";
import mongoose from "mongoose";
import User from "../../models/User.js";
import Referral from "../../models/Referral.js";
import MemberCard from "../../models/MemberCard.js";

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
  }).select("name photo organization state city membershipId approvalStatus designation issueDate expiryDate").lean();

  if (!member) {
    throw new Error("Verification lookup failed: Member not found or unapproved.");
  }
  
  const memberCard = await MemberCard.findOne({ userId: member._id });
  if (memberCard) {
    member.memberCard = memberCard;
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

export const getCoordinatorDashboardService = async (coordinatorId) => {
  let coordinator = await User.findById(coordinatorId).select("coordinatorCode");
  if (!coordinator) {
    throw new Error("Coordinator not found.");
  }

  // Auto-generate if missing for older users
  if (!coordinator.coordinatorCode) {
    let migrated = false;
    let attempts = 0;
    while (!migrated && attempts < 5) {
      attempts++;
      const newCode = "VPMH-" + crypto.randomBytes(3).toString("hex").toUpperCase();
      try {
        const result = await User.updateOne(
          { _id: coordinator._id, $or: [{ coordinatorCode: { $exists: false } }, { coordinatorCode: null }, { coordinatorCode: "" }] },
          { $set: { coordinatorCode: newCode } }
        );
        if (result.modifiedCount > 0) {
          migrated = true;
          coordinator.coordinatorCode = newCode;
        } else {
          // another request might have migrated it
          coordinator = await User.findById(coordinatorId).select("coordinatorCode");
          migrated = true;
        }
      } catch (err) {
        if (err.code !== 11000) {
          throw err;
        }
      }
    }
  }

  // Get all referrals attributed to this coordinator
  const referrals = await Referral.find({ coordinatorId })
    .populate("referredUserId", "name createdAt")
    .sort({ createdAt: -1 });

  let totalReferrals = 0;
  let pendingReferrals = 0;
  let eligibleReferrals = 0;

  const history = referrals.map((ref) => {
    totalReferrals++;
    if (ref.status === "eligible") {
      eligibleReferrals++;
    } else {
      pendingReferrals++; // includes "pending" or any other non-eligible status
    }

    return {
      memberName: ref.referredUserId ? ref.referredUserId.name : "Unknown Member",
      date: ref.createdAt,
      status: ref.status,
    };
  });

  const threshold = 10;
  const progress = Math.min((eligibleReferrals / threshold) * 100, 100);

  return {
    coordinatorCode: coordinator.coordinatorCode,
    totalReferrals,
    pendingReferrals,
    eligibleReferrals,
    threshold,
    progress,
    cashbackAmount: 500, // Hardcoded for this phase
    history,
  };
};
