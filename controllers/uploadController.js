const User = require("../models/userModel");

const addProfileImage = async (req, res) => {
  // The uploaded file path will be available in req.file.path
  // The user ID will be available from the authenticated user information (req.user)
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!imageUrl) {
    return res.status(400).json({ message: "이미지를 업로드해야 합니다." });
  }

  try {
    // req.user is the user's oId from the JWT token in authenticate.js
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    user.profileImage = imageUrl; // Update the profile image URL
    await user.save();

    return res
      .status(200)
      .json({ message: "프로필 이미지가 업데이트되었습니다.", data: { imageUrl: user.profileImage } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

module.exports = {
  addProfileImage,
};
