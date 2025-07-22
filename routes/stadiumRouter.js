const express = require("express");
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();
const stadiumController = require("../controllers/stadiumController.js");

/**
 * @swagger
 * /api/stadium:
 *   get:
 *     summary: 전체 stadium 조회
 *     tags: [Stadiums]
 *     responses:
 *       200:
 *         description: stadium 조회 성공
 *       500:
 *         description: 서버 에러
 */
router.get("/", stadiumController.getStadium);

/**
 * @swagger
 * /api/stadium/{id}:
 *   get:
 *     summary: ID를 통한 stadium 조회
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example : 6854cb333ff05b1bae8d9f58
 *         required: true
 *         description: Stadium ID
 *     responses:
 *       200:
 *         description: stadium 조회 성공
 *       404:
 *         description: Stadium 없음
 *       500:
 *         description: 서버 에러
 */
router.get("/:id", stadiumController.getStadiumById);

/**
 * @swagger
 * /api/stadium:
 *   post:
 *     summary: 새로운 Stadium 추가
 *     tags: [Stadiums]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stadium'
 *     responses:
 *       201:
 *         description: Stadium created successfully
 *       500:
 *         description: Server error
 */
router.post("/", stadiumController.addStadium);

/**
 * @swagger
 * /api/stadium/{id}:
 *   put:
 *     summary: Stadium 정보 수정
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stadium ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stadium'
 *     responses:
 *       200:
 *         description: Stadium 정보 수정 성공
 *       404:
 *         description: Stadium 조회 실패
 *       500:
 *         description: 서버 에러
 */
router.put("/:id", stadiumController.updateStadium);

/**
 * @swagger
 * /api/stadium/{id}:
 *   delete:
 *     summary: Stadium 삭제
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stadium ID
 *     responses:
 *       200:
 *         description: Stadium 삭제 성공
 *       404:
 *         description: Stadium 조회 실패
 *       500:
 *         description: 서버 에러
 */
router.delete("/:id", stadiumController.deleteStadium);

/**
 * @swagger
 * /api/stadium/subfield:
 *   post:
 *     summary: Stadium 내 subfield 추가
 *     tags: [Stadiums]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubField'
 *     responses:
 *       201:
 *         description: subfield 생성 성공
 *       400:
 *         description: stadiumId 부재
 *       404:
 *         description: Stadium 없음
 *       500:
 *         description: 서버에러
 */
router.post("/subField", stadiumController.addSubField);

/**
 * @swagger
 * /api/stadium/subfield/all:
 *   get:
 *     summary: 모든 subField 조회
 *     tags: [Stadiums]
 *     responses:
 *       200:
 *         description: subField 조회 성공
 *       500:
 *         description: 서버 에러
 */
router.get("/subField/all", stadiumController.getAllSubField);

/**
 * @swagger
 * /api/stadium/subfield/{id}:
 *   get:
 *     summary: ID를 통한 subField 조회
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subfield ID
 *     responses:
 *       200:
 *         description: subField 조회 성공
 *       404:
 *         description: 
 *       500:
 *         description: Server error
 */
router.get("/subField/:id", stadiumController.getSubFieldById);

/**
 * @swagger
 * /api/stadium/subfield/{id}:
 *   put:
 *     summary: Update a subfield
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subfield ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubField'
 *     responses:
 *       200:
 *         description: Subfield updated successfully
 *       404:
 *         description: Subfield not found
 *       500:
 *         description: Server error
 */
router.put("/subField/:id", stadiumController.updateSubField);

/**
 * @swagger
 * /api/stadium/subfield/{id}:
 *   delete:
 *     summary: Delete a subfield
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subfield ID
 *     responses:
 *       200:
 *         description: Subfield deleted successfully
 *       404:
 *         description: Subfield not found
 *       500:
 *         description: Server error
 */
router.delete("/subField/:id", stadiumController.deleteSubField);

module.exports = router;
