// src/context/AuthContext.js (새 파일 생성)
import React, { createContext, useState, useEffect } from "react";
import apiClient from "../api/apiClient"; // API 클라이언트 임포트

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 로그인된 사용자 정보
  const [loading, setLoading] = useState(true); // 초기 로딩 상태 (토큰 유효성 검사 등)

  // 애플리케이션 로드 시 사용자 정보 확인
  useEffect(() => {
    const loadUser = async () => {
      try {
        // 서버의 /api/auth/me 엔드포인트 호출하여 현재 사용자 정보 가져오기
        // 토큰이 유효하면 사용자 정보를 반환하고, 아니면 401/403 에러 발생
        const response = await apiClient.get("/api/user/get-user");
        setUser(response.user); // 응답 데이터가 user 정보라고 가정
      } catch (err) {
        // 토큰이 없거나 유효하지 않으면 사용자 정보 초기화
        console.error("No authenticated user or token invalid:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/api/user/signin", {
        email,
        password,
      });
      console.log("Login response:", response);
      setUser(response.data.user); // 응답에서 'user' 객체를 받도록 가정
      return response.data; // 로그인 성공 응답 반환
    } catch (err) {
      // 서버에서 보낸 에러 메시지 활용
      const errorMessage =
        err.response?.data?.message || err.message || "알 수 없는 로그인 오류";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await apiClient.get("/api/user/signout");
      setUser(null); // 사용자 정보 초기화
    } catch (err) {
      console.error("Logout error:", err);
      throw new Error("로그아웃에 실패했습니다.");
    }
  };

  // context value로 제공할 객체
  const authContextValue = {
    user,
    isAuthenticated: !!user, // user 객체가 있으면 true
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
