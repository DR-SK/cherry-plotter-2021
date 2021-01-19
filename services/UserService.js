const User = require("../models/User");
const bcrypt = require("bcryptjs");
// const jwt = require('jsonwebtoken');

module.exports = {
  async create({ username, password }) {
    const passwordHash = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    const user = await User.insert({ username, passwordHash });
    return user;
  },
};
