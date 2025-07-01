const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const matchController = require("../controllers/matchController.js");

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/match:
 *   get:
 *     summary: 특정 날짜 모든 매치 목록 조회
 *     tags: [Match]
 *     responses:
 *       200:
 *         description: 모든 매치 정보 반환 (subField 및 stadium 포함)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   dateTime:
 *                     type: string
 *                     format: date-time
 *                   durationMinutes:
 *                     type: integer
 *                   conditions:
 *                     type: string
 *                   fee:
 *                     type: integer
 *                   participantInfo:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: integer
 *                       max:
 *                         type: integer
 *                   subField:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fieldName:
 *                         type: string
 *                       size:
 *                         type: object
 *                         properties:
 *                           width:
 *                             type: number
 *                           height:
 *                             type: number
 *                       indoor:
 *                         type: boolean
 *                       surface:
 *                         type: string
 *                       stadium:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           location:
 *                             type: object
 *                             properties:
 *                               province:
 *                                 type: string
 *                               city:
 *                                 type: string
 *                               district:
 *                                 type: string
 *                               address:
 *                                 type: string
 *       500:
 *         description: 서버 오류로 조회 실패
 */
router.get("/", matchController.getMatchByDate);

router.get("/all", matchController.getAllMatch);

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
 * /api/match:
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
router.post("/", matchController.addMatch);

/**
 * @swagger
 * /api/match/{id}:
 *   patch:
 *     summary: 매치 정보 수정
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 수정할 매치 ID
 *         schema:
 *           type: string
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
 *               subField:
 *                 type: string
 *               conditions:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: 수정된 매치 정보 반환
 *       404:
 *         description: 매치를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put("/:id", matchController.updateMatch);
router.delete("/:id", matchController.deleteMatch);

module.exports = router;
