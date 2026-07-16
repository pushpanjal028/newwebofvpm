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

export const registerUser = async (formData: FormData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
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
