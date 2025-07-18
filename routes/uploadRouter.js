const express = require("express");
const router = express.Router();
const authenticate = require("../utils/authenticate.js");
const { uploadProfile, uploadStadium } = require("../utils/multer"); // multer 설정 파일
const uploadController = require("../controllers/uploadController.js");
const { multerErrorHandler } = require("../utils/multerError.js");

/**
 * @swagger
 * /api/upload/profile/{id}:
 *   post:
 *     summary: Upload a profile image
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       400:
 *         description: Image is required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/profile/:id",
  authenticate,
  uploadProfile,
  multerErrorHandler,
  uploadController.addProfileImage
);

/**
 * @swagger
 * /api/upload/stadium/{id}:
 *   post:
 *     summary: Upload stadium images
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stadium ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Stadium images uploaded successfully
 *       400:
 *         description: Images are required
 *       404:
 *         description: Stadium not found
 *       500:
 *         description: Server error
 */

router.post(
  "/stadium/:id",
  authenticate,
  uploadStadium,
  multerErrorHandler,
  uploadController.addStadiumImage
);

module.exports = router;
