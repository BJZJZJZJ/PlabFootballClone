const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  // title: { type: String, required: true }, // 홈페이지에 보일 제목

  dateTime: { type: Date, required: true }, // 경기 시작 일시
  durationMinutes: { type: Number, required: true }, // 경기 진행 시간 (분)

  subField: {
    ref: "SubField",
    type: mongoose.Schema.Types.ObjectId,
  }, // 경기장 정보

  conditions: {
    level: String, // 경기 수준 (모든 레벨부터 ~)
    gender: String, // 참여 가능 성별 (남자, 여자, 혼성)
    matchFormat: String, // 경기 방식 (6v6 3파전 , 5v5 등)
    theme: String, // 풋살화 운동화
  },

  fee: { type: Number, required: true }, // 참가비

  participantInfo: {
    minimumPlayers: Number, // 최소 참가 인원 수
    maximumPlayers: Number, // 최대 참가 인원 수
    currentPlayers: { type: Number, default: 0 }, // 현재 참가 인원 수
    spotsLeft: Number, // 남은 자리 수
    isFull: { type: Boolean, default: false }, // 마감 여부
    applicationDeadlineMinutesBefore: { type: Number, default: 10 }, // 최대 신청 마감 시간 (분)
  },

  id: {
    type: String,
    required: true,
    unique: true,
  },

  // manager: {
  //   managerId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //     required: true,
  //   },
  //   name: String,
  // },

  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },

  status: {
    type: String,
    enum: ["모집중", "마감", "취소됨"],
    default: "모집중",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MatchModel = mongoose.model("Match", MatchSchema, "Match");
module.exports = MatchModel;
