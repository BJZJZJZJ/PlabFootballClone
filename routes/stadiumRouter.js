const Match = require("../models/matchModel"); // DB 모델
const express = require("express");
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();

router.get("/:id", async (req, res) => {});

// 경기장 등록
router.post("/add", async (req, res) => {
  try {
    // counter collection에서 stadium용 카운터 가져오기
    const counter = await Counter.findOneAndUpdate(
      { name: "stadium" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newStadium = new Stadium({
      ...req.body,
      id: `STD-${counter.seq.toString().padStart(5, "0")}`, // 예: STD-00001
    });

    const savedStadium = await newStadium.save();
    res.status(201).json(savedStadium);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 등록 실패" });
  }
});
