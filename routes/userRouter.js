const express = require("express");
const router = express.Router();
const authenticate = require("../utils/authenticate.js");
const upload = require("../utils/multer"); // multer 설정 파일

const userController = require("../controllers/userController.js");

/**
 * @swagger
 * /api/user/signup:
 *  post:
 *    summary: 회원가입
 *    description: 회원가입을 위한 API
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *              - name
 *              - birth
 *              - gender
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              name:
 *                type: string
 *              birth:
 *                type: string
 *                format: date
 *              gender:
 *                type: boolean
 *    responses:
 *      201:
 *        description: 회원가입 성공
 *      401:
 *        description: 이미 존재하는 이메일
 *      500:
 *        description: 서버 오류
 */

router.post("/signup", userController.signUp);

/**
 * @swagger
 * /api/user/signin:
 *  post:
 *    summary: 로그인
 *    description: 로그인을 위한 API
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *      201:
 *        description: 로그인 성공
 *      401:
 *        description: 이메일 또는 비밀번호 오류
 *      500:
 *        description: 서버 오류
 */

// jwt에는 절대 개인정보를 넣지 말것
router.post("/signin", userController.signIn);
router.get("/signout", userController.logout);

router.get("/get-user", authenticate, userController.getUser);

router.post("/get-user-detail", authenticate, userController.getUserDetail);

router.get("/", userController.getAllUsers);
router.get("/:id", authenticate, userController.getUserById);
router.put("/:id", authenticate, userController.updateProfile);
router.delete("/:id", authenticate, userController.deleteUser);

module.exports = router;
