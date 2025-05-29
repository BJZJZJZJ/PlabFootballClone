const Match = require("../models/matchModel"); // DB 모델
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델
const express = require("express");
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findOne({ id: req.params.id }).populate({
      path: "subField",
      populate: {
        path: "stadium", // subField > stadium 정보도 가져옴
        model: "Stadium",
      },
    });

    if (!match) {
      return res.status(404).json({ error: "경기를 찾을 수 없습니다." });
    }

    res.json(match);
  } catch (err) {
    console.error("경기 조회 오류:", err);
    res.status(500).json({ error: "경기 조회 실패" });
  }
});

// 매치 생성 (GET /api/match/add)
router.post("/add", async (req, res) => {
  try {
    const {
      dateTime,
      durationMinutes,
      subFieldId, // 반드시 전달해야 함
      conditions,
      fee,
      participantInfo,
    } = req.body;

    // 1. subField 존재 확인
    const subField = await SubField.findById(subFieldId);
    if (!subField) {
      return res
        .status(404)
        .json({ error: "해당 SubField를 찾을 수 없습니다." });
    }

    /*

    // 개선이 필요
    // 2. 매치 시간 겹침 여부 확인
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const overlappingMatch = await Match.findOne({
      subField: subFieldId,
      dateTime: {
        $lt: endTime,
        $gte: new Date(startTime.getTime() - durationMinutes * 60000), // 최소한 현재 경기 시간 안에 걸쳐있을 가능성 있는 match 체크
      },
    });

    if (overlappingMatch) {
      return res
        .status(409)
        .json({ error: "해당 시간대에 이미 예약된 매치가 있습니다." });
    }
    */

    // 카운터 증가
    const counter = await Counter.findOneAndUpdate(
      { name: "match" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const matchId = counter.seq;

    // 3. 매치 생성
    console.log("subField._Id", subField);
    const newMatch = await new Match({
      id: matchId,
      dateTime,
      durationMinutes,
      subField: subField._id,
      conditions,
      fee,
      participantInfo,
    });

    const savedMatch = await newMatch.save();

    // 4. SubField.match 배열에 추가
    subField.match.push(savedMatch._id);
    await subField.save();

    res
      .status(201)
      .json({ message: "매치가 성공적으로 생성되었습니다.", match: newMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "매치 생성 중 오류 발생" });
  }
});

module.exports = router;
