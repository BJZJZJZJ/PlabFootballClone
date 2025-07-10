const multer = require("multer");

const MAX_FILE_SIZE_MB = 5;

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: `파일 크기는 ${MAX_FILE_SIZE_MB}MB를 초과할 수 없습니다.`,
      });
    }
    // 그 외 Multer 관련 에러
    return res.status(400).json({ message: err.message, msg: "여기" });
  } else if (err) {
    // Multer 외의 알 수 없는 에러
    return res.status(500).json({ message: "알 수 없는 오류가 발생했습니다." });
  }
  next(); // 에러가 없으면 다음 미들웨어로
};

module.exports = { multerErrorHandler };
