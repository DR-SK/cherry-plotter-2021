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

      return inventory[0].inventory;
    } else if (action === "investigate") {
      console.log(action);
      const { rows: investigate } = await pool.query(
        `
        SELECT 
          items.name AS items,
          npcs.name AS npcs
        FROM 
          game_items
        JOIN 
          game_npcs
          ON game_items.game_id = game_npcs.game_id
        JOIN 
          items
          ON game_items.item_id = items.item_id
        JOIN
          npcs
          ON game_npcs.npc_id = npcs.npc_id
        WHERE game_items.game_id = $1
        AND game_items.room_id = $2
        AND items.actions && '{${action}}'::text[]
        OR npcs.actions && '{${action}}'::text[]
        `,
        [gameId, roomId]
      );

      // this query needs to be updated: an error with the OR statement

      return _.values(investigate[0]);
    } else if (action === "movement") {
      const { rows: movement } = await pool.query(
        `
        SELECT
          ARRAY(SELECT 
              rooms.name
            FROM rooms
            WHERE north!='null'
            UNION
            SELECT 
              rooms.name
            FROM rooms
            WHERE east!='null'
            UNION
            SELECT 
              rooms.name
            FROM rooms
            WHERE south!='null'
            UNION
            SELECT 
              rooms.name
            FROM rooms
            WHERE west!='null'
            ) rooms
        FROM rooms
        JOIN 
          game_users
          ON game_users.current_location = rooms.name
        WHERE rooms.room_id = $1
        AND 
          game_users.game_id = $2
        LIMIT 1
      `,
        [roomId, gameId]
      );

      return movement[0].rooms;
    } else if (action === "attack") {
      const { rows: attack } = await pool.query(
        `
        SELECT 
          ARRAY_AGG(npcs.name) AS npcs
        FROM 
          npcs
        JOIN 
          rooms
          ON npcs.room_id = rooms.room_id
        JOIN 
          game_users
          ON rooms.name = game_users.current_location
        WHERE game_users.game_id = $1
        AND rooms.room_id = $2
        AND actions && '{${action}}'::text[]
        `,
        [gameId, roomId]
      );

      return attack[0].npcs;
    } else if (action === "hack") {
      const { rows: hack } = await pool.query(
        `
        SELECT 
          ARRAY_AGG(npcs.name) AS npcs
        FROM 
          npcs
        JOIN 
          rooms
          ON npcs.room_id = rooms.room_id
        JOIN 
          game_users
          ON rooms.name = game_users.current_location
        WHERE game_users.game_id = $1
        AND rooms.room_id = $2
        AND actions && '{${action}}'::text[]
        `,
        [gameId, roomId]
      );

      return hack[0];
    }
  },
};

// -- * clicking on INVESTIGATE shows a list of things you can investigate (items, npcs)
// -- * clicking on a target prints the item or npc description to the game instructions box
// -- * if the target is an item, replaces the verbs with "pick up"
// --    * if you pick up an item, ~somehow remove the actions[] options for it~
// -- * if the target is an npc, revert to the base verb panel
