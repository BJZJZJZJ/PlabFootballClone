const User = require("../models/userModel"); // DB 모델
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // 비밀번호 해시암호화 모듈

const JWT_SECRET = process.env.JWT_SECRET || "default";

// 비밀번호 해시함수 함수
async function createHash(pwd) {
  const salt = await bcrypt.genSalt(10);
  const hashedpwd = await bcrypt.hash(pwd, salt);

  return hashedpwd;
}

const signUp = async (req, res) => {
  const { email, password, name, birth, gender, role } = req.body;
  // 이메일 중복확인 후 회원가입 진행

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      return res.status(401).json({ msg: "이미 존재하는 이메일입니다." });
    }

    // 비밀번호 해시화(동기 처리 필수)
    const hashedPassword = await createHash(password);

    const newUser = new User({
      email: email,
      password: hashedPassword,
      name: name,
      birth: birth,
      gender: Number(gender), // 남자 0, 여자 1
      role: role || "user", // 기본
    });

    await newUser.save(); // 저장도 await를 사용하여 동기 처리

    res.status(201).json({
      msg: "성공적으로 회원가입 되었습니다.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "서버 오류" });
  }
};

// jwt에는 절대 개인정보를 넣지 말것
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      // 이메일이 존재하지 않는 경우
      return res
        .status(401)
        .json({ msg: "이메일 또는 비밀번호가 틀렸습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password); // 해시된 비밀번호 비교

    if (!isMatch) {
      // 비밀번호가 틀린 경우
      res.status(401).json({ msg: "이메일 또는 비밀번호가 틀렸습니다." });
      return;
    }

    // jwt 토큰 발급
    // expiredIn은 토큰의 수명
    const token = jwt.sign({ oId: user._id }, JWT_SECRET, {
      expiresIn: "240h",
    });

    // 쿠키에 jwt 토큰 저장
    // maxAge는 쿠키의 유효기간. 이중 안전 장치로 사용
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    }); // httpOnly와 secure 옵션 설정
    // maxAge는 상수로 표현하는 것도 좋음.

    res.status(201).json({
      msg: "로그인 성공",
      data: {
        user: {
          role: user.role,
          id: user._id,
        },
      }, // 쿠키에 저장된 토큰 정보
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "서버 오류" });
  }
};

const logout = (req, res) => {
  // 로그아웃은 쿠키를 삭제하는 것으로 처리
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // HTTPS를 사용하는 경우 true로 설정
  });
  res.status(200).json({ msg: "로그아웃 성공" });
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user, "-password -__v"); // 비밀번호와 버전 정보 제외

    res.json({
      user: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};
/* 
  유저 정보 들어오는 api는 2개로 만드는게 좋을 것
  1. 통상적으로 사용 될 유저 정보를 줄 api (이메일, 닉네임 등)
  2. 유저 정보 수정할 때 사용할 api (디테일 한 정보)

  token만 활용해서 정보를 받을 때는 확실하게 인증하기 애매함
  따라서 token + 비밀번호 / token + 이메일 과 같이 2개의 정보를 같이 확인하여 검증하도록 하는게 좋음
  
*/

const getUserDetail = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password); // 해시된 비밀번호 비교
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
    }

    return res.status(200).json({
      user: {
        email: user.email,
        name: user.name,
        birth: user.birth,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "서버 오류" });
  }
};

const addProfileImage = async (req, res) => {
  const imageUrl = req.file ? req.file.location : null; // multer를 통해 업로드된 이미지 URL

  if (!imageUrl) {
    return res.status(400).json({ message: "이미지를 업로드해야 합니다." });
  }

  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    user.profileImage = req.file.filename; // 프로필 이미지 URL 업데이트
    await user.save();

    return res
      .status(200)
      .json({ message: "프로필 이미지가 업데이트되었습니다.", user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

const updateProfile = async (req, res) => {
  const data = req.body;
  const id = req.params.id || req.user; // URL 파라미터에서 ID를 가져오거나, 인증된 사용자 ID 사용
  try {
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json({
      message: "프로필이 업데이트되었습니다.",
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password -__v"); // 비밀번호와 버전 정보 제외

    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id, "-password -__v"); // 비밀번호와 버전 정보 제외
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json({ message: "사용자가 삭제되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

module.exports = {
  signUp,
  signIn,
  getUser,
  getUserDetail,
  addProfileImage,
  updateProfile,
  logout,
  getAllUsers,
  getUserById,
  deleteUser,
};
