import { fetchWithAuth } from "./client";

export const getPaymentDetails = async () => {
  return await fetchWithAuth("/payment-details");
};

export const updatePaymentDetails = async (data: FormData) => {
  return await fetchWithAuth("/payment-details", {
    method: "PUT",
    // Do NOT set Content-Type to multipart/form-data manually, fetch will do it automatically when body is FormData
    body: data,
  });
};
