const fs = require("fs");
const pool = require("../lib/connection/pool");
const request = require("supertest");
const app = require("../lib/app");
const UserService = require("../lib/services/UserService");

describe("test inventory routes", () => {
  let user;
  let agent = request.agent(app);

  beforeEach(async () => {
    await pool.query(fs.readFileSync("./sql/setup.sql", "utf-8"));
    await pool.query(fs.readFileSync("./sql/seed.sql", "utf-8"));
    user = await UserService.create({username:'username', password: 'password'});
    
   await agent 
  .post('/api/v1/auth/login')
  .send({username:'username', password: 'password'});
  
  await agent 
  .get('/games/new/')
  });

  afterAll(() => {
    return pool.query.end();
  });

  it.only("allows a user to add an item to their inventory", async () => {
    console.log('user', user);
    return agent 
    .post('/inventory')
    .send({
      gameId: 1,
      userId: user.userId,
      itemName: 'key'
    })
    .then(res => {
      expect(res.body).toEqual({inventory: ["key"]})
    })
  });

  it("allows a user to view their inventory via GET", async () => {
    const { rows } = await pool.query("SELECT * FROM game_users");

    await request(app).get(
      `/inventory/add/${rows[0].game_id}/${rows[0].game_user_id}/key`
    );

    const res = await request(app).get(
      `/inventory/view/${rows[0].game_id}/${rows[0].game_user_id}`
    );

    expect(res.body).toEqual({ inventory: ["key"] });
  });

  it("allows a user to remove an item from their inventory", async () => {
    const { rows } = await pool.query("SELECT * FROM game_users");

    const res = await request(app).get(
      `/inventory/remove/${rows[0].game_id}/${rows[0].game_user_id}/key`
    );

    expect(res.body).toEqual({ inventory: [] });
  });
});
