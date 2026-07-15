const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Auth token storage keys
const TOKEN_KEY = "vpm_token";
const USER_KEY = "vpm_user";

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};
export const setStoredUser = (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Generic fetch wrapper with Bearer token injection
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// 🔹 PUBLIC API CALLS

// Send OTP verification code to email
export const sendOtp = async (email: string) => {
  const res = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to send verification code");
  }
  return data;
};

// Member Registration (FormData for files)
export const registerUser = async (formData: FormData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: formData, // fetch automatically sets multipart/form-data for FormData
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

// Member Login
export const loginUser = async (credentials: any) => {
  const data = await fetchWithAuth("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (data.token) {
    setAuthToken(data.token);
    setStoredUser(data.user);
  }
  return data;
};

// Payment Submission (FormData for screenshot file)
export const submitPayment = async (formData: FormData) => {
  const res = await fetch(`${BASE_URL}/auth/payment/submit`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Payment submission failed");
  }
  return data;
};

// Contact Form submission
export const submitContact = async (contactData: { from_name: string; from_email: string; message: string }) => {
  return await fetchWithAuth("/auth/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });
};

// Fetch approved and paid members
export const getPublicMembers = async () => {
  return await fetchWithAuth("/members");
};

// Public member lookup verification
export const getPublicVerification = async (membershipId: string) => {
  return await fetchWithAuth(`/members/verify/${membershipId}`);
};

// Check membership registration status
export const getMemberStatus = async (emailOrPhone: string) => {
  return await fetchWithAuth(`/members/status/${encodeURIComponent(emailOrPhone)}`);
};

// 🔹 ADMINISTRATIVE API CALLS

// Admin Dashboard stats
export const getAdminStats = async () => {
  return await fetchWithAuth("/admin/stats");
};

// Fetch members for admin (paginated with search & filters)
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

// Fetch paginated audit logs
export const getAdminAuditLogs = async (page: number, limit: number) => {
  return await fetchWithAuth(`/admin/audit-logs?page=${page}&limit=${limit}`);
};

// Update member details
export const updateMemberDetails = async (id: string, memberData: any) => {
  return await fetchWithAuth(`/admin/members/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memberData),
  });
};

// Delete member application
export const deleteMember = async (id: string) => {
  return await fetchWithAuth(`/admin/members/${id}`, {
    method: "DELETE",
  });
};

// Verify payment status
export const verifyPayment = async (id: string, status: "paid" | "rejected") => {
  return await fetchWithAuth(`/admin/members/${id}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
};

// Verify membership approval
export const verifyMembership = async (id: string, status: "approved" | "rejected") => {
  return await fetchWithAuth(`/admin/members/${id}/verify-membership`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
};

// Fetch current member profile
export const getCurrentMemberProfile = async () => {
  return await fetchWithAuth("/auth/me");
};

// Update current member profile details
export const updateMemberProfile = async (profileData: any) => {
  return await fetchWithAuth("/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
};

// Change current member password
export const changeMemberPassword = async (passwordData: any) => {
  return await fetchWithAuth("/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordData),
  });
};

// Static file helper to construct absolute URLs for uploads
export const getUploadUrl = (relativePath: string) => {
  if (!relativePath) return "";
  // Check if it's already an absolute URL
  if (relativePath.startsWith("http")) return relativePath;
  const CLEAN_BASE = BASE_URL.endsWith("/api") ? BASE_URL.slice(0, -4) : BASE_URL;
  return `${CLEAN_BASE}${relativePath}`;
};
