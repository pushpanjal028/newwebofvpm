import {
  getPublicMembersService,
  verifyMembershipIdService,
  getMemberStatusService,
  getCoordinatorDashboardService,
} from "./member.service.js";

export const getPublicMembers = async (req, res) => {
  try {
    const result = await getPublicMembersService();
    res.json(result);
  } catch (err) {
    console.error("❌ Fetch public members controller error:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
};

export const verifyMembershipId = async (req, res) => {
  try {
    const result = await verifyMembershipIdService(req.params.membershipId);
    res.json(result);
  } catch (err) {
    console.error("❌ Verification lookup controller error:", err);
    res.status(500).json({ message: err.message || "Failed to verify membership ID." });
  }
};

export const getMemberStatus = async (req, res) => {
  try {
    const result = await getMemberStatusService(req.params.emailOrPhone);
    res.json(result);
  } catch (err) {
    console.error("❌ Fetch member status controller error:", err);
    res.status(404).json({ message: err.message || "Failed to fetch member registration status." });
  }
};

export const getCoordinatorDashboard = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const result = await getCoordinatorDashboardService(req.user.id);
    res.json(result);
  } catch (err) {
    console.error("❌ Fetch coordinator dashboard error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch dashboard." });
  }
};
