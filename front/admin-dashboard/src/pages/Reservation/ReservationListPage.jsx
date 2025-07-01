// src/pages/Reservation/ReservationListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import reservationApi from "../../api/reservationApi.js";

function ReservationListPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationApi.getAllReservations();
      setReservations(data); // API 응답이 바로 배열이라고 가정
    } catch (err) {
      setError("Failed to fetch reservations: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleEdit = (id) => {
    navigate(`/reservation/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "정말로 이 예약을 삭제하시겠습니까? (예약 상태가 예약 중이면 매치 인원수도 되돌려집니다.)"
      )
    ) {
      setLoading(true);
      try {
        await reservationApi.deleteReservation(id);
        alert("예약이 성공적으로 삭제되었습니다.");
        fetchReservations(); // 목록 새로고침
      } catch (err) {
        setError("예약 삭제에 실패했습니다: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div>예약 목록을 불러오는 중...</div>;
  if (error) return <div style={{ color: "red" }}>오류: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>예약 목록</h2>
      <button
        onClick={() => navigate("/reservation/add")}
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        새 예약 추가
      </button>

      {reservations.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            border: "1px solid #eee",
            borderRadius: "8px",
          }}
        >
          예약 내역이 없습니다.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#f0f8ff",
              border: "1px solid #cceeff",
              borderRadius: "5px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            현재 등록된 예약 목록입니다.
          </div>
          {reservations.map((reservation) => (
            <li
              key={reservation._id}
              style={{
                border: "1px solid #b0c4de",
                borderRadius: "8px",
                marginBottom: "15px",
                padding: "15px",
                backgroundColor: "#f8f8ff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #d3d3d3",
                  paddingBottom: "10px",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.2em", color: "#4682b4" }}>
                  예약 ID: {reservation._id}
                </h3>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "15px",
                    backgroundColor:
                      reservation.status === "예약" ? "#28a745" : "#dc3545",
                    color: "white",
                    fontSize: "0.9em",
                  }}
                >
                  {reservation.status}
                </span>
              </div>

              <p>
                <strong>예약 사용자:</strong> {reservation.user?.name} (
                {reservation.user?.email})
              </p>
              <p>
                <strong>예약 매치:</strong>{" "}
                {reservation.match?.startTime
                  ? new Date(reservation.match.startTime).toLocaleString()
                  : "N/A"}
              </p>
              <p style={{ marginLeft: "20px", fontSize: "0.9em" }}>
                (경기장: {reservation.match?.subField?.stadium?.name || "N/A"} /
                서브필드: {reservation.match?.subField?.fieldName || "N/A"})
              </p>
              <p>
                <strong>예약 일시:</strong>{" "}
                {new Date(reservation.reservedAt).toLocaleString()}
              </p>

              <div style={{ marginTop: "10px", textAlign: "right" }}>
                <button
                  onClick={() => handleEdit(reservation._id)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "8px",
                  }}
                >
                  예약 수정/취소
                </button>
                <button
                  onClick={() => handleDelete(reservation._id)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  예약 삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReservationListPage;
