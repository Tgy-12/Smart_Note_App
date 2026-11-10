const env = require("./../config/env");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const generateToken = (userId) => {
  const jti = uuidv4(); // Generate a unique identifier for the token and jti stands
  const token = jwt.sign({ id: userId, jti }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
  return token;
};
module.exports = generateToken;
