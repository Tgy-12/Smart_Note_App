const mongoose = require("mongoose");
const env = require("./env");
const logger = require('./logger');

const connectDB = async() => {
    try {
    const conn = await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected successfully: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
       // process.exit(1);
    });

    mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });
} catch (error) {
    logger.error(`MongoDb initial connection failed: ${error.message}`);
    process.exit(1);
}
};

module.exports = connectDB;
