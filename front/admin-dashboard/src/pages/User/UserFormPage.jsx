// src/pages/User/UserFormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userApi from "../../api/userApi";
import DatePicker from "react-datepicker"; // DatePicker를 위해 추가
import "react-datepicker/dist/react-datepicker.css"; // DatePicker 스타일 추가

function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "", // 역할
    email: "", // 이메일
    password: "", // 비밀번호
    name: "", // 이름
    birth: null, // 생년월일 (Date 객체)
    gender: null, // 성별 (true: 여성, false: 남성)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(id);

  // 역할 드롭다운 옵션 (예시)
  const roleOptions = [
    { value: "", label: "Select Role" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "guest", label: "Guest" },
  ];

  useEffect(() => {
    if (isEditMode) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const user = await userApi.getUserById(id);

          console.log(user);
          setFormData({
            role: user.role || "",
            email: user.email || "",
            // 비밀번호는 보안상 수정 시 다시 불러오지 않는 것이 일반적입니다.
            // 여기서는 빈 값으로 두고, 사용자가 직접 입력하도록 합니다.
            password: "",
            name: user.name || "",
            // ISO 8601 문자열을 Date 객체로 변환
            birth: user.birth ? new Date(user.birth) : null,
            // Express에서 받아온 gender 값을 불리언으로 변환
            gender:
              user.gender === false
                ? false
                : user.gender === true
                ? true
                : null,
          });
        } catch (err) {
          setError("Failed to fetch user data for editing: " + err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // 성별(gender) 필드가 체크박스/라디오 버튼이라면 `checked`를 사용
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleGenderChange = (value) => {
    // 0: 남성 (false), 1: 여성 (true)
    setFormData({ ...formData, gender: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, birth: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Express 서버로 보낼 데이터 준비
    const dataToSend = {
      ...formData,
      // Date 객체를 ISO 8601 문자열로 변환하여 전송
      birth: formData.birth ? formData.birth.toISOString() : null,
      // 불리언 값을 0 (남성) 또는 1 (여성)로 변환하여 전송
      gender:
        formData.gender === false ? 0 : formData.gender === true ? 1 : null,
    };

    // 비밀번호 필드가 비어있고 수정 모드라면, 비밀번호를 보내지 않음
    if (isEditMode && dataToSend.password === "") {
      delete dataToSend.password;
    }

    try {
      if (isEditMode) {
        await userApi.updateUser(id, dataToSend);
        alert("User updated successfully!");
      } else {
        // 추가 모드에서는 비밀번호가 필수로 있어야 합니다.
        if (!dataToSend.password) {
          setError("Password is required for new user registration.");
          setLoading(false);
          return;
        }
        await userApi.createUser(dataToSend);
        alert("User added successfully!");
      }
      navigate("/users");
    } catch (err) {
      setError(
        `Failed to ${isEditMode ? "update" : "add"} user. ` + err.message
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div>Loading user data...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div
      style={{ padding: "20px", border: "1px solid #eee", borderRadius: "8px" }}
    >
      <h2>{isEditMode ? "Edit User" : "Add New User"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        {/* 1. 역할(Role) 드롭다운 메뉴 */}
        <div>
          <label
            htmlFor="role"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Role:
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. 이메일 (email) - type="email"로 제약 강화 */}
        <div>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Email:
          </label>
          <input
            type="email" // 이메일 형식 제약을 위한 타입
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" // 추가적인 패턴 검증 (선택 사항)
            title="Please enter a valid email address."
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 3. 비밀번호 (password) - 추가 시 필수, 수정 시 선택 */}
        <div>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Password:
          </label>
          <input
            type="password" // 비밀번호 타입
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            // 새로운 사용자 추가 시에만 필수. 수정 시에는 비밀번호를 비워두면 기존 비밀번호 유지
            required={!isEditMode}
            placeholder={
              isEditMode
                ? "Leave blank to keep current password"
                : "Enter password"
            }
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 4. 이름 (name) */}
        <div>
          <label
            htmlFor="name"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 5. 생년월일 (birth) - React-datepicker 사용 */}
        <div>
          <label
            htmlFor="birth"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Date of Birth:
          </label>
          <DatePicker
            id="birth"
            selected={formData.birth}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd" // 날짜 형식
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={15}
            placeholderText="Select Date"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 6. 성별 (gender) - 라디오 버튼 사용 */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Gender:
          </label>
          <div>
            <input
              type="radio"
              id="genderMale"
              name="gender"
              value="false" // 남성: false (0)
              checked={formData.gender === false}
              onChange={() => handleGenderChange(false)}
            />
            <label
              htmlFor="genderMale"
              style={{ marginLeft: "5px", marginRight: "15px" }}
            >
              Male
            </label>

            <input
              type="radio"
              id="genderFemale"
              name="gender"
              value="true" // 여성: true (1)
              checked={formData.gender === true}
              onChange={() => handleGenderChange(true)}
            />
            <label htmlFor="genderFemale" style={{ marginLeft: "5px" }}>
              Female
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {loading ? "Saving..." : isEditMode ? "Update User" : "Add User"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/users")}
            style={{
              padding: "10px 15px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserFormPage;
