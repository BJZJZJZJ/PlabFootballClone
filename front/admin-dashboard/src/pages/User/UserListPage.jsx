// src/pages/User/UserListPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();

      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userApi.deleteUser(id);
        alert("User deleted successfully!");
        fetchUsers(); // 목록 새로고침
      } catch (err) {
        alert("Failed to delete user. " + err.message); // 에러 메시지 표시
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h2>User List</h2>
      <button onClick={() => navigate("/users/add")}>Add New User</button>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>이메일</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>이름</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>
              생년월일
            </th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>성별</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>역할</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>예약 </th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {user.email}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {user.name}
                </td>

                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {user.birth.slice(0, 10)}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {user.gender ? "여성" : "남성"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {user.role}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <ul style={styles.ulContainer}>
                    {user.reservation.length >= 0
                      ? user.reservation.map((reserv) => (
                          <li key={reserv._id} style={styles.liItem}>
                            <Link to={`/reservation/edit/${reserv}`}>
                              {reserv}
                            </Link>
                          </li>
                        ))
                      : "asf"}
                  </ul>
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <Link
                    to={`/users/edit/${user._id}`}
                    style={{ marginRight: "10px" }}
                  >
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  textAlign: "center",
                }}
              >
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  ulContainer: {
    listStyle: "none", // 리스트 마커 (점) 제거
    padding: 0, // 기본 패딩 제거
    margin: 0, // 기본 마진 제거
    display: "flex", // flexbox를 사용하여 항목 정렬
    flexDirection: "column", // 항목들을 세로로 정렬 (한 줄에 하나씩)
    alignItems: "center", // 주축(세로)에 대해 교차축(가로)을 가운데 정렬
    width: "100%", // ul이 부모 컨테이너의 너비를 꽉 채우도록
  },
  liItem: {
    width: "auto", // li 항목의 너비를 내용에 맞게 조절
    textAlign: "center", // li 내부 텍스트를 가운데 정렬
    marginBottom: "10px", // 각 항목 아래에 약간의 간격
    // border: '1px solid #ccc', // 각 항목을 시각적으로 구분하고 싶을 때 추가
    // padding: '5px', // 내부 패딩
  },
};

export default UserListPage;
