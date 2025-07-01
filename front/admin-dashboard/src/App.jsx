// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";

import UserListPage from "./pages/User/UserListPage";
import UserFormPage from "./pages/User/UserFormPage";
import MatchListPage from "./pages/Match/MatchListPage";
import MatchFormPage from "./pages/Match/MatchFormPage";
import StadiumListPage from "./pages/Stadium/StadiumListPage";
import StadiumFormPage from "./pages/Stadium/StadiumFormPage";
import SubFieldFormPage from "./pages/Stadium/SubFieldFormPage";
import ReservationListPage from "./pages/Reservation/ReservationListPage";
import ReservationFormPage from "./pages/Reservation/ReservationFormPage";

import LoginPage from "./pages/Auth/LoginPage"; // 로그인 페이지 임포트
import HomePage from "./pages/Home"; // 홈 페이지 (시작 페이지)
import AuthContext, { AuthProvider } from "./context/AuthContext"; // AuthContext 임포트

// 보호된 라우트 컴포넌트
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = React.useContext(AuthContext);

  if (loading) {
    return <div>로딩 중...</div>; // 인증 상태 로딩 중
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // 로그인되지 않았다면 로그인 페이지로 리다이렉트
  }

  // 역할 기반 접근 제어 (requiredRole이 있을 경우)
  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <div>접근 권한이 없습니다.</div>; // 또는 특정 에러 페이지로 리다이렉트
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* AuthProvider로 전체 앱을 감쌉니다. */}
        <AuthNavbar />
        {/* 로그인/로그아웃 상태에 따라 메뉴를 보여줄 네비게이션 바 */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* 로그인 페이지 라우트 */}
          <Route path="/" element={<HomePage />} /> {/* 홈 페이지 */}
          {/* User Routes */}
          <Route
            path="/users"
            element={
              <PrivateRoute requiredRole="admin">
                <UserListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/add"
            element={
              <PrivateRoute requiredRole="admin">
                <UserFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <PrivateRoute requiredRole="admin">
                <UserFormPage />
              </PrivateRoute>
            }
          />
          {/* Match Routes  */}
          <Route
            path="/matches"
            element={
              <PrivateRoute requiredRole="admin">
                <MatchListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/matches/add"
            element={
              <PrivateRoute requiredRole="admin">
                <MatchFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/matches/edit/:id"
            element={
              <PrivateRoute requiredRole="admin">
                <MatchFormPage />
              </PrivateRoute>
            }
          />
          {/* Stadium Routes */}
          <Route
            path="/stadiums"
            element={
              <PrivateRoute requiredRole="admin">
                <StadiumListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/stadiums/add"
            element={
              <PrivateRoute requiredRole="admin">
                <StadiumFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/stadiums/edit/:id"
            element={
              <PrivateRoute requiredRole="admin">
                <StadiumFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subField/add"
            element={
              <PrivateRoute requiredRole="admin">
                <SubFieldFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subField/edit"
            element={
              <PrivateRoute requiredRole="admin">
                <SubFieldFormPage />
              </PrivateRoute>
            }
          />
          {/* 예약 관련 라우트 추가 */}
          <Route
            path="/reservation"
            element={
              <PrivateRoute requiredRole="admin">
                <ReservationListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reservation/add"
            element={
              <PrivateRoute requiredRole="admin">
                <ReservationFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reservation/edit/:id"
            element={
              <PrivateRoute requiredRole="admin">
                <ReservationFormPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// 로그인 상태에 따라 네비게이션 바를 렌더링하는 컴포넌트
const AuthNavbar = () => {
  const { isAuthenticated, logout, user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        padding: "10px 20px",
        backgroundColor: "#f4f4f4",
        borderBottom: "1px solid #ddd",
        display: "flex",
        gap: "15px",
        alignItems: "center",
      }}
    >
      {isAuthenticated ? (
        <>
          <Link to="/">홈</Link>
          <Link to="/users">유저 관리</Link>
          <Link to="/stadiums">경기장 관리</Link>
          <Link to="/matches">매치 관리</Link>
          <Link to="/reservation">예약 관리</Link>
          <span
            style={{ marginLeft: "auto", marginRight: "10px", color: "#555" }}
          >
            환영합니다, {user?.name || user?.email} ({user?.role})
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link to="/login" style={{ marginLeft: "auto" }}>
          로그인
        </Link>
      )}
    </nav>
  );
};

export default App;
