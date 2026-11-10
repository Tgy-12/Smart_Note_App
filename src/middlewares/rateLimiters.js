const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redisRateLimit");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

const createLimiter = ({ prefix, windowMs, limit, message, keyGenerator }) => {
  const options = {
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    passOnStoreError: true,
    store: new RedisStore({
      prefix: `rl:${prefix}:`,
      sendCommand: (...args) => redisClient.call(...args),
    }),
    handler: (req, res, next, limiterOptions) => {
      logger.warn(
        `Rate limit hit [${prefix}] caller=${req.user?.id || req.ip} ${req.method} ${req.originalUrl}`,
      );
      next(new ApiError(limiterOptions.statusCode, message));
    },
  };

  if (keyGenerator) {
    options.keyGenerator = keyGenerator;
  }

  return rateLimit(options);
};

const byUser = (req) => req.user.id.toString();
const constantKey = () => "all-users";

const globalLimiter = createLimiter({
  prefix: "global",
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: "Too many requests. Please try again later.",
});

const authLimiter = createLimiter({
  prefix: "auth",
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

const searchLimiter = createLimiter({
  prefix: "search",
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: byUser,
  message: "Too many searches. Please slow down.",
});

const aiUserLimiter = createLimiter({
  prefix: "ai-user",
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: byUser,
  message: "You are asking too quickly. Please wait a minute and try again.",
});

const aiGlobalLimiter = createLimiter({
  prefix: "ai-global",
  windowMs: 60 * 1000,
  limit: 25,
  keyGenerator: constantKey,
  message: "The answer service is busy right now. Please try again shortly.",
});

const uploadLimiter = createLimiter({
  prefix: "upload",
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: byUser,
  message: "Upload limit reached. Please try again later.",
});

const refreshLimiter = createLimiter({
  prefix: "refresh",
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: byUser,
  message: "Too many refresh requests. Please try again later.",
});

module.exports = {
  globalLimiter,
  authLimiter,
  searchLimiter,
  aiUserLimiter,
  aiGlobalLimiter,
  uploadLimiter,
  refreshLimiter,
};
