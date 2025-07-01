import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import stadiumApi from "../../api/stadiumApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFutbol,
  faCoffee,
  faParking,
  faTshirt,
  faShower,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

function StadiumListPage() {
  const [stadium, setStadium] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaidum();
  }, []);

  const fetchStaidum = async () => {
    try {
      setLoading(true);
      const data = await stadiumApi.getAllStadiums();

      setStadium(data);
    } catch (err) {
      setError("Failed to fetch stadium. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await stadiumApi.deleteStadium(id);
        alert("Stadium deleted successfully!");
        fetchStaidum(); // 목록 새로고침
      } catch (err) {
        alert("Failed to delete Stadium. " + err.message); // 에러 메시지 표시
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading stadiums...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h2>Stadium List</h2>
      <button onClick={() => navigate("/stadiums/add")}>Add New Stadium</button>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>주소</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>경기장</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>
              구장 (경기수)
            </th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>시설</th>

            <th style={{ padding: "8px", border: "1px solid #ddd" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {stadium.length > 0 ? (
            stadium.map((stadium) => (
              <tr key={stadium.id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {stadium.id}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {stadium.location.province +
                    " " +
                    stadium.location.city +
                    " " +
                    stadium.location.district +
                    " " +
                    stadium.location.address}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {stadium.name}
                </td>

                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {stadium.subField.map((field) => (
                    <Link
                      key={field._id}
                      to={`/subField/edit/?subFieldId=${field._id}?stadiumId=${stadium._id}`}
                      style={{ marginRight: "10px" }}
                    >
                      <div key={field.id}>
                        {field.fieldName} ( {field.match.length} )
                      </div>
                    </Link>
                  ))}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {stadium.facilities.ballRental && (
                    <FontAwesomeIcon
                      icon={faFutbol}
                      title="볼 대여"
                      style={{ marginRight: "5px", color: "green" }}
                    />
                  )}
                  {!stadium.facilities.ballRental && (
                    <FontAwesomeIcon
                      icon={faFutbol}
                      title="볼 대여 불가"
                      style={{ marginRight: "5px", color: "lightgray" }}
                    />
                  )}

                  {stadium.facilities.drinkSale && (
                    <FontAwesomeIcon
                      icon={faCoffee}
                      title="음료 판매"
                      style={{ marginRight: "5px", color: "green" }}
                    />
                  )}
                  {!stadium.facilities.drinkSale && (
                    <FontAwesomeIcon
                      icon={faCoffee}
                      title="음료 판매 불가"
                      style={{ marginRight: "5px", color: "lightgray" }}
                    />
                  )}

                  {stadium.facilities.freeParking && (
                    <FontAwesomeIcon
                      icon={faParking}
                      title="무료 주차"
                      style={{ marginRight: "5px", color: "green" }}
                    />
                  )}
                  {!stadium.facilities.freeParking && (
                    <FontAwesomeIcon
                      icon={faParking}
                      title="무료 주차 불가"
                      style={{ marginRight: "5px", color: "lightgray" }}
                    />
                  )}

                  {stadium.facilities.shoesRental ? (
                    <FontAwesomeIcon
                      icon={faTshirt}
                      title="신발 대여"
                      style={{ marginRight: "5px", color: "green" }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faTshirt}
                      title="신발 대여 불가"
                      style={{ marginRight: "5px", color: "lightgray" }}
                    />
                  )}

                  {stadium.facilities.shower ? (
                    <FontAwesomeIcon
                      icon={faShower}
                      title="샤워 시설"
                      style={{ marginRight: "5px", color: "green" }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faShower}
                      title="샤워 시설 없음"
                      style={{ marginRight: "5px", color: "lightgray" }}
                    />
                  )}

                  {stadium.facilities.toiletGenderDivision ? (
                    <>
                      <FontAwesomeIcon
                        icon={faCheck}
                        title="남녀 화장실 구분"
                        style={{ marginRight: "5px", color: "green" }}
                      />{" "}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faTimes}
                        title="남녀 화장실 구분 없음"
                        style={{ marginRight: "5px", color: "red" }}
                      />
                    </>
                  )}

                  {stadium.facilities.vestRental ? (
                    <FontAwesomeIcon
                      icon={faTshirt}
                      title="조끼 대여"
                      style={{ marginRight: "5px", color: "green" }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faTshirt}
                      title="조끼 대여 불가"
                      style={{ marginRight: "5px", color: "lightgray" }}
                    />
                  )}
                </td>

                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <Link
                    to={`/subField/add?stadiumId=${stadium._id}`}
                    style={{ marginRight: "10px" }}
                  >
                    구장추가
                  </Link>
                  <Link
                    to={`/stadiums/edit/${stadium._id}`}
                    style={{ marginRight: "10px" }}
                  >
                    수정
                  </Link>
                  <button onClick={() => handleDelete(stadium._id)}>
                    삭제
                  </button>
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
                No Stadium found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StadiumListPage;
