const User = require("../models/model"); // DB 모델
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // 비밀번호 해시암호화 모듈

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default";

// 비밀번호 해시함수 함수
async function createHash(pwd) {
  const salt = await bcrypt.genSalt(10);
  const hashedpwd = await bcrypt.hash(pwd, salt);

  return hashedpwd;
}

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

router.post("/signup", (req, res) => {
  const { email, password, name, birth, gender } = req.body;

  console.log("회원가입 요청", req.body);
  // 이메일 중복확인 후 회원가입 진행
  User.find({ email: email }).then(async (result) => {
    if (result.length > 0) {
      res.status(401).json({ msg: "이미 존재하는 이메일입니다." });
      return;
    }

    // 비밀번호 해시화(동기 처리 필수)
    const hashedPassword = await createHash(password);

    const newUser = new User({
      email: email,
      password: hashedPassword,
      name: name,
      birth: birth,
      gender: Number(gender), // 남자 0, 여자 1
    });

    await newUser.save(); // 저장도 await를 사용하여 동기 처리

    res.status(201).json({
      msg: "성공적으로 회원가입 되었습니다.",
    });
  });
});

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
router.post("/signin", (req, res) => {
  // jwt 토큰과 session 활용

  const { email, password } = req.body;
  console.log("로그인 요청", req.body);
  User.find({ email: email }).then(async (result) => {
    if (result.length > 0) {
      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password); // 해시된 비밀번호 비교

      if (!isMatch) {
        // 비밀번호가 틀린 경우
        res.status(401).json({ msg: "이메일 또는 비밀번호가 틀렸습니다." });
      }

      // jwt 토큰 발급
      const token = jwt.sign({ email: email }, JWT_SECRET, {
        expiresIn: "1h",
      });

      // 쿠키에 jwt 토큰 저장
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 1000,
      }); // httpOnly와 secure 옵션 설정

      // 세션에 사용자 정보 저장
      req.session.user = {
        email: user.email,
        name: user.name,
      };

      res.status(201).json({
        msg: "로그인 성공",
        token: token,
        session: req.session.user,
      });
    } else {
      // 이메일이 존재하지 않는 경우
      res.status(401).json({ msg: "이메일 또는 비밀번호가 틀렸습니다." });
    }
  });
});

module.exports = router;
