const express = require("express");
const router = express.Router();

const userController = require("../controllers/searchController.js");

router.get("/", userController.search);

module.exports = router;
