import apiClient from "./client";
import axios from "axios";

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const { data } = await apiClient.post("/api/uploads", formData, config).catch(async (err) => {
    if (!axios.isAxiosError(err) || err.response?.status !== 404) {
      return Promise.reject(err);
    }
    return apiClient.post("/api/upload", formData, config);
  });

  return data.mediaUrl;
};
