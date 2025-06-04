const Stadium = require("../models/stadiumModel"); // DB 모델
const express = require("express");
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();
const stadiumController = require("../controllers/stadiumController.js");

/**
 * @swagger
 * /api/stadium:
 *   get:
 *     summary: 모든 경기장 목록 조회
 *     tags: [Stadium]
 *     responses:
 *       200:
 *         description: 모든 경기장 정보 반환 (subField 포함)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   location:
 *                     type: object
 *                     properties:
 *                       province:
 *                         type: string
 *                       city:
 *                         type: string
 *                       district:
 *                         type: string
 *                       address:
 *                         type: string
 *                   facilities:
 *                     type: object
 *                     properties:
 *                       shower:
 *                         type: boolean
 *                       freeParking:
 *                         type: boolean
 *                       shoesRental:
 *                         type: boolean
 *                       vestRental:
 *                         type: boolean
 *                       ballRental:
 *                         type: boolean
 *                       drinkSale:
 *                         type: boolean
 *                       genderDivision:
 *                         type: boolean
 *                   subField:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         fieldName:
 *                           type: string
 *                         size:
 *                           type: object
 *                           properties:
 *                             width:
 *                               type: number
 *                             height:
 *                               type: number
 *                         indoor:
 *                           type: boolean
 *                         surface:
 *                           type: string
 *                         match:
 *                           type: array
 *                           items:
 *                             type: object
 *       500:
 *         description: 서버 오류로 조회 실패
 */
router.get("/", stadiumController.getStadium);

/**
 * @swagger
 * /api/stadium/{id}:
 *   get:
 *     tags: [Stadium]
 *     summary: 특정 경기장 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 경기장 ID
 *     responses:
 *       200:
 *         description: 경기장 정보 반환
 *       404:
 *         description: 경기장을 찾을 수 없음
 */
router.get("/:id", stadiumController.getStadiumById);

// 경기장 등록
/**
 * @swagger
 * /api/stadium:
 *   post:
 *     tags: [Stadium]
 *     summary: 경기장과 서브필드를 함께 등록
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   province:
 *                     type: string
 *                   city:
 *                     type: string
 *                   district:
 *                     type: string
 *                   address:
 *                     type: string
 *               facilities:
 *                 type: object
 *                 properties:
 *                   shower:
 *                     type: boolean
 *                   freeParking:
 *                     type: boolean
 *                   shoesRental:
 *                     type: boolean
 *                   vestRental:
 *                     type: boolean
 *                   ballRental:
 *                     type: boolean
 *                   drinkSale:
 *                     type: boolean
 *                   genderDivision:
 *                     type: boolean
 *               subFields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fieldName:
 *                       type: string
 *                     size:
 *                       type: object
 *                       properties:
 *                         width:
 *                           type: string
 *                         height:
 *                           type: string
 *                     indoor:
 *                       type: boolean
 *                     surface:
 *                       type: string
 *     responses:
 *       201:
 *         description: 등록 성공
 *       500:
 *         description: 서버 오류
 */
router.post("/", stadiumController.addStadium);

// 서브 필드 추가
/**
 * @swagger
 * /api/stadium/subField:
 *   post:
 *     summary: 서브필드 추가
 *     tags: [SubField]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *               size:
 *                 type: object
 *                 properties:
 *                   width:
 *                     type: string
 *                   height:
 *                     type: string
 *               indoor:
 *                 type: boolean
 *               surface:
 *                 type: string
 *               stadiumId:
 *                 type: string
 *             required:
 *               - fieldName
 *               - size
 *               - indoor
 *               - surface
 *               - stadiumId
 *     responses:
 *       201:
 *         description: 서브필드 등록 성공
 *       404:
 *         description: stadium 존재하지 않음
 *       500:
 *         description: 서버 오류
 */
router.post("/subField", stadiumController.addSubField);

module.exports = router;
