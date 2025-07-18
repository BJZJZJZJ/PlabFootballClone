const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// 파일 종류에 따라 저장 경로를 설정하는 함수
const getDestination = (req, file, cb) => {
  let dest = "uploads/";
  if (file.fieldname === "profileImage") {
    dest += "user/origin/";
  } else if (file.fieldname === "stadiumImages") {
    dest += "stadium/origin/";
  }

  // 디렉토리가 없으면 생성
  fs.mkdirSync(dest, { recursive: true });
  cb(null, dest);
};

const storage = multer.diskStorage({
  destination: getDestination,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

module.exports = {
  uploadProfile: upload.single("profileImage"),
  uploadStadium: upload.array("stadiumImages", 10),
};