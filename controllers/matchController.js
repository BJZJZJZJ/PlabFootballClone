const Match = require("../models/matchModel"); // DB 모델
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델
const Reservation = require("../models/reservationModel");
const User = require("../models/userModel");

const getMatchByDate = async (req, res) => {
  try {
    const dateQuery = req.query.date;
    if (!dateQuery) {
      return res
        .status(400)
        .json({ error: "date 쿼리 파라미터가 필요합니다. (YYYY-MM-DD 형식)" });
    }

    const now = new Date(); // 현재 시각 (UTC 기준)
    const todayDateStr = now.toISOString().slice(0, 10); // 'YYYY-MM-DD' 형식

    // 한국 시간 기준으로 변환
    const isToday = dateQuery === todayDateStr;

    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const dateStart = new Date(`${dateQuery}T00:00:00.000Z`);
    const dateEnd = new Date(`${dateQuery}T23:59:59.999Z`);

    let timeFilter = {};
    if (isToday) {
      // 오늘이면 현재 시간 이후부터
      //const currentKST = new Date(now.getTime() + KST_OFFSET);
      const currentKST = new Date(now.getTime());
      timeFilter.dateTime = {
        $gte: currentKST,
        $lte: new Date(dateEnd.getTime()),
      };
    } else {
      // 그 외 날짜면 하루 전체
      timeFilter.dateTime = {
        $gte: new Date(dateStart.getTime()),
        $lte: new Date(dateEnd.getTime()),
      };
    }

    const matches = await Match.find({ startTime: timeFilter.dateTime }) // dateTime 필터링
      .sort({ startTime: 1 }) // ⬅️ 경기시간 기준 오름차순 정렬
      .select(
        "id _id startTime durationMinutes endTime participantInfo conditions subField"
      )
      .populate({
        path: "subField",
        select: "id _id fieldName stadium",
        populate: {
          path: "stadium",
          model: "Stadium",
          select: "id _id name location",
        },
      });

    res.json({
      data: matches,
    });
  } catch (err) {
    console.error("경기 조회 오류:", err);
    res.status(500).json({ error: "경기 조회 실패" });
  }
};

const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .select(
        "_id id startTime durationMinutes endTime conditions fee participantInfo status subField"
      )
      .populate({
        path: "subField",
        select: "_id id fieldName",
        populate: {
          path: "stadium", // subField > stadium 정보도 가져옴
          model: "Stadium",
          select: "id _id location name ",
        },
      });

    if (!match) {
      return res.status(404).json({ error: "경기를 찾을 수 없습니다." });
    }

    res.json(match);
  } catch (err) {
    console.error("경기 조회 오류:", err);
    res.status(500).json({ error: "경기 조회 실패" });
  }
};

const getAllMatch = async (req, res) => {
  try {
    const matches = await Match.find()
      .select(
        "id _id startTime durationMinutes endTime conditions participantInfo fee status subField"
      )
      .populate({
        path: "subField",
        select: "id _id fieldName stadium",
        populate: {
          path: "stadium",
          model: "Stadium",
          select: "_id name location",
        },
      });

    res.json({
      matches,
    });
  } catch (err) {
    console.error("모든 경기 조회 오류:", err);
    res.status(500).json({ error: "모든 경기 조회 실패" });
  }
};

// 매치 생성
const addMatch = async (req, res) => {
  try {
    const {
      startTime,
      durationMinutes,
      subFieldId, // 반드시 전달해야 함
      conditions,
      fee,
      participantInfo,
    } = req.body;

    // 1. subField 존재 확인
    const subField = await SubField.findById(subFieldId);
    if (!subField) {
      return res
        .status(404)
        .json({ error: "해당 SubField를 찾을 수 없습니다." });
    }

    // 2. 매치 시간 겹침 여부 확인
    const _startTime = new Date(startTime);
    const endTime = new Date(
      _startTime.getTime() + durationMinutes * 60 * 1000
    );

    const overlappingMatch = await Match.findOne({
      subField: subFieldId, // 특정 subField 내에서만 겹침 확인
      $and: [
        { startTime: { $lt: endTime } }, // 기존 경기 시작 시간이 새 경기 종료 시간보다 빨라야 함
        { endTime: { $gt: _startTime } }, // 기존 경기 종료 시간이 새 경기 시작 시간보다 늦어야 함
      ],
    });

    if (overlappingMatch) {
      return res
        .status(409)
        .json({ error: "해당 시간대에 이미 예약된 매치가 있습니다." });
    }

    // 카운터 증가
    const counter = await Counter.findOneAndUpdate(
      { name: "match" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const matchId = counter.seq;

    // 3. 매치 생성
    const newMatch = await new Match({
      id: matchId,
      startTime: _startTime,
      endTime: new Date(_startTime.getTime() + durationMinutes * 60 * 1000),
      durationMinutes,
      subField: subField._id,
      conditions,
      fee,
      participantInfo,
    });

    const savedMatch = await newMatch.save();

    // 4. SubField.match 배열에 추가
    subField.match.push(savedMatch._id);
    await subField.save();

    res
      .status(201)
      .json({ message: "매치가 성공적으로 생성되었습니다.", match: newMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "매치 생성 중 오류 발생" });
  }
};

const updateMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const updateData = { ...req.body };

    // 업데이트 전 기존 매치 문서 조회
    const originalMatch = await Match.findById(matchId);
    if (!originalMatch) {
      return res.status(404).json({ error: "해당 매치를 찾을 수 없습니다." });
    }

    const newCurrentPlayers = originalMatch.participants.length;

    // maximumPlayers는 updateData에 새롭게 제공될 수도 있고, 아니면 기존 값을 사용합니다.
    const maximumPlayers =
      updateData.participantInfo?.maximumPlayers !== undefined // updateData에 maximumPlayers가 명시적으로 제공된 경우
        ? updateData.participantInfo.maximumPlayers
        : originalMatch.participantInfo.maximumPlayers; // 그렇지 않으면 기존 매치의 값 사용

    // participantInfo 객체를 생성하거나 기존 객체에 값을 할당합니다.
    // 이렇게 하면 findByIdAndUpdate가 participantInfo를 하나의 중첩된 객체로 인식하여 업데이트합니다.
    updateData.participantInfo = {
      ...originalMatch.participantInfo.toObject(), // 기존 participantInfo 값을 복사 (선택 사항이지만 안전함)
      ...updateData.participantInfo, // req.body에서 온 participantInfo 값들
      currentPlayers: newCurrentPlayers,
      spotsLeft: maximumPlayers - newCurrentPlayers,
      isFull: newCurrentPlayers >= maximumPlayers,
    };

    const updatedMatch = await Match.findByIdAndUpdate(matchId, updateData, {
      new: true,
    }).populate({
      path: "subField",
      populate: {
        path: "stadium",
        model: "Stadium",
      },
    });

    if (!updatedMatch) {
      return res.status(404).json({ error: "해당 매치를 찾을 수 없습니다." });
    }

    /*
    // subField가 변경 될 일은 없어요
    // subField가 변경되었는지 확인하고 관련 로직 수행
    if (
      updateData.subField &&
      originalMatch.subField.toString() !== updateData.subField.toString()
    ) {
      // 1. 이전 subField에서 매치 참조 제거
      const oldSubField = await SubField.findById(originalMatch.subField);
      if (oldSubField) {
        oldSubField.match = oldSubField.match.filter(
          (m) => m.toString() !== matchId.toString()
        );
        await oldSubField.save();
      }

      // 2. 새로운 subField에 매치 참조 추가
      const newSubField = await SubField.findById(updateData.subField);
      if (newSubField) {
        // 이미 추가되어 있는지 확인 후 추가 (중복 방지)
        if (!newSubField.match.includes(matchId)) {
          newSubField.match.push(matchId);
          await newSubField.save();
        }
      } else {
        // 새로운 subField ID가 유효하지 않은 경우 처리
        console.warn(
          `New subField ${updateData.subField} not found during match update.`
        );
        // 필요에 따라 오류 응답을 보낼 수도 있습니다.
      }
    }
    */

    res.json({ result: updatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "매치 업데이트 중 오류 발생" });
  }
};

const deleteMatch = async (req, res) => {
  const matchId = req.params.id;

  try {
    // 1. 해당 Match에 연결된 모든 Reservation 찾기 및 삭제
    // 먼저 삭제할 예약들의 ID를 미리 가져옵니다. User 모델 업데이트에 필요해요.
    const reservationsToDelete = await Reservation.find({
      match: matchId,
    });
    const reservationIds = reservationsToDelete.map((r) => r._id);

    const deletedReservationsResult = await Reservation.deleteMany({
      match: matchId,
    });
    console.log(
      `삭제된 Reservation 수: ${deletedReservationsResult.deletedCount}개`
    );

    // 2. User 모델에서 삭제된 Reservation 참조 제거
    if (reservationIds.length > 0) {
      const updatedUsersResult = await User.updateMany(
        { reservation: { $in: reservationIds } }, // 삭제된 예약 ID를 포함하는 User 문서를 찾습니다.
        { $pull: { reservation: { $in: reservationIds } } } // 해당 예약 ID들을 reservation 배열에서 제거합니다.
      );
      console.log(
        `업데이트된 User 수 (Reservation 참조 제거): ${updatedUsersResult.modifiedCount}개`
      );
    }

    // 3. SubField 모델에서 해당 Match 참조 제거
    const updatedSubFieldResult = await SubField.updateMany(
      { match: matchId },
      { $pull: { match: matchId } }
    );
    console.log(
      `업데이트된 SubField 수 (Match 참조 제거): ${updatedSubFieldResult.modifiedCount}개`
    );

    // 4. Match 문서 삭제
    const deletedMatch = await Match.findByIdAndDelete(matchId);

    if (!deletedMatch) {
      return res.status(404).json({
        message: "매치를 찾을 수 없거나 이미 삭제되었습니다.",
      });
    }

    res.status(200).json({
      message: "매치 및 모든 연관 데이터가 성공적으로 삭제되었습니다.",
      deletedMatch: deletedMatch,
    });
  } catch (error) {
    console.error("매치 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

module.exports = {
  getAllMatch,
  getMatchByDate,
  getMatchById,
  addMatch,
  updateMatch,
  deleteMatch,
};
