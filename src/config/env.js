require("dotenv").config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,

  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  //for refresh token
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 7,
  refreshGraceSeconds: Number(process.env.REFRESH_GRACE_SECONDS) || 10,
  cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

module.exports = env;
