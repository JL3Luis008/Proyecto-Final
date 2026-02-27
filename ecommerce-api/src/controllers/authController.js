import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const generateToken = (userId, displayName, role) => {
  return jwt.sign({ userId, displayName, role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (userId, displayName, role) => {
  return jwt.sign(
    { userId, displayName, role },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

const generatePassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const checkUserExist = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

async function register(req, res, next) {
  try {
    const { displayName, email, password, role } = req.body;

    const userExist = await checkUserExist(email);
    if (userExist) {
      return res.status(400).json({ message: "User already exist" });
    }

    // Validar rol permitido
    const validRoles = ["guest", "admin", "customer"];
    const userRole = validRoles.includes(role) ? role : "guest";

    const hashPassword = await generatePassword(password);

    const newUser = new User({
      displayName,
      email,
      hashPassword,
      role: userRole,
    });

    await newUser.save();
    res.status(201).json({ displayName, email, role: userRole });
  } catch (error) {
    next(error);
  }
}


async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const userExist = await checkUserExist(email);
    if (!userExist) {
      return res
        .status(400)
        .json({ message: "User does not exist. You must to sign in" });
    }
    const isMatch = await bcrypt.compare(password, userExist.hashPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(
      userExist._id,
      userExist.displayName,
      userExist.role,
    );
    const refreshToken = generateRefreshToken(
      userExist._id,
      userExist.displayName,
      userExist.role,
    );
    res.status(200).json({ token, refreshToken });
  } catch (error) {
    next(error);
  }
}

async function checkEmail(req, res, next) {
  try {
    const email = String(req.query.email || "")
      .trim()
      .toLowerCase();

    const user = await User.findOne({ email });
    res.json({ taken: !!user });
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const token = req.body.refreshToken;
    if (!token)
      return res.status(401).json({ message: "No refresh token provided" });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const newAccessToken = generateToken(
        decoded.userId,
        decoded.displayName,
        decoded.role,
      );

      // OPCIONAL
      const newRefreshToken = generateRefreshToken(
        decoded.userId,
        decoded.displayName,
        decoded.role,
      );

      res
        .status(200)
        .json({ token: newAccessToken, refreshToken: newRefreshToken });
    });
  } catch (error) {
    next(error);
  }
}

export { checkEmail, login, register, refreshToken };