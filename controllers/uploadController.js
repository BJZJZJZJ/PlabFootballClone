const User = require("../models/userModel");
const Stadium = require("../models/stadiumModel");
const path = require("path");
const sharp = require("sharp");

const addProfileImage = async (req, res) => {
  // The uploaded file path will be available in req.file.path
  // The user ID will be available from the authenticated user information (req.user)

  const id = req.params.id || req.user;
  const file = req.file ? req.file : null;

  if (!file) {
    return res.status(400).json({ message: "이미지를 업로드해야 합니다." });
  }

  try {
    // req.user is the user's oId from the JWT token in authenticate.js
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    console.log(user._id);

    const originalPath = file.path;
    const thumbnailFilename = `thumb-${file.filename}`;
    const thumbnailPath = path.join("uploads/user/", thumbnailFilename);

    // sharp로 썸네일 생성
    await sharp(originalPath).resize({ width: 200 }).toFile(thumbnailPath);

    user.profileImage = `uploads/user/${thumbnailFilename}`; // Update the profile image URL
    await user.save();

    return res.status(200).json({
      message: "프로필 이미지가 업데이트되었습니다.",
      data: {
        originalUrl: `uploads/user/${file.filename}`,
        thumbnailUrl: `uploads/user/${thumbnailFilename}`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

const addStadiumImage = async (req, res) => {
  // The uploaded file path will be available in req.file.path
  // The user ID will be available from the authenticated user information (req.user)

  const id = req.params.id;
  const files = req.files ? req.files : null;

  if (!files) {
    return res.status(400).json({ message: "이미지를 업로드해야 합니다." });
  }

  try {
    // req.user is the user's oId from the JWT token in authenticate.js
    const stadium = await Stadium.findById(id);
    if (!stadium) {
      return res.status(404).json({ message: "경기장을 찾을 수 없습니다." });
    }

    const fileData = [];
    await Promise.all(
      files.map(async (file) => {
        const originalPath = file.path;
        const thumbnailFilename = `thumb-${file.filename}`;
        const thumbnailPath = path.join("uploads/stadium/", thumbnailFilename);
        // sharp로 썸네일 생성
        await sharp(originalPath).resize({ width: 200 }).toFile(thumbnailPath);
        fileData.push({
          originalUrl: `/uploads/stadium/${file.filename}`,
          thumbnailUrl: `/uploads/stadium/${thumbnailFilename}`,
        });
      })
    );

    stadium.preview = fileData; // Update the profile image URL
    await stadium.save();

    return res.status(200).json({
      message: "프로필 이미지가 업데이트되었습니다.",
      data: {
        originalUrl: `uploads/stadium/${file.filename}`,
        thumbnailUrl: `uploads/stadium/${thumbnailFilename}`,
      },
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
