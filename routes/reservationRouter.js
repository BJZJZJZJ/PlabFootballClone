const express = require("express");
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();
const reservationController = require("../controllers/reservationController.js");

/**
 * @swagger
 * /api/reservation/all:
 *   get:
 *     summary: 모든 예약 조회
 *     tags: [Reservations]
 *     responses:
 *       201:
 *         description: 모든 예약 조회 성공
 *       500:
 *         description: 서버 에러
 */
router.get("/all", reservationController.getAllReservations);

/**
 * @swagger
 * /api/reservation/my:
 *   get:
 *     summary: 로그인된 유저의 예약 목록 반환
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 유저의 예약 목록 조회 성공. 없으면 공백
 *       500:
 *         description: 서버 에러
 */
router.get("/my", authenticate, reservationController.getReservationByLogined);

/**
 * @swagger
 * /api/reservation:
 *   post:
 *     summary: 예약 추가
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - matchId
 *             properties:
 *               userId:
 *                 type: string
 *                 example : 6879ad64782fe9fd585c1279
 *               matchId:
 *                 type: string
 *                 example : 68627dc223b934b40c3f19a1
 *     responses:
 *       201:
 *         description: 예약 추가 성공
 *       400:
 *         description: 이미 예약된 매치
 *       404:
 *         description: 매치 없음
 *       500:
 *         description: 서버 에러
 */
router.post("/", authenticate, reservationController.addReservation);

/**
 * @swagger
 * /api/reservation/{id}:
 *   get:
 *     summary: ID로 예약 정보 조회
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example : 68651c9499880c447cd9718f
 *         required: true
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: 예약 정보 조회 성공
 *       404:
 *         description: 예약 없음
 *       500:
 *         description: 서버 에러
 */
router.get("/:id", authenticate, reservationController.getReservationById);

/**
 * @swagger
 * /api/reservation/{id}:
 *   put:
 *     summary: 예약 상태 수정 (예약 / 취소) / Soft Delete
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example : 68651c9499880c447cd9718f
 *         required: true
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example : 6879ad64782fe9fd585c1279
 *               matchId:
 *                 type: string
 *                 example : 68627dc223b934b40c3f19a1
 *               status:
 *                 type: string
 *                 example : "예약"
 *     responses:
 *       200:
 *         description: 예약 상태 갱신 성공
 *       400:
 *         description: Bad request
 *       404:
 *         description: 예약 / 매치 조회 실패
 *       500:
 *         description: 서버 에러
 */
router.put("/:id", authenticate, reservationController.updateReservation); // 부분 업데이트

/**
 * @swagger
 * /api/reservation/{id}:
 *   delete:
 *     summary: 예약 삭제 (Hard Delete)
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: 예약 삭제 성공
 *       404:
 *         description: 예약 조회 실패
 *       500:
 *         description: 서버 에러
 */
router.delete("/:id", authenticate, reservationController.deleteReservation);

module.exports = router;
