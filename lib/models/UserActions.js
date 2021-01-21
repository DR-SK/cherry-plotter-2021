const pool = require("../utils/pool");
const _ = require("lodash");
const Inventory = require("./Inventory");

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
      WHERE game_items.room_id = 1
      AND game_items.game_id = $1
      `,
      [gameId]
    );

    // missing npc data
    return _.uniq(
      _.concat(["inventory"], rows[0].items, rows[1].items),
      rows[0].npcs,
      rows[1].npcs
    );
  },

  async createActionTargets(action, gameId) {
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
      // "pick%20up" in the url
    } else if (action === "pick up") {
      const { rows: pickup } = await pool.query(
        `
        SELECT 
          ARRAY_AGG(items.name) AS items
        FROM 
          items
        JOIN 
          game_items
          ON items.item_id = game_items.item_id
        JOIN
          rooms
          ON game_items.room_id = rooms.room_id
        WHERE game_items.game_id = $1
        AND rooms.room_id = 1
        AND game_items.actions && '{${action}}'::text[]
        `,
        [gameId]
      );

      return pickup[0].items;
    } else if (action === "use") {
      const { rows: use } = await pool.query(
        `
        SELECT 
          ARRAY_AGG(items.name) AS items
        FROM 
          items
        JOIN 
          game_items
          ON items.item_id = game_items.item_id
        JOIN
          rooms
          ON game_items.room_id = rooms.room_id
        WHERE game_items.game_id = $1
        AND rooms.room_id = 1
        AND game_items.actions && '{${action}}'::text[]
        `,
        [gameId]
      );

      return use[0].items;
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
        AND game_items.room_id = 1
        AND game_items.actions && '{${action}}'::text[]
        `,
        [gameId]
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
        WHERE rooms.room_id = 1
        AND 
          game_users.game_id = $1
        `,
        [gameId]
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
        AND rooms.room_id = 1
        AND actions && '{${action}}'::text[]
        `,
        [gameId]
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
        AND rooms.room_id = 1
        AND actions && '{${action}}'::text[]
        `,
        [gameId]
      );

      return hack[0].npcs;
    }
  },

  async performAction(action, target, gameId, userId) {
    switch (action) {
      case "pick up": {
        // add to inventory
        Inventory.addToInventory(gameId, userId, target);

        // get the target's item_id
        const { rows: item } = await pool.query(
          `
          SELECT 
            items.item_id,
            items.room_id
          FROM 
            items
          JOIN
            game_items
            ON game_items.item_id = items.item_id
          WHERE items.name = $1 
          AND game_items.game_id = $2
          AND game_items.room_id = 1
          `,
          [target, gameId]
        );

        // remove ${action} from game_items.actions
        const { rows: action } = await pool.query(
          `
          UPDATE
            game_items
          SET 
            actions = ARRAY_REMOVE(actions, $1)
          WHERE game_id = $2
          AND room_id = 1
          AND item_id = $3
          RETURNING *
          `,
          [action, gameId, item[0].item_id]
        );

        return action[0].actions;
      }
      case "inventory": {
        // return inventory needs a gameId and userId
        const { rows: user } = await pool.query(
          `
          SELECT 
          game_user_id
          FROM
          game_users
          WHERE game_id = $1
          `,
          [gameId]
        );

        const userId = user[0].user_id;

        Inventory.viewInventory(gameId, userId);

        // return
        break;
      }
      default:
      // if there is no match, the default code block is executed
    }
  },
};
