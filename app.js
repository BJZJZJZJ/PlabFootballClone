require("dotenv").config();

// DB 관련 모듈
const mongoose = require("mongoose");

// express 관련 모듈
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const session = require("express-session");
const cors = require("cors");

const { swaggerUi, specs } = require("./config/swagger");

// 라우터 객체
const userRouter = require("./routes/userRouter");
const matchRoutes = require("./routes/matchRouter");

const app = express();

// dotenv 환경변수
const SESSION_SECRET = process.env.SESSION_SECRET || "default";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/Football";
const PORT = Number(process.env.PORT) || 44445;
const CLIENT_URL = process.env.CLIENT_URL;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connection Open");
  })
  .catch((e) => {
    console.log("ERROR");
    console.log(e);
  });

app.use(bodyParser.json());
app.use(cookieParser());
/*
app.use(
  session({
    secret: SESSION_SECRET, // 세션 암호화에 사용되는 비밀 키
    resave: false, // 세션이 수정되지 않아도 항상 저장할지 여부
    saveUninitialized: false, // 초기화되지 않은 세션을 저장할지 여부
    cookie: { secure: false }, // HTTPS를 사용할 경우 true로 설정
  })
);
*/

app.use(
  cors({
    origin: "*", // 클라이언트 주소
    credentials: true,
  })
);

// 라우터 연동
app.use("/api/match", matchRoutes);
app.use("/api/user", userRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
  console.log("server START");
});
