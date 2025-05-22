const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default";

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "로그인 필요" });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedEmail) => {
    if (err) {
      return res.status(403).json({ message: "유효하지 않은 토큰" });
    }
    req.user = decodedEmail.email;
    next();
  });
};

module.exports = authenticate;
