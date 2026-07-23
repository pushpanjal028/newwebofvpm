import { BASE_URL, fetchWithAuth } from "./client";

export const getPublicGalleryPhotos = async () => {
  const res = await fetch(`${BASE_URL}/gallery`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch gallery photos.");
  }
  return data;
};

export const createGalleryPhoto = async (photoData: { title: string; imageUrl: string; category?: string }) => {
  return await fetchWithAuth("/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(photoData),
  });
};

export const deleteGalleryPhoto = async (id: string) => {
  return await fetchWithAuth(`/gallery/${id}`, {
    method: "DELETE",
  });
};
