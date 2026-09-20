import { fetchWithAuth } from "./client";

export const getPaymentDetails = async () => {
  return await fetchWithAuth("/payment-details");
};

export const updatePaymentDetails = async (data: any) => {
  return await fetchWithAuth("/payment-details", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};
