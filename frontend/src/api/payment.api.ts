import { BASE_URL } from "./client";

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
