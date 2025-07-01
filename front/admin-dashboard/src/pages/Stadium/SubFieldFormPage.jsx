// src/pages/Field/subFieldFormPage.jsx
import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import fieldApi from "../../api/fieldApi"; // 위에서 생성한 fieldApi 임포트
import matchApi from "../../api/matchApi"; // stadiumId 드롭다운을 위해 필요 (선택 사항)

function subFieldFormPage() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 쿼리 파라미터에서 stadiumId와 subFieldId를 가져옵니다.
  const queryStadiumId = searchParams.get("stadiumId");
  const querySubFieldId = searchParams.get("subFieldId");

  // 모드 결정 로직:
  // stadiumId가 있고 subFieldId가 없으면 '추가' 모드
  // subFieldId가 있고 stadiumId가 없으면 '수정' 모드
  // 둘 다 있거나 둘 다 없으면 유효하지 않은 접근으로 간주
  const isAddMode = Boolean(queryStadiumId);
  const isEditMode = Boolean(querySubFieldId);

  // 폼 데이터 초기 상태 정의
  const [formData, setFormData] = useState({
    fieldName: "",
    size: {
      width: "",
      height: "",
    },
    indoor: null, // 초기값을 null로 설정하여 사용자가 선택하도록 유도
    surface: "",
    stadiumId: isAddMode ? queryStadiumId : "", // 추가 모드면 queryStadiumId로 초기화
  });

  // 수정 모드일 때 기존 필드 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      // 'subFieldId'만 있을 때
      const fetchField = async () => {
        setLoading(true);
        try {
          // 'subFieldId'를 기반으로 필드 데이터를 조회하는 API를 호출해야 합니다.
          // 예: /api/fields?subFieldId=someSubId 또는 /api/fields/bySubFieldId/someSubId
          // 백엔드 API가 이 요청을 처리할 수 있어야 합니다.
          const field = await fieldApi.getFieldById(querySubFieldId); // 새로운 API 함수 필요

          setFormData({
            fieldName: field.fieldName || "",
            size: {
              width: field.size?.width || "",
              height: field.size?.height || "",
            },
            indoor: typeof field.indoor === "boolean" ? field.indoor : null,
            surface: field.surface || "",
            stadiumId: field.stadiumId || "",
          });
          setMatches(field.match || []); // matches가 없을 경우 빈 배열로 초기화
        } catch (err) {
          setError("Failed to fetch field data for editing: " + err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchField();
    } else if (isAddMode) {
      // 추가 모드 (stadiumId와 subFieldId 둘 다 있을 때)
      // 폼은 이미 쿼리 파라미터 값으로 초기화되었으므로 별도 데이터 페칭 불필요
    } else {
      // 유효하지 않은 접근 (두 쿼리 파라미터가 모두 없거나, 모드 조건에 맞지 않을 때)
      setError(
        "Invalid access. Please provide appropriate query parameters (stadiumId and/or subFieldId)."
      );
    }
  }, [isEditMode, isAddMode, querySubFieldId]); // 모드나 subFieldId 변경 시 재실행

  // 경기장 목록 불러오기 (stadiumId 드롭다운에 사용)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "width" || name === "height") {
      setFormData((prev) => ({
        ...prev,
        size: {
          ...prev.size,
          [name]: value,
        },
      }));
    } else if (type === "radio" && name === "indoor") {
      setFormData((prev) => ({
        ...prev,
        indoor: value === "true" ? true : false, // 문자열 'true'/'false'를 boolean으로 변환
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await fieldApi.deleteField(id);
        alert("SubField deleted successfully!");
        navigate("/stadiums"); // 삭제 후 필드 목록 페이지로 이동
      } catch (err) {
        alert("Failed to delete Stadium. " + err.message); // 에러 메시지 표시
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 필드 유효성 검사 (예시)
    if (
      !formData.fieldName ||
      !formData.size.width ||
      !formData.size.height ||
      formData.indoor === null ||
      !formData.surface
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        await fieldApi.updateField(querySubFieldId, formData);
        alert("Field updated successfully!");
      } else {
        await fieldApi.createField(formData);
        alert("Field added successfully!");
      }
      navigate("/stadiums"); // 작업 완료 후 필드 목록 페이지로 이동 (아직 없으면 생성 필요)
    } catch (err) {
      setError(
        `Failed to ${isEditMode ? "update" : "add"} field. ` + err.message
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div>Loading field data...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

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
      <h2>{isEditMode ? "Edit Field" : "Add New Field"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        {/* 필드 이름 */}
        <div>
          <label
            htmlFor="fieldName"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Field Name:
          </label>
          <input
            type="text"
            id="fieldName"
            name="fieldName"
            value={formData.fieldName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* 크기 (width, height) */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Size (Width x Height):
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="number" // 숫자만 입력받도록
              id="width"
              name="width"
              value={formData.size.width}
              onChange={handleChange}
              required
              placeholder="Width"
              style={{
                width: "calc(50% - 5px)",
                padding: "8px",
                boxSizing: "border-box",
              }}
            />
            <input
              type="number" // 숫자만 입력받도록
              id="height"
              name="height"
              value={formData.size.height}
              onChange={handleChange}
              required
              placeholder="Height"
              style={{
                width: "calc(50% - 5px)",
                padding: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* 실내 여부 (Indoor) */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Indoor:
          </label>
          <div>
            <input
              type="radio"
              id="indoorTrue"
              name="indoor"
              value="true" // 문자열 'true'
              checked={formData.indoor === true}
              onChange={handleChange}
              required
            />
            <label
              htmlFor="indoorTrue"
              style={{ marginLeft: "5px", marginRight: "15px" }}
            >
              Yes (Indoor)
            </label>

            <input
              type="radio"
              id="indoorFalse"
              name="indoor"
              value="false" // 문자열 'false'
              checked={formData.indoor === false}
              onChange={handleChange}
              required
            />
            <label htmlFor="indoorFalse" style={{ marginLeft: "5px" }}>
              No (Outdoor)
            </label>
          </div>
        </div>

        {/* 바닥 재질 (Surface) */}
        <div>
          <label
            htmlFor="surface"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Surface Type:
          </label>
          <input
            type="text"
            id="surface"
            name="surface"
            value={formData.surface}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
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
            {loading ? "Saving..." : isEditMode ? "Update Field" : "Add Field"}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(querySubFieldId)}
            style={{
              padding: "10px 15px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => navigate("/stadiums")}
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
      {/* 기존 테이블 구조를 UL/LI로 변경 */}
      {matches.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            border: "1px solid #eee",
            borderRadius: "8px",
          }}
        >
          No matches found.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {/* 추가하고 싶은 글을 ul 태그 바로 아래에 div나 p 태그로 넣을 수 있습니다. */}
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#f9f9f9",
              border: "1px solid #ddd",
              borderRadius: "5px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            현재 등록된 매치 목록입니다.
          </div>
          {matches.map((match) => (
            <li
              key={match._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "15px",
                padding: "15px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.2em", color: "#333" }}>
                  <Link
                    to={`/matches/edit/${match._id}?subFieldId=${querySubFieldId}`}
                  >
                    {new Date(match.startTime).toLocaleString()}
                  </Link>
                </h3>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default subFieldFormPage;
