import { BASE_URL } from "./client";

export const submitPayment = async (paymentData: any) => {
  const res = await fetch(`${BASE_URL}/auth/payment/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Payment submission failed");
  }
  return data;
};
