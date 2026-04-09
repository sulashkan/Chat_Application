const BASE_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:5000";

export const getMediaUrl = (url: string) => {
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};