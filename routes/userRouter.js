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

router.get("/get-user", authenticate, userController.getUser);
// router.get("/get-user", authenticate, userController.getUser);
/* 
  유저 정보 들어오는 api는 2개로 만드는게 좋을 것
  1. 통상적으로 사용 될 유저 정보를 줄 api (이메일, 닉네임 등)
  2. 유저 정보 수정할 때 사용할 api (디테일 한 정보)

  token만 활용해서 정보를 받을 때는 확실하게 인증하기 애매함
  따라서 token + 비밀번호 / token + 이메일 과 같이 2개의 정보를 같이 확인하여 검증하도록 하는게 좋음
  
*/

router.post("/get-user-detail", authenticate, userController.getUserDetail);

router.put("/:id", authenticate, userController.updateProfile);



module.exports = router;
