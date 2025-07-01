// src/pages/Reservation/ReservationFormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import reservationApi from "../../api/reservationApi";
import matchApi from "../../api/matchApi"; // 매치 목록 불러오기 위함
import userApi from "../../api/userApi"; // 사용자 목록 불러오기 위함 (만약 관리자가 직접 유저 선택 시)

function ReservationFormPage() {
  const { id } = useParams(); // 예약 ID (수정 모드일 경우)
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "", // 선택된 User._id
    matchId: "", // 선택된 Match._id
    status: "예약", // 기본값
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]); // 매치 목록 스테이트
  const [users, setUsers] = useState([]); // 사용자 목록 스테이트 (관리자용)

  const isEditMode = Boolean(id);

  // 매치 목록과 사용자 목록 불러오기
  useEffect(() => {
    const fetchDependencies = async () => {
      setLoading(true);
      try {
        const [matchData, userData] = await Promise.all([
          matchApi.getAllMatches(),
          userApi.getAllUsers(), // userApi가 구현되어 있어야 합니다.
        ]);

        setMatches(
          Array.isArray(matchData)
            ? matchData
            : matchData.data || matchData.matches || []
        );
        setUsers(Array.isArray(userData) ? userData : userData.data || []); // userApi의 응답 형태에 맞게 조정
      } catch (err) {
        console.error("Failed to fetch matches or users for form:", err);
        setError("매치 또는 사용자 목록을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDependencies();
  }, []);

  // 수정 모드일 때 기존 예약 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      const fetchReservation = async () => {
        setLoading(true);
        try {
          const reservation = await reservationApi.getReservationById(id);
          setFormData({
            userId: reservation.user?._id || "",
            matchId: reservation.match?._id || "",
            status: reservation.status || "예약",
          });
        } catch (err) {
          setError("예약 데이터를 불러오는 데 실패했습니다: " + err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchReservation();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { userId, matchId, status } = formData;

    // 필수 필드 유효성 검사
    if (!userId || !matchId || !status) {
      setError("모든 필수 필드를 채워주세요.");
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        await reservationApi.updateReservation(id, { userId, matchId, status }); // 수정 시에는 필요한 필드만 보냄
        alert("예약이 성공적으로 업데이트되었습니다!");
      } else {
        await reservationApi.createReservation({ userId, matchId, status }); // 생성 시에는 모든 필드 보냄
        alert("새 예약이 성공적으로 추가되었습니다!");
      }
      navigate("/reservation"); // 목록 페이지로 이동
    } catch (err) {
      setError(
        `예약 ${isEditMode ? "업데이트" : "생성"}에 실패했습니다: ` +
          err.message
      );
      console.error(err.response ? err.response.data : err.message); // 백엔드 오류 메시지 확인
    } finally {
      setLoading(false);
    }
  };

  if (loading && (isEditMode || matches.length === 0 || users.length === 0)) {
    return <div>폼 데이터를 불러오는 중...</div>;
  }
  if (error) return <div style={{ color: "red" }}>오류: {error}</div>;

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "8px",
        maxWidth: "600px",
        margin: "20px auto",
      }}
    >
      <h2>{isEditMode ? "예약 수정" : "새 예약 추가"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        {/* 사용자 선택 드롭다운 (관리자가 예약할 유저를 선택하는 경우) */}
        <div>
          <label
            htmlFor="user"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            사용자:
          </label>
          <select
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
            disabled={users.length === 0 || isEditMode}
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">-- 사용자 선택 --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {users.length === 0 && !loading && (
            <p style={{ color: "orange", fontSize: "0.9em" }}>
              사용자 목록을 불러올 수 없습니다. 관리자에게 문의하세요.
            </p>
          )}
        </div>

        {/* 매치 선택 드롭다운 */}
        <div>
          <label
            htmlFor="match"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            매치:
          </label>
          <select
            id="matchId"
            name="matchId"
            value={formData.matchId}
            onChange={handleChange}
            required
            disabled={matches.length === 0}
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">-- 매치 선택 --</option>
            {matches.map((match) => (
              <option key={match._id} value={match._id}>
                {match.startTime
                  ? new Date(match.startTime).toLocaleString()
                  : "N/A"}{" "}
                - {match.subField?.stadium?.name || "N/A"} (
                {match.subField?.fieldName || "N/A"}) (현재
                {match.participantInfo?.currentPlayers}/
                {match.participantInfo?.maximumPlayers}명)
              </option>
            ))}
          </select>
          {matches.length === 0 && !loading && (
            <p style={{ color: "orange", fontSize: "0.9em" }}>
              사용 가능한 매치가 없습니다.
            </p>
          )}
        </div>

        {/* 예약 상태 드롭다운 (수정 모드에서만 주로 사용) */}
        {isEditMode && (
          <div>
            <label
              htmlFor="status"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              예약 상태:
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="예약">예약</option>
              <option value="취소">취소</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (isEditMode && !formData.userId)}
          style={{
            padding: "12px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1em",
          }}
        >
          {isEditMode ? "예약 업데이트" : "예약 추가"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/reservation")}
          style={{
            padding: "12px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1em",
          }}
        >
          목록으로 돌아가기
        </button>
      </form>
    </div>
  );
}

export default ReservationFormPage;
