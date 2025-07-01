// src/pages/Home.jsx (새 파일 생성)
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function HomePage() {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        인증 정보 로딩 중...
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>환영합니다!</h1>
      {isAuthenticated ? (
        <div>
          <p>
            로그인되었습니다. <strong>{user?.name || user?.email}</strong>님!
          </p>
          <p>
            역할: <strong>{user?.role}</strong>
          </p>
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {user?.role === "admin" ? (
              <>
                <Link
                  to="/matches"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                    display: "block",
                    width: "200px",
                  }}
                >
                  매치 관리
                </Link>
                <Link
                  to="/stadiums"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                    display: "block",
                    width: "200px",
                  }}
                >
                  경기장 관리
                </Link>
                <Link
                  to="/reservation"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ffc107",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                    display: "block",
                    width: "200px",
                  }}
                >
                  예약 관리
                </Link>
              </>
            ) : (
              // 일반 사용자에게 보여줄 링크 (예: 매치 검색 및 예약)
              <p>일반 사용자 페이지로 이동됩니다.</p>
              // <Link to="/matches/browse">매치 찾아보기</Link>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p>로그인이 필요합니다.</p>
          <Link
            to="/login"
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            로그인 페이지로 이동
          </Link>
        </div>
      )}
    </div>
  );
}

export default HomePage;
