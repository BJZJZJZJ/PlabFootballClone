const express = require("express");
const router = express.Router();
const upload = require("../utils/multer"); // multer 설정 파일
const path = require("path");

router.post("/imgUpload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "이미지 파일이 필요합니다." });
    }

    res.status(200).json({
      message: "파일 업로드 성공",
      file: req.file,
    });
  } catch (error) {
    console.error("파일 업로드 오류:", error);
    res.status(500).json({ error: "파일 업로드 실패" });
  }
});

module.exports = router;
