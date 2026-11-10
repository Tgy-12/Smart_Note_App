const { Queue } = require("bullmq");
const connection = require("./../config/redis");

const embeddingQueue = new Queue("embedding", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  },
});
module.exports = embeddingQueue;
