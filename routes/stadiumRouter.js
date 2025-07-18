const express = require("express");
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();
const stadiumController = require("../controllers/stadiumController.js");

/**
 * @swagger
 * /api/stadium:
 *   get:
 *     summary: Get all stadiums
 *     tags: [Stadiums]
 *     responses:
 *       200:
 *         description: A list of stadiums
 *       500:
 *         description: Server error
 */
router.get("/", stadiumController.getStadium);

/**
 * @swagger
 * /api/stadium/{id}:
 *   get:
 *     summary: Get a stadium by ID
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stadium ID
 *     responses:
 *       200:
 *         description: Stadium found
 *       404:
 *         description: Stadium not found
 *       500:
 *         description: Server error
 */
router.get("/:id", stadiumController.getStadiumById);

/**
 * @swagger
 * /api/stadium:
 *   post:
 *     summary: Add a new stadium
 *     tags: [Stadiums]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stadium'
 *     responses:
 *       201:
 *         description: Stadium created successfully
 *       500:
 *         description: Server error
 */
router.post("/", stadiumController.addStadium);

/**
 * @swagger
 * /api/stadium/{id}:
 *   put:
 *     summary: Update a stadium
 *     tags: [Stadiums]
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
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Stadium'
 *     responses:
 *       200:
 *         description: Stadium updated successfully
 *       404:
 *         description: Stadium not found
 *       500:
 *         description: Server error
 */
router.put("/:id", stadiumController.updateStadium);

/**
 * @swagger
 * /api/stadium/{id}:
 *   delete:
 *     summary: Delete a stadium
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stadium ID
 *     responses:
 *       200:
 *         description: Stadium deleted successfully
 *       404:
 *         description: Stadium not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", stadiumController.deleteStadium);

/**
 * @swagger
 * /api/stadium/subfield:
 *   post:
 *     summary: Add a new subfield
 *     tags: [Stadiums]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubField'
 *     responses:
 *       201:
 *         description: Subfield created successfully
 *       400:
 *         description: stadiumId is required
 *       404:
 *         description: Stadium not found
 *       500:
 *         description: Server error
 */
router.post("/subField", stadiumController.addSubField);

/**
 * @swagger
 * /api/stadium/subfield/all:
 *   get:
 *     summary: Get all subfields
 *     tags: [Stadiums]
 *     responses:
 *       200:
 *         description: A list of subfields
 *       500:
 *         description: Server error
 */
router.get("/subField/all", stadiumController.getAllSubField);

/**
 * @swagger
 * /api/stadium/subfield/{id}:
 *   get:
 *     summary: Get a subfield by ID
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subfield ID
 *     responses:
 *       200:
 *         description: Subfield found
 *       404:
 *         description: Subfield not found
 *       500:
 *         description: Server error
 */
router.get("/subField/:id", stadiumController.getSubFieldById);

/**
 * @swagger
 * /api/stadium/subfield/{id}:
 *   put:
 *     summary: Update a subfield
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subfield ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubField'
 *     responses:
 *       200:
 *         description: Subfield updated successfully
 *       404:
 *         description: Subfield not found
 *       500:
 *         description: Server error
 */
router.put("/subField/:id", stadiumController.updateSubField);

/**
 * @swagger
 * /api/stadium/subfield/{id}:
 *   delete:
 *     summary: Delete a subfield
 *     tags: [Stadiums]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Subfield ID
 *     responses:
 *       200:
 *         description: Subfield deleted successfully
 *       404:
 *         description: Subfield not found
 *       500:
 *         description: Server error
 */
router.delete("/subField/:id", stadiumController.deleteSubField);

module.exports = router;
