const Stadium = require("../models/stadiumModel"); // DB 모델
const express = require("express");
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const stadium = await Stadium.findOne({ id: req.params.id }).populate(
      "subField"
    );
    if (!stadium)
      return res.status(404).json({ error: "경기장을 찾을 수 없습니다." });
    res.json(stadium);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 조회 실패" });
  }
});

// 경기장 등록
router.post("/add", authenticate, async (req, res) => {
  // 트랜잭션을 위한 세션 시작
  const session = await Stadium.startSession();
  session.startTransaction();

  try {
    const { name, location, facilities, subFields } = req.body;

    // 1. 경기장 ID를 자동 증가시키기 위해 Counter에서 값 증가
    const counter = await Counter.findOneAndUpdate(
      { name: "stadium" }, // stadium 전용 카운터
      { $inc: { seq: 1 } }, // 1 증가
      { new: true, upsert: true } // 없으면 생성
    );
    const stadiumId = counter.seq; // 증가된 stadium 고유 ID

    // 2. 경기장 정보 생성 및 저장
    const newStadium = new Stadium({
      id: stadiumId, // 정수형 ID
      name,
      location,
      facilities,
    });
    const savedStadium = await newStadium.save({ session });

    // 3. subFields 배열이 있을 경우에만 처리
    const subFieldDocs = await Promise.all(
      (subFields || []).map(async (field) => {
        // subField ID도 Counter에서 자동 증가
        const subFieldCounter = await Counter.findOneAndUpdate(
          { name: "subField" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

        // SubField 문서 생성
        const subField = new SubField({
          ...field, // 요청에서 넘어온 필드 내용 (fieldName, size 등)
          id: subFieldCounter.seq, // 자동 증가된 정수형 ID
          stadium: savedStadium._id, // stadium 참조 연결
        });

        return await subField.save({ session }); // 저장
      })
    );

    // 4. stadium에 subField들의 ObjectId 연결
    savedStadium.subField = subFieldDocs.map((f) => f._id);
    await savedStadium.save({ session });

    // 5. 트랜잭션 성공 → 커밋
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "경기장 및 서브필드 등록 완료",
      stadium: savedStadium,
      subFields: subFieldDocs,
    });
  } catch (err) {
    // 에러 발생 시 → 트랜잭션 롤백
    await session.abortTransaction();
    session.endSession();

    console.error(err);
    res.status(500).json({ error: "경기장 등록 실패" });
  }
});

// 서브 필드 추가
router.post("/subField/add", async (req, res) => {
  const session = await SubField.startSession();
  session.startTransaction();

  try {
    const { stadiumId, fieldName, size, indoor, surface } = req.body;

    // 1. stadium ObjectId 찾기
    const stadium = await Stadium.findOne({ id: stadiumId });
    if (!stadium) {
      return res
        .status(404)
        .json({ error: "해당 ID의 경기장이 존재하지 않습니다." });
    }

    // 2. subField ID 생성 (auto-increment)
    const counter = await Counter.findOneAndUpdate(
      { name: "subField" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // 3. SubField 생성
    const newSubField = new SubField({
      id: counter.seq,
      fieldName,
      size,
      indoor,
      surface,
      stadium: stadium._id,
    });

    const savedSubField = await newSubField.save({ session });

    // 4. Stadium의 subField 배열에 추가
    stadium.subField.push(savedSubField._id);
    await stadium.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "서브필드 추가 완료",
      subField: savedSubField,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ error: "서브필드 등록 중 오류 발생" });
  }
});

module.exports = router;
