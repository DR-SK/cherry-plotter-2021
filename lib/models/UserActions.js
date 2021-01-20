const pool = require("../utils/pool");
const _ = require("lodash");

module.exports = {
  async createUserActions(roomId, gameId) {
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

  async createActionTargets(action, gameId, roomId) {
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
      const { rows: investigate } = await pool.query(
        `
        SELECT DISTINCT
          ARRAY(SELECT DISTINCT npcs.name
          FROM 
            game_npcs
          JOIN 
            npcs
            ON game_npcs.npc_id = npcs.npc_id) npcs
        FROM 
          game_items
        JOIN 
          game_npcs
          ON game_items.game_id = game_npcs.game_id
        WHERE game_items.game_id = $1
        AND game_items.room_id = $2
        AND game_npcs.actions && '{${action}}'::text[]
        UNION
        SELECT DISTINCT
          ARRAY(SELECT DISTINCT items.name
          FROM 
          items
          JOIN
          game_items
          ON items.item_id = game_items.item_id) items
        FROM 
          game_items
        JOIN 
          game_npcs
          ON game_items.game_id = game_npcs.game_id
        WHERE game_items.game_id = $1
        AND game_items.room_id = $2
        AND game_items.actions && '{${action}}'::text[]
      
        `,
        [gameId, roomId]
      );

      return investigate[0].npcs;
    } else if (action === "movement") {
      const { rows: movement } = await pool.query(
        `
        SELECT DISTINCT
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
      // this will need to be updated when hack information is added to the schema/seed files
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

  async performAction(action, gameId, roomId) {
    if (action === "inventory") {
      const { rows: inventory } = await pool.query(``, []);
      return inventory[0];
    } else if (action === "investigate") {
      const { rows: investigate } = await pool.query(``, []);
      return investigate[0];
    } else if (action === "movement") {
      const { rows: movement } = await pool.query(``, []);
      return movement[0];
    } else if (action === "attack") {
      const { rows: attack } = await pool.query(``, []);
      return attack[0];
    } else if (action === "hack") {
      const { rows: hack } = await pool.query(``, []);
      return hack[0];
    }
  },
};
