const authServices = require("../services/authService");
const asyncHandler = require("./../utils/asyncHandler");
const ApiError = require("./../utils/ApiError");
const env = require("./../config/env");

const REFRESH_COOKIE = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.cookieSameSite,
  path: "/api/v1/auth",
};

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, {
    ...refreshCookieOptions,
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  });

const clearRefreshCookie = (res) =>
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);

const requestMeta = (req) => ({ userAgent: req.get("user-agent"), ip: req.ip });

const registerUserV = async (req, res) => {
  const { user, accessToken, refreshToken } = await authServices.registerUser(
    req.body,
    requestMeta(req),
  );

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    status: true,
    message: "user registered succefully",
    data: { user, token: accessToken },
  });
};

const loginUserV = async (req, res) => {
  const { user, accessToken, refreshToken } = await authServices.loginUser(
    req.body,
    requestMeta(req),
  );

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    status: true,
    message: "User logged in successfully",
    data: { user, token: accessToken },
  });
};
const logoutUserV = async (req, res) => {
  const { token } = req.body;
  await authServices.logoutUser(token);
  clearRefreshCookie(res);
  res.status(200).json({
    status: true,
    message: "Logged out successfully",
    data: null,
  });
};
const updateProfileV = async (req, res) => {
  const { name, bio } = req.body;
  const user = await authServices.updateProfileService(req.user.id, {
    name,
    bio,
  });
  res.status(200).json({
    status: true,
    message: "Profile updated successfully.",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    },
  });
};

const uploadAvatarV = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No image file provided.");
  }
  const user = await authServices.uploadAvatarService(req.user.id, req.file);
  res.status(200).json({
    status: true,
    message: "Avatar uploaded successfully.",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    },
  });
};
//added for refresh and acce tokens
const refreshV = async (req, res) => {
  const rawToken = req.cookies[REFRESH_COOKIE];
  if (!rawToken) throw new ApiError(401, "No active session");

  try {
    const { user, accessToken, refreshToken } =
      await authService.refreshSession(rawToken, requestMeta(req));
    setRefreshCookie(res, refreshToken);
    res.set("Cache-Control", "no-store");
    res.status(200).json({
      status: true,
      message: "Session refreshed",
      data: { user, token: accessToken },
    });
  } catch (error) {
    if (error.statusCode === 401) clearRefreshCookie(res);
    throw error;
  }
};
const logoutV = async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.status(200).json({ status: true, message: "Logged out" });
};

const logoutAllV = async (req, res) => {
  await authService.logoutAll(req.user.id);
  clearRefreshCookie(res);
  res.status(200).json({ status: true, message: "Logged out of all devices" });
};
//const registerUser = asyncHandler(registerUserV)
module.exports = {
  registerUser: asyncHandler(registerUserV),
  loginUser: asyncHandler(loginUserV),
  logoutUser: asyncHandler(logoutUserV),
  updateProfile: asyncHandler(updateProfileV),
  uploadAvatar: asyncHandler(uploadAvatarV),
  refresh: asyncHandler(refreshV),
  logout: asyncHandler(logoutV),
  logoutAll: asyncHandler(logoutAllV),
};
