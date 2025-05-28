const Match = require("../models/matchModel"); // DB 모델
const express = require("express");
const authenticate = require("../utils/authenticate"); // 인증 미들웨어
const router = express.Router();

/* 
  조회할 때  subField 정보도 필요로 하고, Stadium 정보도 필요로 함.
  해당 경우는 어떻게 처리하면 되겠니 
  내 생각에는 Popluate를 2번 할 것만 같구나

  mongodb 를 replica set으로 구성
  
  매치 생성에서 matchId 생성 부분
*/

router.get("/:id", async (req, res) => {
  try {
    const match = await Match.findOne({ id: req.params.id }).populate(
      "subField"
    );
    if (!match)
      return res.status(404).json({ error: "경기를 찾을 수 없습니다." });
    res.json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "경기 조회 실패" });
  }
});

// 매치 생성 (GET /api/match)
router.post("/", async (req, res) => {
  const session = await Match.startSession();
  session.startTransaction();

  try {
    const {
      dateTime,
      durationMinutes,
      subFieldId,
      conditions,
      fee,
      participantInfo,
    } = req.body;

    // 1. subField 존재 확인
    const subField = await SubField.findById(subFieldId);
    if (!subField) {
      return res
        .status(404)
        .json({ error: "해당 서브필드가 존재하지 않습니다." });
    }

    // 2. 매치 시간 겹침 여부 확인
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const overlappingMatch = await Match.findOne({
      subField: subFieldId,
      dateTime: {
        $lt: endTime,
        $gte: new Date(startTime.getTime() - durationMinutes * 60000), // 최소한 현재 경기 시간 안에 걸쳐있을 가능성 있는 match 체크
      },
    });

    if (overlappingMatch) {
      return res
        .status(409)
        .json({ error: "해당 시간대에 이미 예약된 매치가 있습니다." });
    }

    // 3. 매치 생성
    const newMatch = new Match({
      dateTime,
      durationMinutes,
      subField: subFieldId,
      conditions,
      fee,
      participantInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newMatch.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "매치가 성공적으로 생성되었습니다.", match: newMatch });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ error: "매치 생성 중 오류 발생" });
  }
});

module.exports = router;
