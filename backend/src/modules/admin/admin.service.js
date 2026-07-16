import User from "../../models/User.js";
import AuditLog from "../../models/AuditLog.js";

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

  return { message: `Payment verified as: ${status}`, user };
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
