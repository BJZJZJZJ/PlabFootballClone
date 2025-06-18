const express = require("express");
const router = express.Router();
const upload = require("../utils/multer"); // multer 설정 파일
const path = require("path");
const userController = require("../controllers/userController.js");
const authenticate = require("../utils/authenticate.js");

router.post(
  "/profile-image",
  authenticate,
  upload.single("image"),
  userController.addProfileImage
);

module.exports = router;
