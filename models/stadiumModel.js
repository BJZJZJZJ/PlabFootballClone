const mongoose = require("mongoose");

const stadiumSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },

  name: { type: String, required: true }, // 경기장 명

  location: {
    province: { type: String }, // 도
    city: { type: String, required: true }, // 시, 군
    district: { type: String, required: true }, // 구, 읍, 면
    address: { type: String, required: true }, // 상세 주소
  },

  // count collection 에서 값 가져와서 등록
  // 경기장 ID (고유 식별자)

  // 서브 필드 정보
  subField: [
    {
      ref: "SubField",
      type: mongoose.Schema.Types.ObjectId,
    },
  ],

  // 경기장에서 제공하는 시설 정보
  facilities: {
    shower: { type: Boolean, default: false }, // 샤워실 여부
    freeParking: { type: Boolean, default: false }, // 주차장 무료
    shoesRental: { type: Boolean, default: false }, // 운동화 대여 여부
    vestRental: { type: Boolean, default: false }, // 조끼 대여 여부
    ballRental: { type: Boolean, default: false }, // 공 대여 여부
    drinkSale: { type: Boolean, default: false }, // 음료 판매 여부
    toiletGenderDivision: { type: Boolean, default: false }, // 화장실 성별 구분 여부
  },
});

const stadiumModel = mongoose.model("Stadium", stadiumSchema, "Stadium");
module.exports = stadiumModel;
