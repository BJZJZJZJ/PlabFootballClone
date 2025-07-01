// src/api/fieldApi.js
import apiClient from "./apiClient";

const fieldApi = {
  getAllFields: async () => {
    return await apiClient.get("/api/stadium/subField/all");
  },

  getFieldById: async (id) => {
    return await apiClient.get(`/api/stadium/subField/${id}`);
  },

  createField: async (fieldData) => {
    return await apiClient.post("/api/stadium/subField", fieldData);
  },

  updateField: async (id, fieldData) => {
    return await apiClient.put(`/api/stadium/subField/${id}`, fieldData);
  },

  deleteField: async (id) => {
    return await apiClient.delete(`/api/stadium/subField/${id}`);
  },
};

export default fieldApi;
