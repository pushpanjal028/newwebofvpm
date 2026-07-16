import {
  getAdminStatsService,
  getMembersService,
  getAuditLogsService,
  updateMemberDetailsService,
  deleteMemberApplicationService,
  verifyPaymentService,
  verifyMembershipService,
} from "./admin.service.js";

export const getAdminStats = async (req, res) => {
  try {
    const result = await getAdminStatsService();
    res.json(result);
  } catch (err) {
    console.error("❌ Stats fetch controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const paymentStatus = req.query.paymentStatus || "";
    const approvalStatus = req.query.approvalStatus || "";

    const result = await getMembersService({ page, limit, search, paymentStatus, approvalStatus });
    res.json(result);
  } catch (err) {
    console.error("❌ Members fetch controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAuditLogsService({ page, limit });
    res.json(result);
  } catch (err) {
    console.error("❌ Audit logs fetch controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateMemberDetails = async (req, res) => {
  try {
    const { name, phone, organization, state, city, designation } = req.body;
    const result = await updateMemberDetailsService(req.user, req.params.id, {
      name,
      phone,
      organization,
      state,
      city,
      designation,
    });
    res.json(result);
  } catch (err) {
    console.error("❌ Member update controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteMemberApplication = async (req, res) => {
  try {
    const result = await deleteMemberApplicationService(req.user, req.params.id);
    res.json(result);
  } catch (err) {
    console.error("❌ Member delete controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await verifyPaymentService(req.user, req.params.id, status);
    res.json(result);
  } catch (err) {
    console.error("❌ Payment verify controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const verifyMembership = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await verifyMembershipService(req.user, req.params.id, status);
    res.json(result);
  } catch (err) {
    console.error("❌ Membership verify controller error:", err);
    res.status(500).json({ message: err.message });
  }
};
