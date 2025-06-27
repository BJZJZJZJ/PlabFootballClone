const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default";

const authenticate = (req, res, next) => {
  // 1. Authorization 헤더에서 Bearer 토큰 추출
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "토큰이 필요합니다." });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" 에서 <token> 추출

  // 2. 토큰 검증
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }

    // 3. 사용자 정보 주입
    req.user = decoded.oId;
    next();
  });
};

module.exports = authenticate;
