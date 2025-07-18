const Stadium = require("../models/stadiumModel"); // DB 모델
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델
const Match = require("../models/matchModel"); // 매치 모델
const Reservation = require("../models/reservationModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const getStadium = async (_, res) => {
  try {
    const stadiums = await Stadium.find().populate({
      path: "subField",
      select: "fieldName",
    });
    res.json(stadiums);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 조회 실패" });
  }
};

const getStadiumById = async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id).populate("subField");

    if (!stadium)
      return res.status(404).json({ error: "경기장을 찾을 수 없습니다." });
    res.json(stadium);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 조회 실패" });
  }
};

// 경기장 등록
const addStadium = async (req, res) => {
  try {
    const { name, location, facilities, subFields } = req.body;

    // 1. stadiumCounter 증가
    const counter = await Counter.findOneAndUpdate(
      { name: "stadium" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const stadiumId = counter.seq;

    // 2. stadium 생성
    const stadium = new Stadium({
      id: stadiumId,
      name,
      location,
      facilities,
      subField: [],
    });

    const savedStadium = await stadium.save();

    // 3. subFields 있으면 저장 후 stadium에 연결
    let subFieldIds = [];

    // subField length 대신 기본값을 설정(null)해서 있는지 없는지만 비교하는 방식도 가능
    if (Array.isArray(subFields) && subFields.length > 0) {
      const subFieldDocs = await Promise.all(
        subFields.map(async (field) => {
          // 각 서브필드마다 고유 ID 생성
          const subFieldCounter = await Counter.findOneAndUpdate(
            { name: "subField" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
          );

          const subFieldId = subFieldCounter.seq;

          const subField = new SubField({
            ...field,
            id: subFieldId,
            stadium: savedStadium._id,
          });

          const saved = await subField.save();
          return saved._id;
        })
      );

      subFieldIds = subFieldDocs;
    }

    // 4. stadium에 subField 연결
    savedStadium.subField = subFieldIds;
    await savedStadium.save();

    res.status(201).json({
      msg: "경기장과 서브필드가 성공적으로 등록되었습니다.",
      stadium: savedStadium,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 등록 실패" });
  }
};

// 서브 필드 추가
const addSubField = async (req, res) => {
  try {
    const { fieldName, size, indoor, surface, stadiumId } = req.body;

    // 필수값 검증
    if (!stadiumId) {
      return res.status(400).json({ error: "stadiumId는 필수입니다." });
    }

    // 1. stadium 존재 여부 확인
    const stadium = await Stadium.findById(stadiumId);
    if (!stadium) {
      return res
        .status(404)
        .json({ error: "해당 stadium을 찾을 수 없습니다." });
    }

    // 2. Counter에서 subFieldCounter 증가
    const counter = await Counter.findOneAndUpdate(
      { name: "subField" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const subFieldId = counter.seq;

    // 3. SubField 생성 및 저장
    const subField = new SubField({
      id: subFieldId,
      fieldName,
      size,
      indoor,
      surface,
      stadium: stadium._id,
    });

    const savedSubField = await subField.save();

    // 4. Stadium 문서에 연결
    stadium.subField.push(savedSubField._id);
    await stadium.save();

    res.status(201).json({
      message: "서브필드가 성공적으로 등록되었습니다.",
      subField: savedSubField,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서브필드 등록 실패" });
  }
};

const updateStadium = async (req, res) => {
  try {
    const updateData = req.body;

    const updatedStadium = await Stadium.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    ).populate("subField");

    if (!updatedStadium) {
      return res.status(404).json({ error: "해당 경기장을 찾을 수 없습니다." });
    }

    res.json(updatedStadium);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 업데이트 중 오류 발생" });
  }
};

const getSubFieldById = async (req, res) => {
  try {
    const subField = await SubField.findById(req.params.id)
      .populate("stadium")
      .populate("match");

    if (!subField) {
      return res.status(404).json({ error: "서브필드를 찾을 수 없습니다." });
    }

    res.json(subField);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서브필드 조회 실패" });
  }
};

const updateSubField = async (req, res) => {
  try {
    const subFieldId = req.params.id;
    const updateData = req.body;

    const updatedSubField = await SubField.findByIdAndUpdate(
      subFieldId,
      updateData,
      { new: true }
    ).populate("stadium");

    if (!updatedSubField) {
      return res
        .status(404)
        .json({ error: "해당 서브필드를 찾을 수 없습니다." });
    }

    res.json(updatedSubField);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서브필드 업데이트 중 오류 발생" });
  }
};

const deleteStadium = async (req, res) => {
  const stadiumId = req.params.id;

  try {
    // 1. 해당 Stadium에 속한 모든 SubField 찾기
    const subFieldsToDelete = await SubField.find({ stadium: stadiumId });
    const subFieldIds = subFieldsToDelete.map((sf) => sf._id);

    let matchIds = [];
    let reservationIds = [];

    if (subFieldIds.length > 0) {
      // 2. 해당 SubField에 연결된 모든 Match 찾기
      const matchesToDelete = await Match.find({
        subField: { $in: subFieldIds },
      });
      matchIds = matchesToDelete.map((m) => m._id);

      if (matchIds.length > 0) {
        // 3. 해당 Match에 연결된 모든 Reservation 찾기
        const reservationsToDelete = await Reservation.find({
          match: { $in: matchIds },
        });
        reservationIds = reservationsToDelete.map((r) => r._id);

        if (reservationIds.length > 0) {
          // 4. User 모델에서 삭제된 Reservation 참조 제거
          const updatedUsersResult = await User.updateMany(
            { reservation: { $in: reservationIds } },
            { $pull: { reservation: { $in: reservationIds } } }
          );
          console.log(
            `업데이트된 User 수 (Reservation 참조 제거): ${updatedUsersResult.modifiedCount}개`
          );

          // 5. Reservation 문서 삭제
          const deletedReservationsResult = await Reservation.deleteMany({
            _id: { $in: reservationIds },
          });
          console.log(
            `삭제된 Reservation 수: ${deletedReservationsResult.deletedCount}개`
          );
        }

        // 6. Match 문서 삭제
        const deletedMatchesResult = await Match.deleteMany({
          _id: { $in: matchIds },
        });
        console.log(`삭제된 Match 수: ${deletedMatchesResult.deletedCount}개`);
      }

      // 7. SubField 문서 삭제
      const deletedSubFieldsResult = await SubField.deleteMany({
        _id: { $in: subFieldIds },
      });
      console.log(
        `삭제된 SubField 수: ${deletedSubFieldsResult.deletedCount}개`
      );
    }

    // 8. Stadium 문서 삭제
    const deletedStadium = await Stadium.findByIdAndDelete(stadiumId);

    if (!deletedStadium) {
      // 트랜잭션이 없으므로, 여기서 에러 발생 시 부분적으로만 삭제될 수 있음을 유의
      return res
        .status(404)
        .json({ message: "경기장을 찾을 수 없거나 이미 삭제되었습니다." });
    }

    res.status(200).json({
      message: "경기장 및 모든 연관 데이터가 성공적으로 삭제되었습니다.",
      deletedStadium: deletedStadium,
    });
  } catch (error) {
    console.error("경기장 삭제 중 오류 발생:", error);
    // 트랜잭션이 없으므로, 여기서 오류가 나면 앞선 작업들은 롤백되지 않습니다.
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

// session 과 트랜잭션을 사용하면
// 여러 컬렉션에 걸친 작업의 원자성을 보장하여 데이터 불일치 위험을 최소화할 수 있습니다.
// 다만 session 활용 시 mongodb replica Set 구성 필요. 나중에는 session 활용 권장
const deleteSubField = async (req, res) => {
  const subFieldId = req.params.id;

  try {
    // 1. 해당 SubField에 연결된 모든 Match 찾기 및 삭제
    const matchesToDelete = await Match.find({
      subField: subFieldId,
    });
    const matchIds = matchesToDelete.map((m) => m._id);

    if (matchIds.length > 0) {
      const deletedMatchesResult = await Match.deleteMany({
        _id: { $in: matchIds },
      });
      console.log(`삭제된 Match 수: ${deletedMatchesResult.deletedCount}개`);

      // 2. 해당 Match에 연결된 모든 Reservation 찾기 및 삭제
      const reservationsToDelete = await Reservation.find({
        match: { $in: matchIds },
      });
      const reservationIds = reservationsToDelete.map((r) => r._id);

      if (reservationIds.length > 0) {
        const deletedReservationsResult = await Reservation.deleteMany({
          _id: { $in: reservationIds },
        });
        console.log(
          `삭제된 Reservation 수: ${deletedReservationsResult.deletedCount}개`
        );

        // 3. User 모델에서 삭제된 Reservation 참조 제거
        const updatedUsersResult = await User.updateMany(
          { reservation: { $in: reservationIds } }, // 삭제된 예약 ID를 포함하는 User 문서 찾기
          { $pull: { reservation: { $in: reservationIds } } } // 해당 예약 ID들을 reservation 배열에서 제거
        );
        console.log(
          `업데이트된 User 수 (Reservation 참조 제거): ${updatedUsersResult.modifiedCount}개`
        );
      }
    }

    // 4. Stadium 모델에서 해당 SubField 참조 제거
    const updatedStadiumResult = await Stadium.updateMany(
      { subField: subFieldId },
      { $pull: { subField: subFieldId } }
    );
    console.log(
      `업데이트된 Stadium 수 (SubField 참조 제거): ${updatedStadiumResult.modifiedCount}개`
    );

    // 5. SubField 문서 삭제
    const deletedSubField = await SubField.findByIdAndDelete(subFieldId);

    if (!deletedSubField) {
      return res
        .status(404)
        .json({ message: "서브 필드를 찾을 수 없거나 이미 삭제되었습니다." });
    }

    res.status(200).json({
      message: "서브 필드 및 모든 연관 데이터가 성공적으로 삭제되었습니다.",
      deletedSubField: deletedSubField,
    });
  } catch (error) {
    console.error("서브 필드 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

const getAllSubField = async (_, res) => {
  try {
    const subFields = await SubField.find().populate("stadium");
    res.json(subFields);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서브필드 조회 실패" });
  }
};

module.exports = {
  getStadium,
  getStadiumById,
  addStadium,
  updateStadium,
  deleteStadium,

  getAllSubField,
  addSubField,
  getSubFieldById,
  updateSubField,
  deleteSubField,
};
