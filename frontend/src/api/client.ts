const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `${window.location.protocol}//${window.location.hostname}/api`;
  }
  return "http://localhost:5000/api";
};

export const BASE_URL = getBaseUrl();

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

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
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

export const extractS3Key = (url: string) => {
  if (!url) return "";
  let key = url;
  if (key.includes(".amazonaws.com/")) {
    key = key.split(".amazonaws.com/")[1];
  } else if (key.startsWith("s3://")) {
    const parts = key.replace("s3://", "").split("/");
    key = parts.slice(1).join("/");
  }
  return key.trim().replace(/^\/+/, "");
};

export const getUploadUrl = (relativePath: string) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http") && !relativePath.includes(".amazonaws.com/")) return relativePath;
  
  let key = extractS3Key(relativePath);
  
  // Do not incorrectly prefix existing valid namespaces like 'temp/'
  if (!key.toLowerCase().startsWith("uploads/") && !key.toLowerCase().startsWith("temp/")) {
    key = `uploads/${key}`;
  }
  
  return `${BASE_URL}/uploads/view/${key}`;
};

export const uploadFileToS3 = async (presignedUrl: string, file: File) => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.statusText}`);
  }
  return true;
};

export const fetchSecureDocumentUrl = async (key: string) => {
  if (!key) return "";
  
  const parsedKey = extractS3Key(key);

  if (!parsedKey.startsWith("temp/")) return getUploadUrl(key.startsWith("s3://") ? parsedKey : key);
  
  const data = await fetchWithAuth(`/uploads/document-url?key=${encodeURIComponent(parsedKey)}`);
  return data.signedUrl;
};
