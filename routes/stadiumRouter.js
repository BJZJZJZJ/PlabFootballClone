const Stadium = require("../models/stadiumModel"); // DB 모델
const express = require("express");
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();
const stadiumController = require("../controllers/stadiumController.js");

router.get("/:id", stadiumController.getStadiumById);

// 경기장 등록
router.post("/add", authenticate, stadiumController.addStadium);

// 서브 필드 추가
router.post("/subField/add", authenticate, stadiumController.addSubField);

module.exports = router;
