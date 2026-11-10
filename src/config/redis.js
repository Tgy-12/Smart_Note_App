const IORedis = require("ioredis"); //IORedis is a robust Redis client for Node.js that supports advanced features like clustering, sentinel, and pipelining. It provides a simple and efficient way to interact with Redis servers.
const env = require("./env");
//const logger = require("./logger");

const connection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });

module.exports = connection;
