const mongoose = require("mongoose");

const subFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true }, // A구장 , B구장 등등

  // maximumPlayers: { type: Number, required: true }, // 최대 수용 인원
  // currentPlayers: { type: Number, default: 0 }, // 현재 수용 인원
  // spotsLeft: { type: Number, default: 0 }, // 남은 자리 수

  // count collection 에서 값 가져와서 등록
  // 경기장 ID (고유 식별자)
  id: {
    type: Number,
    required: true,
    unique: true,
  },

  stadium: {
    ref: "Stadium",
    type: mongoose.Schema.Types.ObjectId,
  },

  match: {
    ref: "Match",
    type: mongoose.Schema.Types.ObjectId,
  },

  size: {
    width: { type: Number, required: true }, // 가로 길이
    height: { type: Number, required: true }, // 세로 길이
  },

  indoor: { type: Boolean, default: false }, // 실내 여부
  surface: { type: String, default: "잔디" }, // 잔디, 인조잔디, 아스팔트 등
});

const SubFieldModel = mongoose.model("SubField", subFieldSchema, "SubField");
module.exports = SubFieldModel;
