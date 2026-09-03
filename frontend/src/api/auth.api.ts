import { BASE_URL, fetchWithAuth, setAuthToken, setStoredUser } from "./client";

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

export const initRegistration = async () => {
  const res = await fetch(`${BASE_URL}/uploads/init-registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to initialize registration");
  }
  return data;
};

export const getPresignedUploadUrl = async (filename: string, fileType: string, attemptId?: string, paymentAttemptId?: string): Promise<{ uploadUrl: string; key: string }> => {
  const payload: any = { filename, fileType };
  if (attemptId) payload.attemptId = attemptId;
  if (paymentAttemptId) payload.paymentAttemptId = paymentAttemptId;

  const res = await fetch(`${BASE_URL}/uploads/presigned-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to generate presigned S3 URL");
  }
  return data;
};

export const cleanupRegistrationAttempt = async (attemptId: string) => {
  const res = await fetch(`${BASE_URL}/uploads/cleanup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attemptId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to cleanup registration attempt");
  }
  return data;
};

export const initPayment = async () => {
  const res = await fetch(`${BASE_URL}/uploads/init-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to initialize payment");
  }
  return data;
};

export const cleanupPaymentAttempt = async (paymentAttemptId: string) => {
  const res = await fetch(`${BASE_URL}/uploads/cleanup-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentAttemptId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to cleanup payment attempt");
  }
  return data;
};

export const registerUser = async (registrationData: any) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registrationData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

export const registerUserPhase3 = async (registrationData: any) => {
  const res = await fetch(`${BASE_URL}/auth/register-v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registrationData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

export const verifyEmailToken = async (token: string) => {
  const res = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to verify email");
  }
  return data;
};

export const resendVerificationEmail = async (email: string) => {
  const res = await fetch(`${BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to resend verification email");
  }
  return data;
};

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

export const submitContact = async (contactData: { from_name: string; from_email: string; message: string }) => {
  return await fetchWithAuth("/auth/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactData),
  });
};

export const getCurrentMemberProfile = async () => {
  return await fetchWithAuth("/auth/me");
};

export const updateMemberProfile = async (profileData: any) => {
  return await fetchWithAuth("/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
};

export const changeMemberPassword = async (passwordData: any) => {
  return await fetchWithAuth("/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordData),
  });
};

export const deleteMemberProfile = async () => {
  return await fetchWithAuth("/auth/profile", {
    method: "DELETE",
  });
};

export const sendForgotPasswordOtp = async (email: string) => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to send password reset code");
  }
  return data;
};

export const resetPasswordWithOtp = async (resetData: { email: string; otp: string; newPassword: string }) => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resetData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to reset password");
  }
  return data;
};


