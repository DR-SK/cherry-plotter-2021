const fs = require("fs");
<<<<<<< Updated upstream
const pool = require("../lib/connection/pool");
=======
const pool = require("../lib/utils/pool");
>>>>>>> Stashed changes
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
    const { rows } = await pool.query("SELECT * FROM game_users");

    console.log(res.body);

    expect(res.body).toEqual({ inventory: ["key"] });
  });

  it("allows a user to view their inventory via GET", async () => {
    const { rows } = await pool.query("SELECT * FROM game_users");

    await request(app).post(`/inventory/${rows[0].game_id}/key`);

    const res = await request(app).post(`/inventory/${rows[0].game_id}`).send({
      userId: "2",
    });

    expect(res.body).toEqual({ inventory: ["key"] });
  });

  it("allows a user to remove an item from their inventory", async () => {
    const { rows } = await pool.query("SELECT * FROM game_users");

    const res = await request(app).delete(
      `/inventory/${rows[0].game_id}/${rows[0].game_user_id}/key`
    );

    expect(res.body).toEqual({ inventory: [] });
  });
});
