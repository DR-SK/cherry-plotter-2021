const pool = require("../connection/pool");
const _ = require("lodash");
const Inventory = require("./Inventory");
const roll = require("../utils/dice-roll");

module.exports = {
  async createUserActions(gameId) {
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
      return Inventory.viewInventory(gameId, 1);

      // pick%20up in the url
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
    if (action === "pick up") {
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
      await pool.query(
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

      // add item to inventory
      Inventory.addToInventory(gameId, userId, target);

      return `${target} added to inventory`;
    } else if (action === "investigate") {
      // return items.description by items.name = target
      // investigate is an action that can be repeated
      const { rows: investigate } = await pool.query(
        `
        SELECT
          items.description
        FROM
          items
        JOIN
          game_items
          ON items.item_id = game_items.item_id
        WHERE items.name = $1 
        AND game_items.game_id = $2
        AND game_items.room_id = 1
        `,
        [target, gameId]
      );

      return investigate[0].description;
    } else if (action === "movement") {
      // update game_user's current_location = target
      // grab items on room_id = 2
      const { rows: movement } = await pool.query(
        `
        UPDATE game_users
        SET current_location = $1
        WHERE game_users.game_id = $2
        AND game_users.game_user_id = $3
        RETURNING current_location
        `,
        [target, gameId, userId]
      );

      return movement[0];
    } else if (action === "attack") {
      // perform a dice roll using the player's base_atk
      // get the player's base_atk
      let { rows: playerAttack } = await pool.query(
        `
      SELECT 
        base_atk
      FROM 
        game_users
      WHERE game_users.game_user_id = $1
      AND game_users.game_id = $2
      `,
        [userId, gameId]
      );

      // Player's base_atk becomes the number of d6 rolled
      playerAttack = roll([[playerAttack[0].base_atk, 6]]);

      // get the target's npc_id
      let { rows: npcId } = await pool.query(
        `
        SELECT 
          game_npcs.npc_id
        FROM 
          game_npcs
        JOIN
          npcs
          ON npcs.npc_id = game_npcs.npc_id
        WHERE game_npcs.game_id = $1
        AND npcs.name = $2
        `,
        [gameId, target]
      );

      npcId = npcId[0].npc_id;

      // the target's HP is decremented by the total of the roll
      let { rows: npcHP } = await pool.query(
        `
        UPDATE game_npcs
        SET hp=hp - $1
        WHERE game_npcs.game_id = $2
        AND game_npcs.npc_id = $3
        RETURNING hp
        `,
        [playerAttack, gameId, npcId]
      );

      npcHP = npcHP[0].hp;

      // check if the npc's HP is 0 or above; if true, they immediately attack back (using a dice roll against their base_atk)
      if (npcHP > 0) {
        // get the npc's base_atk
        let { rows: npcAttack } = await pool.query(
          `
          SELECT 
            base_atk
          FROM 
            npcs
          JOIN
            game_npcs 
            ON npcs.npc_id = game_npcs.npc_id
          WHERE game_npcs.npc_id = $1
          AND game_npcs.game_id = $2
          `,
          [npcId, gameId]
        );

        npcAttack = roll([[npcAttack[0].base_atk, 6]]);

        // decrement the player's HP
        let { rows: playerHP } = await pool.query(
          `
          UPDATE game_users
          SET hp=hp - $1
          WHERE game_users.game_id = $2
          AND game_users.game_user_id = $3
          RETURNING hp AS player_hp
          `,
          [npcAttack, gameId, userId]
        );

        return playerHP;

        // otherwise, the NPC is dead
      } else if (npcHP <= 0) {
        // update game_npcs to dead = true, return
        const { rows: status } = await pool.query(
          `
          UPDATE game_npcs
          SET alive=FALSE
          WHERE game_npcs.npc_id = $1
          AND game_npcs.game_id = $2
          RETURNING alive AS npc_alive
          `,
          [npcId, gameId]
        );

        // if the npc's HP is 0 or below, remove all actions from the target's possible actions
        await pool.query(
          `
          UPDATE game_npcs
          SET actions=NULL
          WHERE game_npcs.npc_id = $1
          AND game_npcs.game_id = $2
          `,
          [npcId, gameId]
        );

        return status[0];
      }

      let { rows: playerHP } = await pool.query(
        `
        SELECT 
          hp
        FROM 
          game_users
        WHERE game_users.game_user_id = $1
        AND game_users.game_id = $2
        RETURNING hp
        `,
        [userId, gameId]
      );

      playerHP = playerHP[0].hp;

      // if a player's HP is ever 0 or below, the game is over
      if (playerHP <= 0) {
        const { rows: gameOver } = await pool.query(
          `
          UPDATE game_instances
          SET game_over=TRUE
          WHERE game_instances.game_id = $1
          RETURNING game_over
          `,
          [gameId]
        );

        return gameOver[0];
      }
    } else if (action === "hack") {
      // lots of the same logic as "attack", but using base_hack, and without death conditions
      // perform a dice roll using the player's base_hack
      // if the player's base_hack + roll exceed's the target's base_hack, return a success (and remove hack from the list of npc actions)
      // otherwise, the target attacks you (with a dice roll, and decrements the player's HP)
    } else if (action === "use") {
      // using an item triggers returns its effect, and removes it from the room/the user's inventory
    }
  },
};
