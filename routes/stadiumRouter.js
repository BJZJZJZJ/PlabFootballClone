const Stadium = require("../models/stadiumModel"); // DB 모델
const express = require("express");
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const stadium = await Stadium.findOne({ id: req.params.id }); // .populate(     "subField"    );
    if (!stadium)
      return res.status(404).json({ error: "경기장을 찾을 수 없습니다." });
    res.json(stadium);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 조회 실패" });
  }
});

// 경기장 등록
router.post("/add", authenticate, async (req, res) => {
  try {
    // counter collection에서 stadium용 카운터 가져오기
    const counter = await Counter.findOneAndUpdate(
      { name: "stadium" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newStadium = new Stadium({
      ...req.body,
      id: counter.seq, // stadium용 카운터 값 사용
    });

    const savedStadium = await newStadium.save();
    res.status(201).json(savedStadium);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 등록 실패" });
  }
});

module.exports = router;
