// src/pages/Match/MatchFormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"; // useSearchParams 임포트
import matchApi from "../../api/matchApi";
import subFieldApi from "../../api/fieldApi"; // subFieldApi 임포트
import DatePicker from "react-datepicker"; // DatePicker 임포트
import "react-datepicker/dist/react-datepicker.css"; // DatePicker 스타일

function MatchFormPage() {
  const { id } = useParams(); // URL에서 매치 ID 가져오기 (수정 모드일 경우)
  const navigate = useNavigate();

  const [searchParams] = useSearchParams(); // 쿼리 파라미터 가져오기
  const querySubFieldId = searchParams.get("subFieldId"); // subFieldId 쿼리 파라미터

  const [formData, setFormData] = useState({
    startTime: null, // 경기 시작 일시 (Date 객체)
    durationMinutes: "", // 경기 진행 시간 (분)
    subFieldId: querySubFieldId || "", // 필드 ID

    conditions: {
      level: "", // 경기 수준
      gender: "", // 참여 가능 성별
      matchFormat: "", // 경기 방식
      theme: "", // 풋살화 운동화
    },

    fee: "", // 참가비

    participantInfo: {
      minimumPlayers: "", // 최소 참가 인원 수
      maximumPlayers: "", // 최대 참가 인원 수
      currentPlayers: 0, // 현재 참가 인원 수 (초기값 0)
      spotsLeft: "", // 남은 자리 수 (서버 또는 클라이언트에서 계산)
      isFull: false, // 마감 여부 (초기값 false)
      applicationDeadlineMinutesBefore: 10, // 신청 마감 시간 (분)
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subFields, setSubFields] = useState([]); // 서브필드 목록 스테이트 추가

  const isEditMode = Boolean(id); // ID가 있으면 수정 모드

  // 모든 서브필드 목록 불러오기
  useEffect(() => {
    const fetchSubFields = async () => {
      try {
        const data = await subFieldApi.getAllFields();
        // API 응답 구조에 따라 적절히 수정: data.data 또는 data.subFields
        setSubFields(
          Array.isArray(data) ? data : data.data || data.subFields || []
        );
      } catch (err) {
        console.error("Failed to fetch subFields for dropdown:", err);
        setError("Failed to load sub-fields. Please try again.");
      }
    };
    fetchSubFields();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 수정 모드일 때 기존 매치 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      const fetchMatch = async () => {
        setLoading(true);
        try {
          const match = await matchApi.getMatchById(id);

          setFormData({
            startTime: match.startTime ? new Date(match.startTime) : null,
            durationMinutes: match.durationMinutes || "",
            // 백엔드에서 subField가 populate되어 객체로 온다면 match.subField._id, 아니면 match.subFieldId
            subFieldId: match.subField?._id || match.subFieldId || "",
            conditions: {
              level: match.conditions?.level || "",
              gender: match.conditions?.gender || "",
              matchFormat: match.conditions?.matchFormat || "",
              theme: match.conditions?.theme || "",
            },
            fee: match.fee || "",
            participantInfo: {
              minimumPlayers: match.participantInfo?.minimumPlayers || "",
              maximumPlayers: match.participantInfo?.maximumPlayers || "",
              currentPlayers: match.participantInfo?.currentPlayers || 0,
              spotsLeft: match.participantInfo?.spotsLeft || "",
              isFull: match.participantInfo?.isFull || false,
              applicationDeadlineMinutesBefore:
                match.participantInfo?.applicationDeadlineMinutesBefore || 10,
            },
          });
        } catch (err) {
          setError("Failed to fetch match data for editing: " + err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchMatch();
    }
  }, [id, isEditMode, querySubFieldId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === "number" && value !== "" ? Number(value) : value;

    if (name.startsWith("conditions.")) {
      const conditionField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          [conditionField]: parsedValue,
        },
      }));
    } else if (name.startsWith("participantInfo.")) {
      const participantField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        participantInfo: {
          ...prev.participantInfo,
          [participantField]: parsedValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));
    }
  };

  const handlestartTimeChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      startTime: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      startTime,
      durationMinutes,
      subFieldId,
      conditions,
      fee,
      participantInfo,
    } = formData;
    if (
      !startTime ||
      !durationMinutes ||
      !subFieldId ||
      !conditions.level ||
      !conditions.gender ||
      !conditions.matchFormat ||
      !conditions.theme ||
      fee === "" ||
      !participantInfo.minimumPlayers ||
      !participantInfo.maximumPlayers
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      startTime: formData.startTime ? formData.startTime.toISOString() : null,
      participantInfo: {
        minimumPlayers: formData.participantInfo.minimumPlayers,
        maximumPlayers: formData.participantInfo.maximumPlayers,
        applicationDeadlineMinutesBefore:
          formData.participantInfo.applicationDeadlineMinutesBefore,
      },
    };
    if (!isEditMode) {
      dataToSend.participantInfo.currentPlayers = 0;
      dataToSend.participantInfo.isFull = false;
    }

    try {
      if (isEditMode) {
        await matchApi.updateMatch(id, dataToSend);
        alert("Match updated successfully!");
      } else {
        await matchApi.createMatch(dataToSend);
        alert("Match added successfully!");
      }
      navigate("/matches");
    } catch (err) {
      setError(
        `Failed to ${isEditMode ? "update" : "add"} match. ` + err.message
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div>Loading match data...</div>;
  // 서브필드 로딩 중에는 다른 로딩 메시지를 보여줄 수 있습니다.
  if (loading) return <div>Loading form data...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "8px",
        maxWidth: "800px",
        margin: "20px auto",
      }}
    >
      <h2>{isEditMode ? "Edit Match" : "Add New Match"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* 경기 시작 일시 (startTime) */}
        <div>
          <label
            htmlFor="startTime"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            경기 시작 일시 (날짜 및 시간):
          </label>
          <DatePicker
            id="startTime"
            selected={formData.startTime}
            onChange={handlestartTimeChange}
            showTimeSelect
            dateFormat="yyyy/MM/dd HH:mm"
            timeIntervals={15}
            timeCaption="Time"
            placeholderText="Select date and time"
            required
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* 경기 진행 시간 (durationMinutes) */}
        <div>
          <label
            htmlFor="durationMinutes"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            경기 진행 시간 (분):
          </label>
          <input
            type="number"
            id="durationMinutes"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleChange}
            required
            min="1"
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* SubField ID */}
        {/* SubField ID 드롭다운으로 변경 */}
        <div>
          <label
            htmlFor="subFieldId"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Select SubField:
          </label>
          <select
            id="subFieldId"
            name="subFieldId"
            value={formData.subFieldId}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            // 서브필드 목록이 로딩 중일 때 비활성화
            disabled={(subFields.length === 0 && !loading) || isEditMode}
          >
            <option value="">-- Select a SubField --</option>
            {subFields.map((subField) => (
              <option key={subField._id} value={subField._id}>
                {/* 서브필드 정보 표시 (예: 경기장명 - 서브필드명 (크기)) */}
                {/* subField가 stadium을 populate 해왔을 때를 가정합니다. */}
                {subField.stadium?.name ? `${subField.stadium.name} - ` : ""}
                {subField.fieldName} ({subField.size?.width || ""}x
                {subField.size?.height || ""}m,{" "}
                {subField.indoor ? "Indoor" : "Outdoor"})
                {/* 만약 subField에 고유한 이름이나 번호가 있다면 그것을 사용해도 좋습니다. */}
              </option>
            ))}
          </select>
          {subFields.length === 0 && !loading && (
            <p style={{ color: "orange" }}>
              No sub-fields available. Please add sub-fields first.
            </p>
          )}
        </div>

        {/* 경기 조건 (conditions) */}
        <fieldset
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            경기조건
          </legend>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label
                htmlFor="conditions.level"
                style={{ display: "block", marginBottom: "5px" }}
              >
                수준
              </label>
              <select
                id="conditions.level"
                name="conditions.level"
                value={formData.conditions.level}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select Level</option>
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="conditions.gender"
                style={{ display: "block", marginBottom: "5px" }}
              >
                성별
              </label>
              <select
                id="conditions.gender"
                name="conditions.gender"
                value={formData.conditions.gender}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select Gender</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
                <option value="혼성">혼성</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="conditions.matchFormat"
                style={{ display: "block", marginBottom: "5px" }}
              >
                경기 방식
              </label>
              <input
                type="text"
                id="conditions.matchFormat"
                name="conditions.matchFormat"
                value={formData.conditions.matchFormat}
                onChange={handleChange}
                required
                placeholder="e.g., 6v6 3파전, 5v5"
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="conditions.theme"
                style={{ display: "block", marginBottom: "5px" }}
              >
                기타 조건 (풋살화, 운동화 등)
              </label>
              <input
                type="text"
                id="conditions.theme"
                name="conditions.theme"
                value={formData.conditions.theme}
                onChange={handleChange}
                required
                placeholder="e.g., Futsal shoes, Athletic shoes"
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>
        </fieldset>

        {/* 참가비 (fee) */}
        <div>
          <label
            htmlFor="fee"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            참가비:
          </label>
          <input
            type="number"
            id="fee"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            required
            min="0"
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* 참가자 정보 (participantInfo) */}
        <fieldset
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            참가자 정보
          </legend>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label
                htmlFor="participantInfo.minimumPlayers"
                style={{ display: "block", marginBottom: "5px" }}
              >
                최소 참여인원:
              </label>
              <input
                type="number"
                id="participantInfo.minimumPlayers"
                name="participantInfo.minimumPlayers"
                value={formData.participantInfo.minimumPlayers}
                onChange={handleChange}
                required
                min="1"
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="participantInfo.maximumPlayers"
                style={{ display: "block", marginBottom: "5px" }}
              >
                최대 참여인원:
              </label>
              <input
                type="number"
                id="participantInfo.maximumPlayers"
                name="participantInfo.maximumPlayers"
                value={formData.participantInfo.maximumPlayers}
                onChange={handleChange}
                required
                min="1"
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="participantInfo.applicationDeadlineMinutesBefore"
                style={{ display: "block", marginBottom: "5px" }}
              >
                모집마감시간 (분):
              </label>
              <input
                type="number"
                id="participantInfo.applicationDeadlineMinutesBefore"
                name="participantInfo.applicationDeadlineMinutesBefore"
                value={
                  formData.participantInfo.applicationDeadlineMinutesBefore
                }
                onChange={handleChange}
                required
                min="0"
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            {/* currentPlayers, spotsLeft, isFull은 사용자 입력이 아니라 서버에서 관리/계산되는 값으로 간주 */}
            {isEditMode && (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    현재 참여인원:
                  </label>
                  <input
                    type="number"
                    value={formData.participantInfo.currentPlayers}
                    disabled
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f0f0f0",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    남은 인원 수 :
                  </label>
                  <input
                    type="number"
                    value={
                      formData.participantInfo.spotsLeft ||
                      formData.participantInfo.maximumPlayers -
                        formData.participantInfo.currentPlayers
                    }
                    disabled
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f0f0f0",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    모집 마감 여부 :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.participantInfo.isFull}
                    disabled
                    style={{ margin: "8px" }}
                  />
                </div>
              </>
            )}
          </div>
        </fieldset>

        {/* 액션 버튼 */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Saving..." : isEditMode ? "Update Match" : "Add Match"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/matches")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default MatchFormPage;
