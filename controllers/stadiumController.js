const Stadium = require("../models/stadiumModel"); // DB 모델
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델

const getStadium = async (_, res) => {
  try {
    const stadiums = await Stadium.find().populate("subField");
    res.json(stadiums);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 조회 실패" });
  }
};

const getStadiumById = async (req, res) => {
  try {
    const stadium = await Stadium.findOne({
      id: req.params.id,
    }).populate("subField");

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
    const stadiumId = req.params.id;
    const updateData = req.body;

    const updatedStadium = await Stadium.findOneAndUpdate(
      { id: stadiumId },
      updateData,
      {
        new: true,
      }
    ).populate("subField");

    if (!updatedStadium) {
      return res.status(404).json({ error: "해당 경기장을 찾을 수 없습니다." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기장 업데이트 중 오류 발생" });
  }
};

module.exports = {
  getStadium,
  getStadiumById,
  addStadium,
  addSubField,
  updateStadium,
};
