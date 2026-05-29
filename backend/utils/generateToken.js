const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'skillissue_super_secret_jwt_key_2024';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

module.exports = generateToken;
