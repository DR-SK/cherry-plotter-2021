const pool = require("../utils/pool");

// This module controls item-based actions, especially within a player's inventory
module.exports = {
  // viewInventory allows a user to see what is in their inventory
  // Tech debt: update what is returned from this function (currently an object with a key of "inventory" and containing an array)
  // Error handling: if a user's inventory is empty, tell them
  async viewInventory(gameId, gameUserId) {
    const { rows } = await pool.query(
      `
      SELECT 
          inventory
      FROM 
          game_users
      WHERE 
          game_users.game_user_id = $1
      AND 
          game_users.game_id = $2
    `,
      [gameUserId, gameId]
    );

    return rows[0];
  },
};
