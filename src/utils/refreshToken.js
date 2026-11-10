const crypto = require("crypto");

const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

const createRefreshTokenValue = () => {
  const rawToken = crypto.randomBytes(48).toString("base64url");
  return {
    rawToken,
    tokenHash: hashToken(rawToken),
  };
};

module.exports = { hashToken, createRefreshTokenValue };
