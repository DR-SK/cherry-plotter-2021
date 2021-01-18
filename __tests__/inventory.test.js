const fs = require("fs");
const pool = require("../lib/utils/pool");
const request = require("supertest");
const app = require("../lib/app");

describe("test inventory routes", () => {
  beforeEach(async () => {
    await pool.query(fs.readFileSync("./sql/setup.sql", "utf-8"));
    await pool.query(fs.readFileSync("./sql/inventory.test.sql", "utf-8"));
  });

  afterAll(() => {
    return pool.query.end();
  });

  it("allows a user to add an item to their inventory", async () => {
    const { rows } = await pool.query(`SELECT * FROM game_users`);

    const res = await request(app).get(
      `/inventory/add/${rows[0].game_id}/${rows[0].game_user_id}/key`
    );

    expect(res.body).toEqual({ inventory: ["key"] });
  });

  it("allows a user to view their inventory via GET", async () => {
    const { rows } = await pool.query(`SELECT * FROM game_users`);

    await request(app).get(
      `/inventory/add/${rows[0].game_id}/${rows[0].game_user_id}/key`
    );

    const res = await request(app).get(
      `/inventory/view/${rows[0].game_id}/${rows[0].game_user_id}`
    );

    expect(res.body).toEqual({ inventory: ["key"] });
  });

  it("allows a user to remove an item from their inventory", async () => {
    const { rows } = await pool.query(`SELECT * FROM game_users`);

    const res = await request(app).get(
      `/inventory/remove/${rows[0].game_id}/${rows[0].game_user_id}/key`
    );

    expect(res.body).toEqual({ inventory: [] });
  });
});
