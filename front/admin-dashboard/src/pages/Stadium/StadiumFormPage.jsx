// src/pages/Stadium/StadiumFormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import stadiumApi from "../../api/stadiumApi"; // 위에서 생성한 stadiumApi 임포트

function StadiumFormPage() {
  const { id } = useParams(); // URL에서 경기장 ID 가져오기 (수정 모드일 경우)
  const navigate = useNavigate();

  // 폼 데이터 초기 상태 정의
  const [formData, setFormData] = useState({
    name: "",
    location: {
      province: "",
      city: "",
      district: "",
      address: "",
    },
    facilities: {
      shower: false,
      freeParking: false,
      shoesRental: false,
      vestRental: false,
      ballRental: false,
      drinkSale: false,
      toiletGenderDivision: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(id); // ID가 있으면 수정 모드

  // 수정 모드일 때 기존 경기장 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      const fetchStadium = async () => {
        setLoading(true);
        try {
          const stadium = await stadiumApi.getStadiumById(id);
          // API에서 받아온 데이터를 formData에 맞게 구조화
          setFormData({
            name: stadium.name || "",
            location: {
              province: stadium.location?.province || "",
              city: stadium.location?.city || "",
              district: stadium.location?.district || "",
              address: stadium.location?.address || "",
            },
            facilities: {
              shower: stadium.facilities?.shower || false,
              freeParking: stadium.facilities?.freeParking || false,
              shoesRental: stadium.facilities?.shoesRental || false,
              vestRental: stadium.facilities?.vestRental || false,
              ballRental: stadium.facilities?.ballRental || false,
              drinkSale: stadium.facilities?.drinkSale || false,
              toiletGenderDivision:
                stadium.facilities?.toiletGenderDivision || false,
            },
          });
        } catch (err) {
          setError("Failed to fetch stadium data for editing: " + err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchStadium();
    }
  }, [id, isEditMode]);

  // 일반 입력 필드 (name, location의 province, city, district, address, surface) 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    // location 객체 내부 필드 처리
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1]; // 'province', 'city' 등
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      // 일반 필드 처리 (name)
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 시설 (facilities) 체크박스 변경 핸들러
  const handleFacilityChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [name]: checked, // 체크박스는 checked 속성 사용
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 필드 유효성 검사 (기본적인 필수 필드 확인)
    const { name, location } = formData;
    if (
      !name ||
      !location.province ||
      !location.city ||
      !location.district ||
      !location.address
    ) {
      setError(
        "Please fill in all required fields (Name and Location details)."
      );
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        await stadiumApi.updateStadium(id, formData);
        alert("Stadium updated successfully!");
      } else {
        await stadiumApi.createStadium(formData);
        alert("Stadium added successfully!");
      }
      navigate("/stadiums"); // 작업 완료 후 경기장 목록 페이지로 이동 (아직 없으면 생성 필요)
    } catch (err) {
      setError(
        `Failed to ${isEditMode ? "update" : "add"} stadium. ` + err.message
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div>Loading stadium data...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "8px",
        maxWidth: "700px",
        margin: "20px auto",
      }}
    >
      <h2>{isEditMode ? "Edit Stadium" : "Add New Stadium"}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* 1. 경기장명 (name) */}
        <div>
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Stadium Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
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

        {/* 2. 위치 (location) */}
        <fieldset
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            Location Details
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
                htmlFor="location.province"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Province:
              </label>
              <input
                type="text"
                id="location.province"
                name="location.province"
                value={formData.location.province}
                onChange={handleChange}
                required
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
                htmlFor="location.city"
                style={{ display: "block", marginBottom: "5px" }}
              >
                City:
              </label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                required
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
                htmlFor="location.district"
                style={{ display: "block", marginBottom: "5px" }}
              >
                District:
              </label>
              <input
                type="text"
                id="location.district"
                name="location.district"
                value={formData.location.district}
                onChange={handleChange}
                required
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
                htmlFor="location.address"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Street Address:
              </label>
              <input
                type="text"
                id="location.address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                required
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

        {/* 3. 편의시설 (facilities) */}
        <fieldset
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
          }}
        >
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>
            Facilities
          </legend>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {Object.keys(formData.facilities).map((key) => (
              <div key={key} style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  id={key}
                  name={key}
                  checked={formData.facilities[key]}
                  onChange={handleFacilityChange}
                  style={{ marginRight: "8px" }}
                />
                <label htmlFor={key}>
                  {/* 각 시설 이름 예쁘게 표시 */}
                  {key === "shower" && "Shower Room"}
                  {key === "freeParking" && "Free Parking"}
                  {key === "shoesRental" && "Shoes Rental"}
                  {key === "vestRental" && "Vest Rental"}
                  {key === "ballRental" && "Ball Rental"}
                  {key === "drinkSale" && "Drink Sale"}
                  {key === "toiletGenderDivision" && "Gender-separated Toilets"}
                  {/* 다른 시설이 추가되면 여기에 로직 추가 */}
                </label>
              </div>
            ))}
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
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Stadium"
              : "Add Stadium"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/stadiums")}
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
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default StadiumFormPage;
