const ApiError = require("./../utils/ApiError");

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originUrl}`);
  next(error);
};
module.exports = notFound;
