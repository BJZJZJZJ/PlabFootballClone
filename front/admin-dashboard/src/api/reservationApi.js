// src/api/reservationApi.js
import apiClient from "./apiClient"; // 앞서 설정한 apiClient 인스턴스 사용

const reservationApi = {
  getAllReservations: async () => {
    return await apiClient.get("/api/reservation/all");
  },
  getReservationById: async (id) => {
    return await apiClient.get(`/api/reservation/${id}`);
  },
  createReservation: async (reservationData) => {
    return await apiClient.post("/api/reservation", reservationData);
  },
  updateReservation: async (id, reservationData) => {
    return await apiClient.put(`/api/reservation/${id}`, reservationData);
  },
  deleteReservation: async (id) => {
    return await apiClient.delete(`/api/reservation/${id}`);
  },
};

export default reservationApi;
