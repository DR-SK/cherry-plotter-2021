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
    expect(res.body).toEqual({ inventory: ["key"] });
  });
});
