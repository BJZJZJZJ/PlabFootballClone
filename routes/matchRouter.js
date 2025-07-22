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
 *         description: 특정 날짜 이후 매치 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Match'
 *             examples:
 *               MatchFound:
 *                 summary: 특정 기간 매치 정보 반환
 *                 value:
 *                  data :
 *                   - conditions:
 *                       level: "중급 이상"
 *                       gender: "혼성"
 *                       matchFormat: "5v5"
 *                       theme: "풋살화"
 *                     participantInfo:
 *                       minimumPlayers: 8
 *                       maximumPlayers: 10
 *                       currentPlayers: 0
 *                       spotsLeft: 10
 *                       isFull: false
 *                       applicationDeadlineMinutesBefore: 30
 *                     _id: "68627dc223b934b40c3f19d6"
 *                     startTime: "2025-07-10T00:00:00.000Z"
 *                     durationMinutes: 90
 *                     endTime: "2025-07-10T01:30:00.000Z"
 *                     subField:
 *                       _id: "68625da4c216490c6a9a8af7"
 *                       fieldName: "ab구장"
 *                       stadium:
 *                         _id: 6854cb6c3ff05b1bae8d9f6c
 *                         name: 강원도 원주 무실동 경기장
 *                         location:
 *                           province: "강원도"
 *                           city: "원주시"
 *                           district: "무실동"
 *                           address: "어디일까 1414-2401233"
 *
 *
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
 *         description: 모든 매치 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Match'
 *             examples:
 *               MatchFound:
 *                 summary: 모든 매치 정보
 *                 value:
 *                  matches :
 *                   - conditions:
 *                       level: "중급 이상"
 *                       gender: "혼성"
 *                       matchFormat: "5v5"
 *                       theme: "풋살화"
 *                     participantInfo:
 *                       minimumPlayers: 8
 *                       maximumPlayers: 10
 *                       currentPlayers: 0
 *                       spotsLeft: 10
 *                       isFull: false
 *                       applicationDeadlineMinutesBefore: 30
 *                     _id: "68627dc223b934b40c3f19d6"
 *                     startTime: "2025-07-10T00:00:00.000Z"
 *                     durationMinutes: 90
 *                     endTime: "2025-07-10T01:30:00.000Z"
 *                     fee: 12000
 *                     status: "모집중"
 *                     subField:
 *                       _id: "68625da4c216490c6a9a8af7"
 *                       fieldName: "ab구장"
 *                       stadium:
 *                         _id: 6854cb6c3ff05b1bae8d9f6c
 *                         name: 강원도 원주 무실동 경기장
 *                         location:
 *                           province: "강원도"
 *                           city: "원주시"
 *                           district: "무실동"
 *                           address: "어디일까 1414-2401233"
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
 *           example : "68627dc223b934b40c3f19ac"
 *         required: true
 *         description: Match ID
 *     responses:
 *       200:
 *         description: ID를 통한 매치 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Match'
 *             examples:
 *               MatchFound:
 *                 summary: ID 매치 조회
 *                 value:
 *                     conditions:
 *                       level: "중급 이상"
 *                       gender: "혼성"
 *                       matchFormat: "5v5"
 *                       theme: "풋살화"
 *                     participantInfo:
 *                       minimumPlayers: 8
 *                       maximumPlayers: 10
 *                       currentPlayers: 0
 *                       spotsLeft: 10
 *                       isFull: false
 *                       applicationDeadlineMinutesBefore: 30
 *                     _id: "68627dc223b934b40c3f19d6"
 *                     startTime: "2025-07-10T00:00:00.000Z"
 *                     durationMinutes: 90
 *                     endTime: "2025-07-10T01:30:00.000Z"
 *                     fee: 12000
 *                     status: "모집중"
 *                     subField:
 *                       _id: "68625da4c216490c6a9a8af7"
 *                       fieldName: "ab구장"
 *                       stadium:
 *                         _id: 6854cb6c3ff05b1bae8d9f6c
 *                         name: 강원도 원주 무실동 경기장
 *                         location:
 *                           province: "강원도"
 *                           city: "원주시"
 *                           district: "무실동"
 *                           address: "어디일까 1414-2401233"
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
 *           example : "68627dc223b934b40c3f19ac"
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
