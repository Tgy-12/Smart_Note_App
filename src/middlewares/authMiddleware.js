const jwt = require("jsonwebtoken");
const env = require("./../config/env");
const { User, RevokedToken } = require("./../models/User");
const ApiError = require("./../utils/ApiError");
const asyncHandler = require("./../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const token = authHeader.split(" ")[1]; //splits the Bearer part

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new ApiError(401, "Not authorized, invalid or expired token");
  }
  const revoked = await RevokedToken.findOne({ jti: decoded.jti });
  if (revoked) {
    throw new ApiError(
      401,
      "This session has been logged out,plz log-in again.",
    );
  }
  const user = await User.findById(decoded.id).select("-password"); //selects all fields except password

  if (!user) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }

  req.user = { id: user._id, name: user.name, email: user.email };
  next();
});

module.exports = protect;
