const pool = require('../lib/utils/pool');


module.exports = class User {
  userId;
  username;
  passwordHash;

  constructor(row) {
    this.userId = row.user_id;
    this.username = row.username;
    this.passwordHash = row.password_hash;
  }

  static async insert(user) {
    const { rows } = await pool.query(`
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING *
      `,
    [user.username, user.passwordHash]);
    
    return new User(rows[0]);
  }
};
