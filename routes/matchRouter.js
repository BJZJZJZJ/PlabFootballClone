const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const matchController = require("../controllers/matchController.js");

const express = require("express");
const router = express.Router();

router.get("/:id", matchController.getMatchById);

// 매치 생성 (GET /api/match/add)
router.post("/add", authenticate, matchController.addMatch);

module.exports = router;
