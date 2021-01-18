const pool = require("../utils/pool");

module.exports = {
  async newGame(userId) {
    // Creating a client ensures that all postgres queries are fed through the same pipeline
    const client = await pool.connect();

    try {
      // newGame first creates a new game_instance, then uses that new game_id to create all other game items at pristine state
      let { rows: newGameId } = await client.query(
        `
            INSERT INTO game_instances (game_completed)
            VALUES (false)
            RETURNING game_id
          `
      );

      newGameId = newGameId[0].game_id;

      // Create a new game_users instance, specifying the game_id
      // Tech debt: when we add sockets, we'll need to pass the socket_uuid to the user who creates a new game
      await client.query(
        `
          INSERT INTO game_users (
              game_id,
              game_user_id, 
              socket_uuid, 
              current_location, 
              hp, 
              base_atk, 
              inventory)
          VALUES  ($1, $2, 1, 'entrance-hall', 20, 3, '{}')
        `,
        [newGameId, userId]
      );

      // Grab the room_id for the game_user's starting location
      let { rows: roomId } = await client.query(
        `
          SELECT 
            room_id 
          FROM
            rooms
          JOIN 
            game_users
          ON 
            game_users.current_location = rooms.name
          WHERE
            game_users.game_user_id = $1
          AND
            game_users.game_id = $2
          `,
        [userId, newGameId]
      );

      roomId = roomId[0].room_id;

      // Populate all game_items, constrained by game_id and room_id
      // VALUES ($1, $2, $3) will need to be repeated for as many items as there are in the entire game
      // Error handling: item_id must exist
      await client.query(
        `
          INSERT INTO game_items (
            item_id, 
            game_id, 
            room_id)
          VALUES (1, $1, $2)
          RETURNING *
        `,
        [newGameId, roomId]
      );

      // Populate all game_events, constrained by game_id and room_id
      // VALUES ($1, $2, $3) must be repeated for every event in the entire game
      // Error handling: event_id must exist
      await client.query(
        `
          INSERT INTO game_events (
            event_id, 
            game_id, 
            room_id)
          VALUES (1, $1, $2)
          RETURNING *
          `,
        [newGameId, roomId]
      );

      // Populate all game_events, constrained by game_id and room_id
      // Return the game_id to the user, so that this unique identifier can be manually shared among players
      const { rows } = await client.query(
        `
          INSERT INTO game_npcs (
            npc_id, 
            game_id, 
            room_id, 
            dialogue_exhausted, 
            alive)
          VALUES  (1, $1, $2, false, true)
          RETURNING game_id
          `,
        [newGameId, roomId]
      );

      return rows[0];
    } catch (err) {
      throw new Error(err);
    } finally {
      client.release();
    }
  },

  // joinGame creates a new game_users instance, constrained by the game_id
  // Perhaps the socket_uuid should also belong to the game_instances table, having game_users reference it
  // Tech debt: if the existing game's party has moved beyond the starting location, a new user either shouldn't be able to join, or should join the current room (curent_location)
  // Tech debt: the game_user_id should be derived from the requesting user, on a lookup by username
  // Error handling: catch cases in which a user queries a game_id that doesn't exist
  async joinGame(gameId, userId) {
    const { rows } = await pool.query(
      `
      INSERT INTO game_users (
        game_id, 
        game_user_id, 
        socket_uuid, 
        current_location, 
        hp, 
        base_atk, 
        inventory)
      VALUES  ($1, $2, 1, 'entrance-hall', 20, 3, '{}')
      RETURNING game_id
    `,
      [gameId, userId]
    );

    return rows[0];
  },
};
