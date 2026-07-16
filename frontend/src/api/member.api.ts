import { fetchWithAuth } from "./client";

export const getPublicMembers = async () => {
  return await fetchWithAuth("/members");
};

export const getPublicVerification = async (membershipId: string) => {
  return await fetchWithAuth(`/members/verify/${membershipId}`);
};

export const getMemberStatus = async (emailOrPhone: string) => {
  return await fetchWithAuth(`/members/status/${encodeURIComponent(emailOrPhone)}`);
};
