const API_URL = "http://localhost:5000/api/auth";

export interface UserData {
  name?: string;
  email: string;
  password: string;
}

export const registerUser = async (userData: UserData) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return await res.json();
};

export const loginUser = async (userData: UserData) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return await res.json();
};
