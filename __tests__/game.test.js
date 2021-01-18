const fs = require("fs");
const pool = require("../lib/utils/pool");
const request = require("supertest");
const app = require("../lib/app");

describe("test inventory routes", () => {
  beforeEach(async () => {
    await pool.query(fs.readFileSync("./sql/setup.sql", "utf-8"));
    await pool.query(fs.readFileSync("./sql/game.test.sql", "utf-8"));
  });

  afterAll(() => {
    return pool.query.end();
  });

  it("allows a user to create a new game", async () => {
    const { rows } = await pool.query(`SELECT * FROM users`);

    const res = await request(app).get(`/games/new/${rows[0].user_id}`);

    expect(res.body).toEqual({ game_id: "1" });
  });

  it("allows a user to join an existing game", async () => {
    const { rows: user } = await pool.query(`SELECT * FROM users`);

    await request(app).get(`/games/new/${user[0].user_id}`);

    const { rows: game } = await pool.query(`SELECT * FROM game_users`);

    const res = await request(app).get(
      `/games/join/${game[0].game_id}/${game[0].game_user_id}`
    );

    expect(res.body).toEqual({ game_id: "1" });
  });
});
