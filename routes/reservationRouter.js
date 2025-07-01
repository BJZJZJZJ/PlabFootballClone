const express = require("express");
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();
const reservationController = require("../controllers/reservationController.js");

router.get("/all", reservationController.getAllReservations);
router.get("/my", authenticate, reservationController.getReservationByLogined);
router.post("/", authenticate, reservationController.addReservation);

router.get("/:id", authenticate, reservationController.getReservationById);
router.put("/:id", authenticate, reservationController.updateReservation); // 부분 업데이트
router.delete("/:id", authenticate, reservationController.deleteReservation);
/*
router.get("/", reservationController.getSubFieldById);
router.put("/", reservationController.updateSubField);
router.delete("/", reservationController.deleteSubField);
*/
module.exports = router;
