const express = require("express");
const router = express.Router();
const authenticate = require("../utils/authenticate.js");
const upload = require("../utils/multer"); // multer 설정 파일

const userController = require("../controllers/userController.js");

/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - birth
 *               - gender
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 example : pwdtest
 *               name:
 *                 type: string
 *               birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 default: "0"
 *               role:
 *                 type: string
 *                 default: "user"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       401:
 *         description: 이미 존재하는 이메일
 *       500:
 *         description: 서버 에러
 */
router.post("/signup", userController.signUp);

/**
 * @swagger
 * /api/user/signin:
 *   post:
 *     summary: 로그인
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 example : pwdtest
 *     responses:
 *       201:
 *         description: 로그인 성공
 *       401:
 *         description: 로그인 실패
 *       500:
 *         description: 서버 오류
 */
router.post("/signin", userController.signIn);

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
router.post("/logout", userController.logout);

/**
 * @swagger
 * /api/user/get-user:
 *   get:
 *     summary: 로그인 된 유저의 권한과 ID 정보 반환
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 정보 반환
 *       500:
 *         description: 서버 에러
 */
router.get("/get-user", authenticate, userController.getUser);

/**
 * @swagger
 * /api/user/get-user-detail:
 *   post:
 *     summary: 로그인 된 유저의 회원정보 수정 시 사용 할 api (였던것)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example : pwdtest
 *     responses:
 *       200:
 *         description: 유저 정보 반환
 *       401:
 *         description: 인증 실패 (개인정보 오류)
 *       404:
 *         description: 유저 정보 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/get-user-detail", authenticate, userController.getUserDetail);

/**
 * @swagger
 * /api/user/:
 *   get:
 *     summary: 모든 유저 정보 조회
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 모든 유저 정보 조회
 *       500:
 *         description: 서버 에러
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: 특정 유저의 정보 조회
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 6879ad64782fe9fd585c1279
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: 유저 정보 반환
 *       404:
 *         description: 유저 없음
 *       500:
 *         description: 서버 에러
 */
router.get("/:id", authenticate, userController.getUserById);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: 유저 정보 수정
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 6879ad64782fe9fd585c1279
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 default: "0"
 *               role:
 *                 type: string
 *                 default: "user"
 *     responses:
 *       200:
 *         description: 유저정보 수정 성공
 *       404:
 *         description: 유저 정보 없음
 *       500:
 *         description: 서버 에러
 */
router.put("/:id", authenticate, userController.updateProfile);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: 유저 정보 삭제
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: aaaaaaaaaaaaaaaaaaaaaaa0
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: 유저 정보 삭제 성공
 *       404:
 *         description: 유저 정보 없음
 *       500:
 *         description: 서버 에러
 */
router.delete("/:id", authenticate, userController.deleteUser);

module.exports = router;
