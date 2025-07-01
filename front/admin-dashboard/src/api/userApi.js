// src/api/userApi.js
import apiClient from "./apiClient";

const userApi = {
  getAllUsers: async () => {
    return await apiClient.get("/api/user");
  },

  getUserById: async (id) => {
    return await apiClient.get(`/api/user/${id}`);
  },

  createUser: async (userData) => {
    return await apiClient.post("/api/user/signup", userData);
  },

  updateUser: async (id, userData) => {
    return await apiClient.put(`/api/user/${id}`, userData);
  },

  deleteUser: async (id) => {
    return await apiClient.delete(`/api/user/${id}`);
  },
};

export default userApi;
