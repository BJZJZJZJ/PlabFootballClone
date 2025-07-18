const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController.js");

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Stadium 검색을 위한 API
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           example : "원주"
 *         required: true
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: 검색 조회 결과
 *       400:
 *         description: 검색 키워드 필수
 *       500:
 *         description: 서버에러
 */
router.get("/", searchController.search);

module.exports = router;
