const User = require("../models/userModel"); // DB 모델
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // 비밀번호 해시암호화 모듈

const authenticate = require("../utils/authenticate"); // 인증 미들웨어

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
  // 이메일 중복확인 후 회원가입 진행
  User.findOne({ email: email })
    .then(async (user) => {
      if (user) {
        return res.status(401).json({ msg: "이미 존재하는 이메일입니다." });
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
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ msg: "서버 오류" });
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
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then(async (user) => {
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password); // 해시된 비밀번호 비교

        if (!isMatch) {
          // 비밀번호가 틀린 경우
          res.status(401).json({ msg: "이메일 또는 비밀번호가 틀렸습니다." });
          return;
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

        res.status(201).json({
          msg: "로그인 성공",
          token: token,
        });
      } else {
        // 이메일이 존재하지 않는 경우
        return res
          .status(401)
          .json({ msg: "이메일 또는 비밀번호가 틀렸습니다." });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ msg: "서버 오류" });
    });
});

router.get("/get-user", authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user }).select("-password"); // 비밀번호 제외하고 조회
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
});
/* 
  유저 정보 들어오는 api는 2개로 만드는게 좋을 것
  1. 통상적으로 사용 될 유저 정보를 줄 api (이메일, 닉네임 등)
  2. 유저 정보 수정할 때 사용할 api (디테일 한 정보)

  token만 활용해서 정보를 받을 때는 확실하게 인증하기 애매함
  따라서 token + 비밀번호 / token + 이메일 과 같이 2개의 정보를 같이 확인하여 검증하도록 하는게 좋음
  
*/


module.exports = router;
