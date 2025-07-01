// src/pages/Match/MatchListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import matchApi from "../../api/matchApi"; // matchApi 임포트

function MatchListPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await matchApi.getAllMatches(); // API 응답 전체를 받습니다.
      let dataToSet = response.matches;

      setMatches(dataToSet); // 올바른 배열 데이터를 스테이트에 설정
      // 이 콘솔 로그는 다음 렌더링 사이클 전이라 이전 값이 나올 수 있습니다.
      // console.log("Matches state after set (might be old value):", matches);
    } catch (err) {
      setError("Failed to fetch matches: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleEdit = (matchId, subFieldId) => {
    navigate(`/matches/edit/${matchId}?subFieldId=${subFieldId}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      setLoading(true);
      try {
        await matchApi.deleteMatch(id);
        console.log("Match deleted successfully:", id);
        alert("Match deleted successfully!");
        fetchMatches(); // 목록 새로고침
      } catch (err) {
        setError("Failed to delete match: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div>Loading matches...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Match List</h2>
      <button
        onClick={() => navigate("/matches/add")}
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Add New Match
      </button>

      {matches.length === 0 ? (
        <div>No matches found.</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                ID
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                경기날짜
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                경기시간
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                진행 구장
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                수준
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                성별
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                형식
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                참가비
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                인원수 (최저/최대/현재)
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.length > 0 ? (
              matches.map((match) => (
                <tr key={match.id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.id}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.startTime
                      ? new Date(match.startTime).toLocaleString()
                      : "N/A"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.durationMinutes} 분
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.subField.stadium.name +
                      " " +
                      match.subField.fieldName}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.conditions?.level}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.conditions?.gender}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.conditions?.matchFormat}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.fee?.toLocaleString()}원
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {match.participantInfo?.minimumPlayers} &nbsp; / &nbsp;
                    {match.participantInfo?.maximumPlayers} &nbsp; / &nbsp;
                    {match.participantInfo?.currentPlayers}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <button
                      onClick={() => handleEdit(match._id, match.subField._id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#ffc107",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        marginRight: "5px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(match._id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  No Matches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MatchListPage;
