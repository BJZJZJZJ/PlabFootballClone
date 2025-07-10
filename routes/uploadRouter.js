const express = require("express");
const router = express.Router();
const authenticate = require("../utils/authenticate.js");
const { uploadProfile } = require("../utils/multer"); // multer 설정 파일
const uploadController = require("../controllers/uploadController.js");
const { multerErrorHandler } = require("../utils/multerError.js");

/**
 * @swagger
 * /api/upload/profile:
 *  post:
 *    summary: 프로필 이미지 업로드
 *    description: 사용자의 프로필 이미지를 업로드합니다.
 *    tags: [Upload]
 *    security:
 *      - bearerAuth: []
 *    consumes:
 *      - multipart/form-data
 *    parameters:
 *      - in: formData
 *        name: profileImage
 *        type: file
 *        required: true
 *        description: 업로드할 프로필 이미지.
 *    responses:
 *      200:
 *        description: 프로필 이미지 업로드 성공
 *      400:
 *        description: 이미지를 업로드해야 합니다.
 *      401:
 *        description: 로그인 필요
 *      404:
 *        description: 사용자를 찾을 수 없습니다.
 *      500:
 *        description: 서버 오류
 */
router.post(
  "/profile",
  authenticate,
  uploadProfile,
  multerErrorHandler,
  uploadController.addProfileImage
);

module.exports = router;
