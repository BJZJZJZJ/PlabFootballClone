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
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                id:
 *                 type: string
 *                 description: "유저 고유 ID"
 *                 example: "6825ecd11b7ed07a429a4f1a"
 *                role:
 *                 type: string
 *                 description: "유저의 Role"
 *                 example: "User"
 *             examples:
 *               UserFound:
 *                 summary: 유저 정보 조회 성공 예시
 *                 value:
 *                  user :
 *                   id: 6825ecd11b7ed07a429a4f1a
 *                   role: user
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
 *         description: 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                email:
 *                 type: string
 *                 description: "유저 Email"
 *                 example: "test1234@test.com"
 *                name:
 *                 type: string
 *                 description: "유저 이름"
 *                 example: "전전김"
 *                birth:
 *                 type: string
 *                 description: "유저 생일 (ISO 8601 형식)"
 *                 format: date-time
 *                 example: "1995-11-03T00:00:00.000Z"
 *                _id:
 *                 type: string
 *                 description: "유저 고유 ID"
 *                 example: "6825ecd11b7ed07a429a4f1a"
 *                gender:
 *                 type: boolean
 *                 description: "유저의 성별 (남성 false, 여성 true)"
 *                 example: true
 *             examples:
 *               UserFound:
 *                 summary: 비밀번호 인증 및 유저 정보 반환
 *                 value:
 *                  user :
 *                   _id: 6825ecd11b7ed07a429a4f1a
 *                   email: test1234@test.com
 *                   birth: 1995-11-03T00:00:00.000Z
 *                   name: 전씨씨
 *                   gender: false
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
 *         description: 정보 반환
 *         content:
 *           application/json:
 *             scheama:
 *              $ref: '#/components/schemas/User'
 *             examples:
 *               FullUserInfo:
 *                 summary: 모든 유저 정보 반환
 *                 value:
 *                  - _id: 6825ecd11b7ed07a429a4f1a
 *                    email: test1234@test.com
 *                    birth: 2025-07-10
 *                    name: 전씨씨
 *                    gender: false
 *                    role: admin
 *                    reservation:
 *                     - 687c7e6a235057d352005a63
 *                    profileImageUrl: uploads/user/origin/1752757368132.jpg
 *                    thumbnailImageUrl: uploads/user/thumb/thumb-1752757368132.jpg
 *
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             examples:
 *               UserInfoById:
 *                 summary: ID를 통한 유저 정보 반환
 *                 value:
 *                  _id: 6825ecd11b7ed07a429a4f1a
 *                  email: test1234@test.com
 *                  birth: 2025-07-10
 *                  name: 전씨씨
 *                  gender: false
 *                  role: admin
 *                  reservation:
 *                   - 687c7e6a235057d352005a63
 *                  profileImageUrl: uploads/user/origin/1752757368132.jpg
 *                  thumbnailImageUrl: uploads/user/thumb/thumb-1752757368132.jpg
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
