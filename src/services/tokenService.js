const crypto = require("crypto");
const RefreshToken = require("../models/refreshToken");
const User = require("../models/User");
const env = require("../config/env");
const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");
const toPublicUser = require("../utils/toPublicUser");
const { hashToken, createRefreshTokenValue } = require("../utils/refreshToken");

const ttlMs = () => env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;

const revokeFamily = (familyId) =>
  RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { revokedAt: new Date() },
  );

const startSession = async (userId, meta = {}) => {
  const { rawToken, tokenHash } = createRefreshTokenValue();

  await RefreshToken.create({
    userId,
    tokenHash,
    familyId: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + ttlMs()),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return rawToken;
};

const rotateSession = async (rawToken, meta = {}) => {
  const now = new Date();
  const tokenHash = hashToken(rawToken);
  const next = createRefreshTokenValue();

  const claimed = await RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null, expiresAt: { $gt: now } },
    { revokedAt: now, replacedByHash: next.tokenHash },
  );

  if (!claimed) {
    const existing = await RefreshToken.findOne({ tokenHash });

    if (!existing || existing.expiresAt <= now) {
      throw new ApiError(401, "Session expired. Please log in again.");
    }

    const rotatedRecently =
      existing.replacedByHash &&
      now - existing.revokedAt < env.refreshGraceSeconds * 1000;

    if (rotatedRecently) {
      throw new ApiError(409, "Session was just refreshed. Retry the request.");
    }

    await revokeFamily(existing.familyId);
    logger.warn(
      `Refresh token reuse detected: revoked family ${existing.familyId} for user ${existing.userId}`,
    );
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  const user = await User.findById(claimed.userId);
  if (!user) {
    await revokeFamily(claimed.familyId);
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  await RefreshToken.create({
    userId: user._id,
    tokenHash: next.tokenHash,
    familyId: claimed.familyId,
    expiresAt: new Date(now.getTime() + ttlMs()),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return {
    user: toPublicUser(user),
    accessToken: generateToken(user._id),
    refreshToken: next.rawToken,
  };
};

const endSession = async (rawToken) => {
  if (!rawToken) return;
  const existing = await RefreshToken.findOne({
    tokenHash: hashToken(rawToken),
  });
  if (existing) await revokeFamily(existing.familyId);
};

const endAllSessions = (userId) =>
  RefreshToken.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() },
  );

module.exports = { startSession, rotateSession, endSession, endAllSessions };
