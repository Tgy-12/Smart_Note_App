const env = require('./../config/env');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign( {userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn,
    });
};
module.exports = generateToken;
