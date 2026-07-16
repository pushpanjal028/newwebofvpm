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

export const updateMemberDetails = async (id: string, memberData: any) => {
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

export const verifyPayment = async (id: string, status: "paid" | "rejected") => {
  return await fetchWithAuth(`/admin/members/${id}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
};

export const verifyMembership = async (id: string, status: "approved" | "rejected") => {
  return await fetchWithAuth(`/admin/members/${id}/verify-membership`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
};
