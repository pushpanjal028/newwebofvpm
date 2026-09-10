import { fetchWithAuth } from "./client";

export const getAdminStats = async () => {
  return await fetchWithAuth("/admin/stats");
};

export const getAdminMembers = async (params: {
  page: number;
  limit: number;
  search?: string;
  paymentStatus?: string;
  approvalStatus?: string;
}) => {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.search) query.append("search", params.search);
  if (params.paymentStatus) query.append("paymentStatus", params.paymentStatus);
  if (params.approvalStatus) query.append("approvalStatus", params.approvalStatus);

  return await fetchWithAuth(`/admin/members?${query.toString()}`);
};

export const getAdminAuditLogs = async (page: number, limit: number) => {
  return await fetchWithAuth(`/admin/audit-logs?page=${page}&limit=${limit}`);
};

export const updateMemberDetails = async (id: string, memberData: Record<string, unknown>) => {
  return await fetchWithAuth(`/admin/members/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memberData),
  });
};

export const deleteMember = async (id: string) => {
  return await fetchWithAuth(`/admin/members/${id}`, {
    method: "DELETE",
  });
};

export const verifyPayment = async (id: string, status: "paid" | "rejected", rejectionReason?: string, notes?: string) => {
  return await fetchWithAuth(`/admin/members/${id}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, rejectionReason, notes }),
  });
};

export const verifyMembership = async (id: string, status: "approved" | "rejected", rejectionReason?: string) => {
  return await fetchWithAuth(`/admin/members/${id}/verify-membership`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, rejectionReason }),
  });
};

export const getAdminCashbacks = async () => {
  return await fetchWithAuth("/admin/cashbacks");
};

export const getAdminAnalytics = async () => {
  return await fetchWithAuth("/admin/analytics");
};

// Cashback Management
export const getCashbacks = async () => {
  return await fetchWithAuth("/admin/cashbacks");
};

export const updateCashbackStatus = async (
  cashbackId: string, 
  data: { 
    status: string; 
    rejectionReason?: string; 
    paymentMethod?: string; 
    transactionId?: string; 
    adminNotes?: string; 
    paidAmount?: number 
  }
) => {
  return await fetchWithAuth(`/admin/cashbacks/${cashbackId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const bulkPrintCards = async (userIds: string[]) => {
  const token = localStorage.getItem("vpm_token");
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/bulk-print`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userIds })
  });
  if (!response.ok) throw new Error("Failed to generate bulk PDF");
  return await response.blob();
};



export const resetMemberPassword = async (id: string) => {
  return await fetchWithAuth(`/admin/members/${id}/reset-password`, {
    method: "POST",
  });
};

export const forceEmailVerification = async (id: string) => {
  return await fetchWithAuth(`/admin/members/${id}/force-email-verification`, {
    method: "POST",
  });
};

export const updateAccountStatus = async (id: string, status: string) => {
  return await fetchWithAuth(`/admin/members/${id}/account-status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
};

export const getAdmins = async () => {
  return await fetchWithAuth("/admin/admins");
};

export const createAdmin = async (adminData: Record<string, unknown>) => {
  return await fetchWithAuth("/admin/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adminData),
  });
};

export const updateAdminRole = async (id: string, role: string) => {
  return await fetchWithAuth(`/admin/admins/${id}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
};

export const deleteAdmin = async (id: string) => {
  return await fetchWithAuth(`/admin/admins/${id}`, {
    method: "DELETE",
  });
};
