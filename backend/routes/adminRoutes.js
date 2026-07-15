import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import User from "../models/userModel.js";
import AuditLog from "../models/auditLogModel.js";

const router = express.Router();

// Apply admin auth middleware to all admin routes
router.use(adminAuth);

// Helper function to log actions
const logAdminAction = async (admin, action, targetUserId, details) => {
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

// 📊 GET ADMIN STATS
router.get("/stats", async (req, res) => {
  try {
    const totalRegistrations = await User.countDocuments({ isAdmin: false });
    const pendingPayments = await User.countDocuments({ paymentStatus: "verification_pending", isAdmin: false });
    const pendingApprovals = await User.countDocuments({ approvalStatus: "pending", paymentStatus: "paid", isAdmin: false });
    const approvedMembers = await User.countDocuments({ approvalStatus: "approved", isAdmin: false });
    const rejectedMembers = await User.countDocuments({ approvalStatus: "rejected", isAdmin: false });

    res.json({
      totalRegistrations,
      pendingPayments,
      pendingApprovals,
      approvedMembers,
      rejectedMembers,
    });
  } catch (err) {
    console.error("❌ Stats fetch error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔎 GET MEMBERS (PAGINATED WITH FILTERS & SEARCH)
router.get("/members", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const paymentStatus = req.query.paymentStatus || "";
    const approvalStatus = req.query.approvalStatus || "";

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

    res.json({
      members,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("❌ Members fetch error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 📝 GET AUDIT LOGS (PAGINATED)
router.get("/audit-logs", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate("targetUserId", "name email")
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit);

    res.json({
      logs,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("❌ Audit logs fetch error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔧 EDIT MEMBER DETAILS
router.put("/members/:id", async (req, res) => {
  try {
    const { name, phone, organization, state, city, designation } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.organization = organization !== undefined ? organization : user.organization;
    user.state = state || user.state;
    user.city = city || user.city;
    user.designation = designation || user.designation;

    await user.save();

    await logAdminAction(req.user, "MEMBER_EDITED", user._id, { name, phone, organization, state, city, designation });

    res.json({ message: "Member details updated successfully", user });
  } catch (err) {
    console.error("❌ Member update error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🗑️ DELETE APPLICATION
router.delete("/members/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAdminAction(req.user, "MEMBER_DELETED", user._id, { name: user.name, email: user.email });

    res.json({ message: "Member application deleted successfully" });
  } catch (err) {
    console.error("❌ Member delete error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 💰 VERIFY UPI PAYMENT
router.post("/members/:id/verify-payment", async (req, res) => {
  try {
    const { status } = req.body; // status can be "paid" or "rejected"
    if (!["paid", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status. Must be 'paid' or 'rejected'." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.paymentStatus = status;
    user.paymentVerifiedAt = new Date();
    user.verifiedBy = req.user._id;

    await user.save();

    await logAdminAction(req.user, `PAYMENT_${status.toUpperCase()}`, user._id, {
      referenceId: user.paymentReferenceId,
    });

    res.json({ message: `Payment verified as: ${status}`, user });
  } catch (err) {
    console.error("❌ Payment verify error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🏷️ VERIFY MEMBERSHIP & GENERATE CARD ID
router.post("/members/:id/verify-membership", async (req, res) => {
  try {
    const { status } = req.body; // status can be "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid approval status. Must be 'approved' or 'rejected'." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    await logAdminAction(req.user, `MEMBERSHIP_${status.toUpperCase()}`, user._id, {
      membershipId: user.membershipId,
      expiryDate: user.expiryDate,
    });

    res.json({ message: `Membership status verified as: ${status}`, user });
  } catch (err) {
    console.error("❌ Membership verify error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
