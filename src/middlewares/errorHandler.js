const env = require("./../config/env");
const logger = require('./../config/logger');

const MapErrorToApiError = (err) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return {
      statusCode: 400,
      message: messages.join(', '),
    };
  }
  if (err.name === 'CastError') {
    return {
      statusCode: 400,
      message: `Invalid ${err.path}: ${err.value}`,
    };
  }
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return {
      statusCode: 400,
      message: `Duplicate value for field ${field}: ${err.keyValue[field]}`,
    };
  }
  return {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error',
  }
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = MapErrorToApiError(err);
  logger.error(`${req.method } ${req.originalUrl} -> ${message}`);

  res.status( statusCode ).json({
    success: false,
    message,
    stack: env.nodeEnv === "development" ? err.stack : undefined,
  });
};
module.exports = errorHandler;

