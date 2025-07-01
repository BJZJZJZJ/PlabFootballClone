import apiClient from "./apiClient";

const stadiumApi = {
  getAllStadiums: async () => {
    return await apiClient.get("/api/stadium");
  },

  getStadiumById: async (id) => {
    return await apiClient.get(`/api/stadium/${id}`);
  },

  createStadium: async (userData) => {
    return await apiClient.post("/api/stadium/", userData);
  },

  updateStadium: async (id, userData) => {
    return await apiClient.put(`/api/stadium/${id}`, userData);
  },

  deleteStadium: async (id) => {
    return await apiClient.delete(`/api/stadium/${id}`);
  },
};

export default stadiumApi;
