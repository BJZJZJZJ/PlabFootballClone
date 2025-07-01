// 백엔드 API의 기본 URL을 여기에 정의합니다.
// 개발 환경과 배포 환경에 따라 변경될 수 있도록 환경 변수를 사용하는 것이 좋습니다.
// const BASE_URL = "http://cococoa.tplinkdns.com:44445"; // 또는 'https://your-backend-domain.com/api'
const BASE_URL = ""; // 또는 'https://your-backend-domain.com/api'

const apiClient = {
  get: async (path, options = {}) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      credentials: "include",
      ...options, // 추가적인 fetch 옵션을 허용
    });
    return handleResponse(response);
  },

  post: async (path, body, options = {}) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers, // 기존 헤더 유지 또는 덮어쓰기
      },
      body: JSON.stringify(body),
      credentials: "include",
      ...options,
    });
    return handleResponse(response);
  },

  put: async (path, body, options = {}) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(body),
      credentials: "include",
      ...options,
    });
    return handleResponse(response);
  },

  delete: async (path, options = {}) => {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
      ...options,
    });
    return handleResponse(response);
  },
};

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "알 수 없는 오류" }));
    throw new Error(errorData.message || `HTTP 오류! 상태: ${response.status}`);
  }
  // No Content (204) 응답일 경우 JSON 파싱 시도하지 않음
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export default apiClient;
