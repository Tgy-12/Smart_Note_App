const IORedis = require("ioredis");
const env = require("./env");
const logger = require("./logger");

const rateLimitRedis = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: 2,
});

rateLimitRedis.on("error", (err) => {
  logger.error("Rate-limit Redis error: ${err.message}");
});

module.exports = rateLimitRedis;
