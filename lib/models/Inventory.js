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

  // addToInventory allows a user to add an item to their inventory, then returns their updated inventory
  async addToInventory(gameId, gameUserId, itemName) {
    const client = await pool.connect();

    try {
      // First, we need to grab the item's room_id, constrained by the current game_id and searched on the item's name
      // Potential refactor: allow fuzzy searching
      // Error handling: if no item by that name exists or no rows are returned, notify the user
      const { rows: room } = await client.query(
        `
      SELECT
          game_items.room_id,
          rooms.name
      FROM 
          items
      JOIN
          game_items
          ON game_items.item_id = items.item_id
      JOIN 
          rooms
          ON game_items.room_id = rooms.room_id
      WHERE 
          items.name = $1
      AND
          game_items.game_id = $2
      `,
        [itemName, gameId]
      );

      const roomId = room[0]?.room_id;
      const roomName = room[0]?.name;

      // Using the room_id grabbed above, check that the game_user's current_location matches the room_id
      // Users should not be able to pick up items from rooms they are not in

      await client.query(
        `
      SELECT
        game_items.item_id,
        items.name AS item_name
      FROM 
        rooms
      JOIN
        game_users
        ON game_users.current_location = rooms.name
      JOIN
        game_items
        ON game_users.game_id = game_items.game_id
      JOIN 
        items
        ON items.item_id = game_items.item_id
      WHERE game_users.game_id = $1
      AND game_users.current_location = $2
      `,
        [gameId, roomName]
      );

      // If all checks pass, add the item to the user's inventory
      await client.query(
        `
      UPDATE 
          game_users
      SET 
          inventory = inventory || '{ ${itemName} }'
      WHERE 
          game_users.game_user_id = $1
      `,
        [gameUserId]
      );

      // Remove the item from the room
      await client.query(
        `
        DELETE FROM game_items 
        WHERE room_id = $1
        AND game_id = $2
      `,
        [roomId, gameId]
      );

      // Return the user's inventory
      const { rows } = await client.query(
        `
      SELECT 
          inventory 
      FROM 
          game_users
      WHERE 
          game_users.game_user_id = $1
      `,
        [gameUserId]
      );

      return rows[0];
    } catch (err) {
      throw new Error(err);
    } finally {
      client.release();
    }
  },

  // removeFromInventory removes an item from a player's inventory and returns the user's inventory
  async removeFromInventory(gameId, gameUserId, itemName) {
    await pool.query(
      `
      UPDATE 
        game_users
      SET 
        inventory = ARRAY_REMOVE(inventory, $1)
      WHERE 
        game_users.game_user_id = $2
      AND 
        game_users.game_id = $3
      `,
      [itemName, gameUserId, gameId]
    );

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
