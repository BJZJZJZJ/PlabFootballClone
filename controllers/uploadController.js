const User = require("../models/userModel");
const Stadium = require("../models/stadiumModel");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const addProfileImage = async (req, res) => {
  const id = req.params.id || req.user;
  const file = req.file ? req.file : null;

  if (!file) {
    return res.status(400).json({ message: "이미지를 업로드해야 합니다." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const originalPath = file.path;
    const thumbnailFilename = `thumb-${file.filename}`;
    const thumbnailDir = path.join("uploads/user/thumb/");
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

    // 썸네일 디렉토리가 없으면 생성
    fs.mkdirSync(thumbnailDir, { recursive: true });

    // sharp로 썸네일 생성
    await sharp(originalPath).resize({ width: 200 }).toFile(thumbnailPath);

    user.profileImageUrl = `uploads/user/origin/${file.filename}`; // 썸네일 URL 저장
    user.thumbnailImageUrl = `uploads/user/thumb/${thumbnailFilename}`;
    await user.save();

    return res.status(200).json({
      message: "프로필 이미지가 업데이트되었습니다.",
      data: {
        originalUrl: `uploads/user/origin/${file.filename}`,
        thumbnailUrl: `uploads/user/thumb/${thumbnailFilename}`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

const addStadiumImage = async (req, res) => {
  const id = req.params.id;
  const files = req.files ? req.files : null;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "이미지를 업로드해야 합니다." });
  }

  try {
    const stadium = await Stadium.findById(id);
    if (!stadium) {
      return res.status(404).json({ message: "경기장을 찾을 수 없습니다." });
    }

    const fileData = await Promise.all(
      files.map(async (file) => {
        const originalPath = file.path;
        const thumbnailFilename = `thumb-${file.filename}`;
        const thumbnailDir = path.join("uploads/stadium/thumb/");
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

        // 썸네일 디렉토리가 없으면 생성
        fs.mkdirSync(thumbnailDir, { recursive: true });

        // sharp로 썸네일 생성
        await sharp(originalPath).resize({ width: 200 }).toFile(thumbnailPath);

        return {
          originalUrl: `uploads/stadium/origin/${file.filename}`,
          thumbnailUrl: `uploads/stadium/thumb/${thumbnailFilename}`,
        };
      })
    );

    stadium.preview = fileData; // Update the profile image URL
    await stadium.save();

    return res.status(200).json({
      message: "경기장 이미지가 업데이트되었습니다.",
      data: fileData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

module.exports = {
  addProfileImage,
  addStadiumImage,
};
