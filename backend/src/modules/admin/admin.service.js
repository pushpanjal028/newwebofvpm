import User from "../../models/User.js";
import AuditLog from "../../models/AuditLog.js";
import Referral from "../../models/Referral.js";
import Cashback from "../../models/Cashback.js";
import mongoose from "mongoose";
import transporter from "../../config/mailer.js";

// Helper function to log actions
export const logAdminAction = async (admin, action, targetUserId, details) => {
  try {
    const newLog = new AuditLog({
      adminId: admin._id,
      adminEmail: admin.email,
      action,
      targetUserId,
      details,
    });
    await newLog.save();
  } catch (err) {
    console.error("❌ Error writing audit log:", err);
  }
};

export const getAdminStatsService = async () => {
  const totalRegistrations = await User.countDocuments({ isAdmin: false });
  const pendingPayments = await User.countDocuments({ paymentStatus: "verification_pending", isAdmin: false });
  const pendingApprovals = await User.countDocuments({ approvalStatus: "pending", paymentStatus: "paid", isAdmin: false });
  const approvedMembers = await User.countDocuments({ approvalStatus: "approved", isAdmin: false });
  const rejectedMembers = await User.countDocuments({ approvalStatus: "rejected", isAdmin: false });

  return {
    totalRegistrations,
    pendingPayments,
    pendingApprovals,
    approvedMembers,
    rejectedMembers,
  };
};

export const getMembersService = async ({ page, limit, search, paymentStatus, approvalStatus }) => {
  const query = { isAdmin: false };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { organization: { $regex: search, $options: "i" } },
      { state: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (approvalStatus) {
    query.approvalStatus = approvalStatus;
  }

  const skipIndex = (page - 1) * limit;

  const total = await User.countDocuments(query);
  const members = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    members,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

export const getAuditLogsService = async ({ page, limit }) => {
  const skipIndex = (page - 1) * limit;

  const total = await AuditLog.countDocuments();
  const logs = await AuditLog.find()
    .populate("targetUserId", "name email")
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    logs,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

export const updateMemberDetailsService = async (adminUser, id, { name, phone, organization, state, city, designation }) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.organization = organization !== undefined ? organization : user.organization;
  user.state = state || user.state;
  user.city = city || user.city;
  user.designation = designation || user.designation;

  await user.save();

  await logAdminAction(adminUser, "MEMBER_EDITED", user._id, { name, phone, organization, state, city, designation });

  return { message: "Member details updated successfully", user };
};

export const deleteMemberApplicationService = async (adminUser, id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  await User.findByIdAndDelete(id);

  await logAdminAction(adminUser, "MEMBER_DELETED", user._id, { name: user.name, email: user.email });

  return { message: "Member application deleted successfully" };
};

export const verifyPaymentService = async (adminUser, id, status) => {
  if (!["paid", "rejected"].includes(status)) {
    throw new Error("Invalid payment status. Must be 'paid' or 'rejected'.");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  user.paymentStatus = status;
  user.paymentVerifiedAt = new Date();
  user.verifiedBy = adminUser._id;

  await user.save();

  await logAdminAction(adminUser, `PAYMENT_${status.toUpperCase()}`, user._id, {
    referenceId: user.paymentReferenceId,
  });

  if (status === "paid") {
    // Isolated hook to process referral and cashback safely
    processReferralEligibilityHook(user._id).catch((err) => {
      console.error("❌ Referral/Cashback hook failed (Payment already saved successfully):", err);
    });
  }

  return { message: `Payment verified as: ${status}`, user };
};

// Isolated Hook for Referral Eligibility & Cashback
async function processReferralEligibilityHook(userId) {
  const session = await mongoose.startSession();
  let emailData = null; // Store email tasks for AFTER commit

  try {
    session.startTransaction();

    // 1. Atomically claim the pending referral
    const referralUpdateResult = await Referral.updateOne(
      { referredUserId: userId, status: "pending" },
      { $set: { status: "eligible", paymentStatus: "paid", eligibleAt: new Date() } },
      { session }
    );

    // If no document was modified, the referral was already processed or doesn't exist
    if (referralUpdateResult.modifiedCount !== 1) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // We modified exactly one referral. Now check the coordinator's count.
    const referral = await Referral.findOne({ referredUserId: userId, status: "eligible" }).session(session);
    if (!referral) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const coordinatorId = referral.coordinatorId;
    const coordinator = await User.findById(coordinatorId).session(session);

    const eligibleCount = await Referral.countDocuments({
      coordinatorId,
      status: "eligible"
    }).session(session);

    emailData = {
      type: "REFERRAL_COUNTED",
      coordinatorEmail: coordinator?.email,
      coordinatorCode: coordinator?.coordinatorCode,
      eligibleCount,
      threshold: 10,
    };

    // 2. Check Cashback Eligibility (10 referrals)
    if (eligibleCount >= 10) {
      // Check if reward already exists
      const existingCashback = await Cashback.findOne({
        coordinatorId,
        threshold: 10
      }).session(session);

      if (!existingCashback) {
        // Create Cashback reward
        const cashback = new Cashback({
          coordinatorId,
          referralCount: eligibleCount,
          threshold: 10,
          amount: 500,
          status: "eligible",
        });
        
        try {
          await cashback.save({ session });
          emailData.type = "CASHBACK_EARNED";
          emailData.amount = 500;
        } catch (err) {
          // Handle duplicate key error gracefully if hit by race condition
          if (err.code === 11000) {
            console.warn("Cashback duplicate key hit, skipping creation.", err);
          } else {
            throw err;
          }
        }
      }
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ processReferralEligibilityHook aborted transaction:", err);
    throw err;
  } finally {
    session.endSession();
  }

  // 3. Post-Transaction Email Notifications
  if (emailData && emailData.coordinatorEmail) {
    try {
      if (emailData.type === "CASHBACK_EARNED") {
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: emailData.coordinatorEmail,
          subject: "Congratulations! You Are Eligible for ₹500 Cashback",
          text: `You have successfully reached ${emailData.threshold} eligible referrals! \n\nAmount: ₹${emailData.amount}\nStatus: Eligible\n\nThe administration team will review and process your cashback soon.`
        });
      } else if (emailData.type === "REFERRAL_COUNTED") {
        const remaining = Math.max(0, emailData.threshold - emailData.eligibleCount);
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: emailData.coordinatorEmail,
          subject: "Your VPMH Referral Has Been Counted",
          text: `Great news! A member you referred (${emailData.coordinatorCode}) has successfully completed their payment and your referral is now eligible.\n\nCurrent Eligible Referrals: ${emailData.eligibleCount}\nRemaining to reach ₹500 cashback: ${remaining}`
        });
      }
    } catch (emailErr) {
      console.error("❌ Email failed during referral hook, but DB state is safe:", emailErr);
    }
  }
};

export const verifyMembershipService = async (adminUser, id, status) => {
  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid approval status. Must be 'approved' or 'rejected'.");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  user.approvalStatus = status;

  if (status === "approved") {
    // Only generate membership ID if they don't have one yet
    if (!user.membershipId) {
      let sequence = 1001;
      // Find the last membershipId in the DB
      const lastUser = await User.findOne({
        membershipId: { $regex: /^VPMH-\d{4}-\d+$/ },
      }).sort({ membershipId: -1 });

      if (lastUser && lastUser.membershipId) {
        const parts = lastUser.membershipId.split("-");
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) {
          sequence = lastSeq + 1;
        }
      }

      const year = new Date().getFullYear();
      user.membershipId = `VPMH-${year}-${sequence}`;
    }

    // Set issue and expiry dates (e.g. valid for 1 year)
    user.issueDate = new Date();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year validity
    user.expiryDate = expiry;
  }

  await user.save();

  await logAdminAction(adminUser, `MEMBERSHIP_${status.toUpperCase()}`, user._id, {
    membershipId: user.membershipId,
    expiryDate: user.expiryDate,
  });

  return { message: `Membership status verified as: ${status}`, user };
};

export const getCashbacksService = async () => {
  const cashbacks = await Cashback.find().populate("coordinatorId", "name email phone coordinatorCode").sort({ createdAt: -1 });
  return cashbacks;
};

export const updateCashbackStatusService = async (adminUser, id, status) => {
  const validTransitions = {
    "eligible": ["processing", "rejected"],
    "processing": ["paid", "rejected"],
    "paid": [],
    "rejected": []
  };

  const cashback = await Cashback.findById(id);
  if (!cashback) {
    throw new Error("Cashback record not found");
  }

  if (!validTransitions[cashback.status] || !validTransitions[cashback.status].includes(status)) {
    throw new Error(`Invalid status transition from ${cashback.status} to ${status}`);
  }

  cashback.status = status;
  if (status === "paid") {
    cashback.processedAt = new Date();
  }

  await cashback.save();

  await logAdminAction(adminUser, `CASHBACK_${status.toUpperCase()}`, cashback.coordinatorId, {
    cashbackId: cashback._id,
    amount: cashback.amount,
  });

  return { message: `Cashback status updated to ${status}`, cashback };
};
