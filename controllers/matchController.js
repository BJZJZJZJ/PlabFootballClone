const Match = require("../models/matchModel"); // DB 모델
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델

const getMatch = async (req, res) => {
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
      const currentKST = new Date(now.getTime() + KST_OFFSET);
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

    const matches = await Match.find({ dateTime: timeFilter.dateTime }) // dateTime 필터링
      .sort({ dateTime: 1 }) // ⬅️ 경기시간 기준 오름차순 정렬
      .select("id dateTime subField conditions")
      .populate({
        path: "subField",
        populate: {
          path: "stadium",
          model: "Stadium",
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
    const match = await Match.findOne({ id: req.params.id }).populate({
      path: "subField",
      populate: {
        path: "stadium", // subField > stadium 정보도 가져옴
        model: "Stadium",
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

// 매치 생성
const addMatch = async (req, res) => {
  try {
    const {
      dateTime,
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
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const overlappingMatch = await Match.findOne({
      subField: subFieldId, // 특정 subField 내에서만 겹침 확인
      $and: [
        { startTime: { $lt: endTime } }, // 기존 경기 시작 시간이 새 경기 종료 시간보다 빨라야 함
        { endTime: { $gt: startTime } }, // 기존 경기 종료 시간이 새 경기 시작 시간보다 늦어야 함
      ],
    });

    console.log("Overlapping Match:", overlappingMatch);
    console.log("New Match Start:", startTime);
    console.log("New Match End:", endTime);

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
      startTime: startTime,
      endTime: new Date(startTime.getTime() + durationMinutes * 60 * 1000),
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
    const updateData = req.body;

    const updatedMatch = await Match.findOneAndUpdate(
      { id: matchId },
      updateData,
      {
        new: true,
      }
    ).populate({
      path: "subField",
      populate: {
        path: "stadium",
        model: "Stadium",
      },
    });

    if (!updatedMatch) {
      return res.status(404).json({ error: "해당 매치를 찾을 수 없습니다." });
    }

    res.json({ result: updatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "매치 업데이트 중 오류 발생" });
  }
};

module.exports = {
  getMatch,
  getMatchById,
  addMatch,
  updateMatch,
};
