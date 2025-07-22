const Match = require("../models/matchModel"); // DB 모델
const User = require("../models/userModel"); // 사용자 모델
const Reservation = require("../models/reservationModel"); // 예약 모델

const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .select("reservedAt status")
      .populate("user", "email name")
      .populate({
        path: "match",
        select: "_id startTime",
        populate: {
          path: "subField",
          select: "fieldName stadium",
          populate: { path: "stadium", select: "location name" },
        },
      });

    return res.status(201).json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "예약 조회 실패" });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "match",
        populate: [
          {
            path: "subField",
            select: "fieldName stadium",
            populate: { path: "stadium", select: "name" },
          },
          { path: "participants", select: "name email" }, // Match의 참여자 정보도 populate
        ],
        select: "startTime durationMinutes subField conditions participantInfo",
      });

    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }
    res.status(200).json(reservation);
  } catch (error) {
    console.error("Error fetching reservation by ID:", error);
    res.status(500).json({ message: "예약을 불러오는 데 실패했습니다." });
  }
};

const getReservationByLogined = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      user: req.user,
      status: "예약",
    })
      .select("user reservedAt status")
      .populate({
        path: "match",
        select: "conditions startTime durationMinutes fee ",
        populate: {
          path: "subField",
          select: "fieldName ",
          populate: { path: "stadium", select: "location facilities name" },
        },
      });

    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "예약 조회 실패" });
  }
};

const addReservation = async (req, res) => {
  try {
    const { userId, matchId } = req.body;

    // 1. 매치 유효성 검사
    const match = await Match.findById(matchId);
    if (!match)
      return res.status(404).json({ error: "매치를 찾을 수 없습니다." });

    // 2. 이미 예약했는지 확인
    const exists = await Reservation.findOne({
      user: userId,
      match: matchId,
      status: "예약",
    });
    if (exists)
      return res.status(400).json({ error: "이미 예약한 매치입니다." });

    // 3. 정원 초과 여부 확인
    if (match.participantInfo.isFull) {
      return res.status(400).json({ error: "정원이 이미 가득 찼습니다." });
    }

    // 4. 예약 등록
    const reservation = new Reservation({ user: userId, match: matchId });
    await reservation.save();

    // 5. 매치 인원 업데이트
    match.participantInfo.currentPlayers += 1;
    match.participantInfo.spotsLeft =
      match.participantInfo.maximumPlayers -
      match.participantInfo.currentPlayers;

    match.participantInfo.isFull =
      match.participantInfo.currentPlayers >=
      match.participantInfo.maximumPlayers;

    match.participants.push(userId);
    await match.save();

    const user = await User.findById(userId);
    user.reservation.push(reservation._id);
    await user.save();

    res.status(201).json({ message: "예약 성공", reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "예약 처리 중 오류" });
  }
};

const updateReservation = async (req, res) => {
  const { userId, matchId, status } = req.body;

  try {
    // ---- 동시 변경 차단 유효성 검사 ----
    let changedFieldsCount = 0;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    const oldStatus = reservation.status;
    const oldMatchId = reservation.match;
    const oldUserId = reservation.user;

    if (matchId !== oldMatchId.toString()) changedFieldsCount++;
    if (status !== oldStatus) changedFieldsCount++;

    if (changedFieldsCount > 1) {
      return res.status(400).json({
        message: "예약 수정 시 'match', 'status' 중 하나만 변경할 수 있습니다.",
      });
    }

    // 2. Match 변경 로직 (participants 배열 업데이트)
    if (matchId && matchId.toString() !== oldMatchId.toString()) {
      // 이전 매치에서 oldUserId 제거 (oldUserId는 reservation에 기록된 User)
      const prevMatch = await Match.findById(oldMatchId);
      if (prevMatch) {
        // 이전에 '예약' 상태였을 경우에만 oldUserId를 제거
        // (이 로직은 좀 더 복잡합니다. 현재 유저가 이전 매치의 participant인지 확인하고 제거)
        if (oldStatus === "예약") {
          // 예약 상태가 '예약'일때만 참여자로 간주
          prevMatch.participants.pull(oldUserId);
          await prevMatch.save(); // pre('save') 훅이 currentPlayers 등을 업데이트
        }
      }

      // 새 매치에 user 추가 (reservation에 기록된 현재 user)
      const newMatchDoc = await Match.findById(matchId);
      if (newMatchDoc) {
        if (newMatchDoc.participants.includes(reservation.user.toString())) {
          return res
            .status(400)
            .json({ message: "새 매치에 이미 예약된 사용자입니다." });
        }
        if (
          newMatchDoc.participants.length >=
          newMatchDoc.participantInfo.maximumPlayers
        ) {
          return res
            .status(400)
            .json({ message: "선택한 새 매치 인원이 가득 찼습니다." });
        }
        if (reservation.status === "예약") {
          // 새로운 예약이 '예약' 상태면 새 매치에 추가
          newMatchDoc.participants.push(reservation.user);
          await newMatchDoc.save();
        }
      } else {
        return res
          .status(404)
          .json({ message: "선택한 새 매치를 찾을 수 없습니다." });
      }
      reservation.match = matchId; // Reservation 문서의 match 필드 업데이트
    }

    // 3. Status 변경 로직 (Match의 participants 배열에 영향을 줌)
    if (status && status !== oldStatus) {
      const currentMatchToAdjust = await Match.findById(reservation.match); // 현재 reservation이 가리키는 매치
      if (!currentMatchToAdjust) {
        console.warn(
          `Warning: Match ${reservation.match} not found for status update of reservation ${reservation._id}`
        );
      } else {
        if (oldStatus === "예약" && status === "취소") {
          // '예약' -> '취소' 변경: 매치 참여자에서 제거
          currentMatchToAdjust.participants.pull(reservation.user);
          const user = await User.findById(userId);
          if (!user) {
            return res
              .status(404)
              .json({ message: "사용자를 찾을 수 없습니다." });
          }
          user.reservation.pull(reservation._id); // 예약 취소 시 사용자에서 제거
          await user.save();
        } else if (oldStatus === "취소" && status === "예약") {
          // '취소' -> '예약' 변경: 매치 참여자에 추가 (인원 체크)
          if (
            currentMatchToAdjust.participants.includes(
              reservation.user.toString()
            )
          ) {
            return res
              .status(400)
              .json({ message: "해당 매치에 이미 참여 중입니다." });
          }
          if (
            currentMatchToAdjust.participants.length >=
            currentMatchToAdjust.participantInfo.maximumPlayers
          ) {
            return res.status(400).json({
              message:
                "매치를 다시 '예약' 상태로 변경할 수 없습니다. 인원이 가득 찼습니다.",
            });
          }
          currentMatchToAdjust.participants.push(reservation.user);
          const user = await User.findById(userId);
          if (!user) {
            return res
              .status(404)
              .json({ message: "사용자를 찾을 수 없습니다." });
          }
          user.reservation.push(reservation._id);
          await user.save();
        }
        await currentMatchToAdjust.save(); // pre('save') 훅이 currentPlayers 등을 업데이트
      }
      reservation.status = status; // Reservation 문서의 status 필드 업데이트
    }

    await reservation.save(); // 최종적으로 예약 문서 저장
    res.status(200).json(reservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ message: "예약 업데이트 중 오류 발생" });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "예약을 찾을 수 없습니다." });
    }

    // 1. Match 모델의 participants 배열에서 user ID 제거
    // reservation의 상태가 '예약'이었을 경우에만 participants에서 제거
    // (이미 '취소'된 예약이라면 participants에 없을 가능성이 높음)
    const targetMatch = await Match.findById(reservation.match);
    if (targetMatch) {
      if (reservation.status === "예약") {
        targetMatch.participants.pull(reservation.user);
        await targetMatch.save(); // pre('save') 훅이 currentPlayers 등을 업데이트
      }
    } else {
      console.warn(
        `Warning: Match ${reservation.match} not found when deleting reservation ${reservation._id}`
      );
    }

    // 2. User 모델의 reservations 배열에서 예약 ID 제거
    const targetUser = await User.findById(reservation.user);
    if (targetUser) {
      targetUser.reservation.pull(reservation._id); // 사용자에서 해당 예약 제거
      await targetUser.save();
    } else {
      console.warn(
        `Warning: User ${reservation.user} not found when deleting reservation ${reservation._id}`
      );
    }

    // 3. 예약 문서 삭제
    await Reservation.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "예약이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ message: "예약 삭제 중 오류 발생" });
  }
};

module.exports = {
  getReservationByLogined,
  getReservationById,
  getAllReservations,
  updateReservation,
  deleteReservation,
  addReservation,
};
