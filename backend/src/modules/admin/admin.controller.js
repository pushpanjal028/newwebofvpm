import {
  getAdminStatsService,
  getMembersService,
  getAuditLogsService,
  updateMemberDetailsService,
  deleteMemberApplicationService,
  verifyPaymentService,
  verifyMembershipService,
  getCashbacksService,
  updateCashbackStatusService,
  resetMemberPasswordService,
  forceEmailVerificationService,
  updateAccountStatusService,
  getAdminsService,
  createAdminService,
  updateAdminRoleService,
  deleteAdminService
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
    const { name, phone, organization, state, city, designation, photo, documentProof } = req.body;
    const result = await updateMemberDetailsService(req.user, req.params.id, {
      name,
      phone,
      organization,
      state,
      city,
      designation,
      photo,
      documentProof,
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
    const { status, rejectionReason, notes } = req.body;
    const result = await verifyPaymentService(req.user, req.params.id, { status, rejectionReason, notes });
    res.json(result);
  } catch (err) {
    console.error("❌ Payment verify controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const verifyMembership = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const result = await verifyMembershipService(req.user, req.params.id, { status, rejectionReason });
    res.json(result);
  } catch (err) {
    console.error("❌ Membership verify controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCashbacks = async (req, res) => {
  try {
    const result = await getCashbacksService();
    res.json(result);
  } catch (err) {
    console.error("❌ Cashbacks fetch controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateCashbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await updateCashbackStatusService(req.user, req.params.id, status);
    res.json(result);
  } catch (err) {
    console.error("❌ Cashback status update controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const resetMemberPassword = async (req, res) => {
  try {
    const result = await resetMemberPasswordService(req.user, req.params.id);
    res.json(result);
  } catch (err) {
    console.error("❌ Reset member password controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const forceEmailVerification = async (req, res) => {
  try {
    const result = await forceEmailVerificationService(req.user, req.params.id);
    res.json(result);
  } catch (err) {
    console.error("❌ Force email verification controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateAccountStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await updateAccountStatusService(req.user, req.params.id, status);
    res.json(result);
  } catch (err) {
    console.error("❌ Update account status controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const result = await getAdminsService();
    res.json(result);
  } catch (err) {
    console.error("❌ Get admins controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { email, name, role, password } = req.body;
    const result = await createAdminService(req.user, { email, name, role, password });
    res.status(201).json(result);
  } catch (err) {
    console.error("❌ Create admin controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateAdminRole = async (req, res) => {
  try {
    const { role } = req.body;
    const result = await updateAdminRoleService(req.user, req.params.id, role);
    res.json(result);
  } catch (err) {
    console.error("❌ Update admin role controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const result = await deleteAdminService(req.user, req.params.id);
    res.json(result);
  } catch (err) {
    console.error("❌ Delete admin controller error:", err);
    res.status(500).json({ message: err.message });
  }
};
