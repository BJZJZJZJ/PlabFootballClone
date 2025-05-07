/* 
    회원가입, 로그인의 경우는 prefix url 없이 하는 경우도 잇음. 아니면 common으로 해서 처리
*/

// DB 관련 모듈
const User = require('./models/model');
const mongoose = require("mongoose");

// express 관련 모듈
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// 비밀번호 해시암호화 모듈
const bcrypt = require('bcryptjs');

const app = express();
const PORT = Number(process.env.PORT) || 44445;
const JWT_SECRET = process.env.JWT_SECRET || "default";
const SESSION_SECRET = process.env.SESSION_SECRET || "default";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Football";

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
app.use(session({
    secret: SESSION_SECRET, // 세션 암호화에 사용되는 비밀 키
    resave: false, // 세션이 수정되지 않아도 항상 저장할지 여부
    saveUninitialized: false, // 초기화되지 않은 세션을 저장할지 여부
    cookie: { secure: false } // HTTPS를 사용할 경우 true로 설정 
}))


// 비밀번호 해시함수 적용
async function createHash(pwd){
    const salt = await bcrypt.genSalt(10);
    const hashedpwd = await bcrypt.hash(pwd, salt);

    return hashedpwd; 
}



app.post ('/common/signup' , (req, res) => {
    const {email, password, name, birth, gender}= req.body 
    
    // 이메일 중복확인 후 회원가입 진행
    User.find({email : email}).then(async (result) => {
        if (result.length > 0) {
            res.status(401).json({ msg: "이미 존재하는 이메일입니다." });
        } else {
            // 비밀번호 해시화(동기 처리)
            const hashedPassword = await createHash(password);

            const newUser = new User({
                email : email,
                password : hashedPassword,
                name : name,
                birth : birth,
                gender : Number(gender) // 남자 0, 여자 1
            }); 

            // 저장도 await를 사용하여 동기 처리
            await newUser.save()

            res.json({
                msg : "성공적으로 회원가입 되었습니다."
            })
        }
    })
})

app.post('/common/signin', (req, res) => {
    // jwt 토큰과 session 활용
    const {email, password} = req.body


    User.find({email : email}).then(async (result) => {
        if (result.length > 0) {
            console.log(result);
            const user = result[0]
            const isMatch = await bcrypt.compare(password, user.password); // 비밀번호 비교

            if (isMatch) {
                // jwt 토큰 발급
                const token = jwt.sign({email : email}, JWT_SECRET, {expiresIn: '1h'});
                res.cookie('token', token, {httpOnly: true});

                // 세션에 사용자 정보 저장
                req.session.user = {
                    email: user.email,
                    name: user.name,
                };

                res.json({
                    msg : "로그인 성공",
                    token : token,
                    session : req.session.user 
                })

            } else {
                res.status(401).json({msg : "비밀번호가 틀렸습니다."})
            }
        } else {
            res.status(401).json({msg : "존재하지 않는 이메일입니다."})
        }
    })
})






app.listen(PORT , () => {
    console.log("server START");
})