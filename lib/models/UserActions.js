const pool = require("../utils/pool");
const _ = require("lodash");

module.exports = {
  async getOptions(roomId, gameId) {
    const { rows } = await pool.query(
      `
      SELECT DISTINCT 
      game_items.actions AS items,
      npcs.actions AS npcs
    FROM game_items
    JOIN
      npcs
      ON game_items.room_id = npcs.room_id
    WHERE game_items.room_id = $1
    AND game_items.game_id = $2
    `,
      [roomId, gameId]
    );

    return _.concat(["inventory"], rows[0].items, rows[0].npcs);
  },
  async getTargets(action, gameId, roomId) {
    if (action === "inventory") {
      const { rows: inventory } = await pool.query(
        `
        SELECT
          inventory
        FROM
          game_users
        WHERE
          game_users.game_id = $1
      `,
        [gameId]
      );

      return inventory[0];
    } else if (action === "investigate") {

    } else if (action === "movement") {

    } else if (action === "attack") {
      
    } else if (action === "hack")
};
