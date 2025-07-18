const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const matchController = require("../controllers/matchController.js");

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/match:
 *   get:
 *     summary: 날짜별 현재 진행 가능한 매치 조회
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2025-07-10"
 *         required: true
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: 매치 목록 조회 성공
 *       400:
 *         description: 쿼리 파라미터 필요
 *       500:
 *         description: 서버 에러
 */
router.get("/", matchController.getMatchByDate);

/**
 * @swagger
 * /api/match/all:
 *   get:
 *     summary: 모든 매치 목록 조회
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: 모든 매치 목록 성공
 *       500:
 *         description: 서버 에러
 */
router.get("/all", matchController.getAllMatch);

/**
 * @swagger
 * /api/match/{id}:
 *   get:
 *     summary: 특정 ID 매치 조회
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example : "68627dc223b934b40c3f19a1"
 *         required: true
 *         description: Match ID
 *     responses:
 *       200:
 *         description: 매치 조회 성공
 *       404:
 *         description: 매치 조회 실패
 *       500:
 *         description: 서버 에러
 */
router.get("/:id", matchController.getMatchById);

/**
 * @swagger
 * /api/match:
 *   post:
 *     summary: 새로운 매치 생성
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Match'
 *     responses:
 *       201:
 *         description: 매치 생성 성공
 *       404:
 *         description: SubField 조회 실패
 *       409:
 *         description: 매치 시간 중복
 *       500:
 *         description: 서버 에러
 */
router.post("/", matchController.addMatch);

/**
 * @swagger
 * /api/match/{id}:
 *   put:
 *     summary: 매치 정보 수정
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example : "68627dc223b934b40c3f19a1"
 *         required: true
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Match'
 *     responses:
 *       200:
 *         description: 매치 정보 수정 성공
 *       404:
 *         description: 매치 조회 실패
 *       500:
 *         description: 서버 에러
 */
router.put("/:id", matchController.updateMatch);

/**
 * @swagger
 * /api/match/{id}:
 *   delete:
 *     summary: 매치 삭제
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Match ID
 *     responses:
 *       200:
 *         description: 매치 삭제 성공
 *       404:
 *         description: 매치 조회 실패
 *       500:
 *         description: 서버 에러
 */
router.delete("/:id", matchController.deleteMatch);

module.exports = router;
