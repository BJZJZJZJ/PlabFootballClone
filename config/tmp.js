/**
 * @swagger
 * /api/match/:
 *   get:
 *     summary: 매치 리스트 조회 (페이지 + 날짜 필터링)
 *     tags: [Match]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: yyyy-mm-dd 형식의 조회 날짜
 *     responses:
 *       200:
 *         description: 매치 리스트 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */

/**
 * @swagger
 * /api/match/:
 *  post:
 *       summary: 매치 생성
 *       description: 매치 정보 생성
 *       tags: [Match]
 *       requestBody:
 *           required: true
 *           content:
 *              application/json:
 *                  schema:
 *                  $ref: '#/models/matchModel'
 *       responses:
 *           201:
 *              description: 매치 생성됨
 *           400:
 *              description: 유효하지 않은 요청
 */

/**
 * @swagger
 * /api/match/{id}:
 *   get:
 *     summary: 매치 상세 조회
 *     description: 매치 ID로 매치 상세 정보 조회
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: 매치 정보
 *       '404':
 *         description: 매치를 찾을 수 없음
 */
