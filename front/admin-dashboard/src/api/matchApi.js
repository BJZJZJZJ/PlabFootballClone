// src/api/userApi.js
import apiClient from "./apiClient";

const matchApi = {
  getAllMatches: async () => {
    return await apiClient.get("/api/match/all");
  },

  getMatchById: async (id) => {
    return await apiClient.get(`/api/match/${id}`);
  },

  createMatch: async (matchData) => {
    return await apiClient.post("/api/match/", matchData);
  },

  updateMatch: async (id, matchData) => {
    return await apiClient.put(`/api/match/${id}`, matchData);
  },

  deleteMatch: async (id) => {
    return await apiClient.delete(`/api/match/${id}`);
  },
};

export default matchApi;
