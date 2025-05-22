const Match = require("../models/matchModel"); // DB 모델
const express = require("express");
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();

// 1. 매치 리스트 조회 (GET /api/match)
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const dateQuery = req.query.date; // yyyy-mm-dd

  const query = {};

  if (dateQuery) {
    const startDate = new Date(dateQuery);
    const endDate = new Date(dateQuery);
    endDate.setDate(endDate.getDate() + 1); // 다음 날 0시까지

    query.dateTime = { $gte: startDate, $lt: endDate };
  }

  try {
    const matches = await Match.find(query)
      .sort({ dateTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Match.countDocuments(query);

    res.json({
      matches,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: "서버 오류" });
  }
});

// 2. 매치 생성 (POST /api/matches)
router.post("/", authenticate, async (req, res) => {
  try {
    const match = new Match(req.body);
    const saved = await match.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "입력값 오류", details: err.message });
  }
});

// 3. 단일 매치 조회 (GET /api/match/:id)
router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "매치를 찾을 수 없음" });
    res.json(match);
  } catch (err) {
    res.status(400).json({ error: "잘못된 요청" });
  }
});

module.exports = router;
