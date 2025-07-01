const Match = require("../models/matchModel"); // DB 모델
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델

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
      .select("id startTime subField conditions")
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
    const match = await Match.findById(req.params.id).populate({
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

const getAllMatch = async (req, res) => {
  try {
    const matches = await Match.find() // dateTime 필터링
      .populate({
        path: "subField",
        populate: {
          path: "stadium",
          model: "Stadium",
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
    const updateData = req.body;

    // 업데이트 전 기존 매치 문서 조회 (subField 변경 감지용)
    const originalMatch = await Match.findById(matchId);
    if (!originalMatch) {
      return res.status(404).json({ error: "해당 매치를 찾을 수 없습니다." });
    }

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

    res.json({ result: updatedMatch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "매치 업데이트 중 오류 발생" });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const matchId = req.params.id;

    // 매치 조회
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: "매치를 찾을 수 없습니다." });
    }

    // **이전 subField ID를 저장해 둡니다.**
    const originalSubFieldId = match.subField;

    // 매치 삭제
    // Mongoose의 deleteOne은 쿼리 객체를 받습니다. match 객체 자체가 아니라 { _id: match._id } 와 같이 주는 것이 명확합니다.
    const deleteResult = await Match.deleteOne({ _id: match._id });

    if (deleteResult.deletedCount === 0) {
      // 이 경우는 findById는 성공했지만 deleteOne이 실패한 경우
      return res.status(500).json({
        error:
          "매치 삭제는 성공했지만, 데이터베이스에서 실제로 삭제되지 않았습니다.",
      });
    }

    // 서브필드 조회 (삭제된 매치의 원래 subField를 사용)
    const subField = await SubField.findById(originalSubFieldId);

    if (!subField) {
      console.warn(
        "deleteMatch: SubField not found for match.subField:",
        originalSubFieldId
      );
      // return res.status(404).json({ error: "연결된 서브필드를 찾을 수 없습니다. (그러나 매치는 삭제됨)" });
      // 매치는 삭제되었으니 200 OK를 반환하고 경고만 남길 수 있습니다.
      return res.status(200).json({
        message:
          "매치가 성공적으로 삭제되었으나, 연결된 서브필드 업데이트에 실패했습니다.",
      });
    }

    // 서브필드에서 매치 제거
    const initialSubFieldMatchCount = subField.match.length;
    subField.match = subField.match.filter(
      (m) => m.toString() !== match._id.toString()
    );

    await subField.save();

    res.status(200).json({ message: "매치가 성공적으로 삭제되었습니다." });
  } catch (err) {
    console.error("매치 삭제 오류:", err);
    res.status(500).json({ error: "매치 삭제 중 오류 발생" });
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
