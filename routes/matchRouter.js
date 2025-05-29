const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const matchController = require("../controllers/matchController.js");

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/match/{id}:
 *   get:
 *     summary: 특정 ID의 매치 조회
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 매치 ID
 *     responses:
 *       200:
 *         description: 매치 정보 조회 성공
 *       404:
 *         description: 매치가 존재하지 않음
 *       500:
 *         description: 서버 오류
 */
router.get("/:id", matchController.getMatchById);


/**
 * @swagger
 * /api/match/add:
 *   post:
 *     summary: 새 매치 등록
 *     tags: [Match]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *               durationMinutes:
 *                 type: integer
 *               subFieldId:
 *                 type: string
 *               conditions:
 *                 type: string
 *               fee:
 *                 type: number
 *               participantInfo:
 *                 type: object
 *             required:
 *               - dateTime
 *               - durationMinutes
 *               - subFieldId
 *     responses:
 *       201:
 *         description: 매치 등록 성공
 *       404:
 *         description: SubField 존재하지 않음
 *       500:
 *         description: 서버 오류
 */
router.post("/add", authenticate, matchController.addMatch);

module.exports = router;
