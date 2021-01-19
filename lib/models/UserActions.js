const pool = require('../utils/pool');
const _ = require('lodash');

module.exports = {

  async getOptions(roomId, gameId) {
    const { rows } = await pool.query(`
    SELECT DISTINCT 
	items.actions AS items,
	npcs.actions AS npcs
FROM items
JOIN
	npcs
	ON items.room_id = npcs.room_id
JOIN
	game_items
	ON npcs.room_id = game_items.room_id
WHERE items.room_id = $1
AND game_items.game_id = $2
 `,
    [roomId, gameId]);

    return _.concat(['inventory'], rows[0].items, rows[0].npcs);
 
  },










};
