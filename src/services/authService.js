const fs = require("fs/promises");
const path = require("path");
const { User, RevokedToken } = require("../models/User");
//const Note = require('./../models/Note');
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

//for refresh token
const tokenService = require("./tokenService");
const toPublicUser = require("../utils/toPublicUser");

//register user service
const registerUser = async ({ name, email, password }, meta) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "The User with this account already existed");
  }
  const user = await User.create({ name, email, password });

  return {
    user: toPublicUser(user),
    accessToken: generateToken(user._id),
    refreshToken: await tokenService.startSession(user._id, meta),
  };
};
//log in user service
const loginUser = async ({ email, password }, meta) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user: toPublicUser(user),
    accessToken: generateToken(user._id),
    refreshToken: await tokenService.startSession(user._id, meta),
  };
};
//log out user service
const logoutUser = async (token) => {
  const decodedToken = jwt.decode(token);

  await RevokedToken.create({
    jti: decodedToken.jti,
    expiresAt: new Date(decodedToken.exp * 1000), // jwt exp is in seoconds
  });
};
const AVATAR_DIR = path.join(__dirname, "..", "..", "uploads", "avatars");
const updateProfileService = async (userId, { name, bio }) => {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

const uploadAvatarService = async (userId, file) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await fs.mkdir(AVATAR_DIR, { recursive: true });

  const extension = path.extname(file.originalname) || ".jpeg";
  const fileName = `${userId}-${Date.now()}${extension}`;
  const filePath = path.join(AVATAR_DIR, fileName);

  await fs.writeFile(filePath, file.buffer);

  if (user.avatarUrl) {
    const oldFileName = path.basename(user.avatarUrl);
    const oldFilePath = path.join(AVATAR_DIR, oldFileName);

    try {
      await fs.unlink(oldFilePath);
    } catch (err) {
      logger.warn(
        `Failed to delete old avatar at ${oldFilePath}: ${err.message}`,
      );
    }
  }
  user.avatarUrl = `/uploads/${fileName}`;
  await user.save();

  return user;
};

const refreshSession = (rawToken, meta) =>
  tokenService.rotateSession(rawToken, meta);
const logout = (rawToken) => tokenService.endSession(rawToken);
const logoutAll = (userId) => tokenService.endAllSessions(userId);

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  updateProfileService,
  uploadAvatarService,
  //new ones
  refreshSession,
  logout,
  logoutAll,
};
