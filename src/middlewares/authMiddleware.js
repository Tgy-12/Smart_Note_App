const jwt = require('jsonwebtoken');
const env = require('./../config/env');
const User = require('./../models/User');
const ApiError = require('./../utils/ApiError');
const asyncHandler = require('./../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, 'Not authorized, invalid or expired token');
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, 'Not authorized, user no longer exists');
  }

  req.user = { id: user._id, name: user.name, email: user.email };
  next();
});

module.exports = protect;
