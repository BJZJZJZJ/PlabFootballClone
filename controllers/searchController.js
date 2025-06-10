const Stadium = require("../models/stadiumModel"); // DB 모델
const Counter = require("../models/counterModel"); // 카운터 모델
const SubField = require("../models/subFieldModel"); // 서브 필드 모델

const search = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "검색어가 필요합니다." });
    }

    // Stadium에서 이름 또는 위치로 검색
    const stadiums = await Stadium.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { "location.province": { $regex: keyword, $options: "i" } },
        { "location.city": { $regex: keyword, $options: "i" } },
        { "location.district": { $regex: keyword, $options: "i" } },
        { "location.address": { $regex: keyword, $options: "i" } },
      ],
    }).select("id name location");

    /*
    // SubField에서 이름으로 검색
    // 서브필드의 경우는 A구장 B구장 같이 검색되는데 굳이 필요할까?
    const subFields = await SubField.find({
      name: { $regex: keyword, $options: "i" },
    }).populate("stadium");
    */

    res.status(200).json({
      results: stadiums,
      //      subFields,
    });
  } catch (err) {
    console.error("검색 오류:", err);
    res.status(500).json({ error: "검색 실패" });
  }
};

module.exports = {
  search,
};
