/*
    회원가입 시
    
    db 모델링 : db의 컬럼 선정
    schema : 모델된 db에서 필요한 컬럼만 뽑아내어 가공된 db
*/

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
        email : String,
        password : String,
        name : String,
        birth : Date, 
        gender : Boolean // 남자 0, 여자 1
}, {timestamps: true});


const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
