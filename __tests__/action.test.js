const fs = require("fs");
const pool = require("../lib/connection/pool");
const request = require("supertest");
const app = require("../lib/app");
const UserService = require("../lib/services/UserService");

describe.only("test actions test routes", () => {
  let user;
  const agent = request.agent(app);
  let newGame;

  beforeEach(async () => {
    await pool.query(fs.readFileSync("./sql/setup.sql", "utf-8"));
    await pool.query(fs.readFileSync("./sql/seed.sql", "utf-8"));

    user = await UserService.create({
      username: "username",
      password: "password",
    });

    await agent
      .post("/api/v1/auth/login")
      .send({ username: "username", password: "password" });

    newGame = await agent.get("/games/new");
  });

  afterAll(() => {
    return pool.query.end();
  });

  it("shows a user a list of possible actions", async () => {
    return agent
      .post("/actions/list")
      .send({
        gameId: newGame.body.game_id,
      })
      .then((res) => {
        expect(res.body).toEqual([
          "inventory",
          "attack",
          "hack",
          "investigate",
          "pick up",
          "use",
        ]);
      });
  });

  it("shows a user a list of possible targets", async () => {
    return agent
      .post("/actions/targets")
      .send({
        action: "inventory",
        gameId: newGame.body.game_id,
        roomId: newGame.body.room_id,
      })
      .then((res) => {
        expect(res.body).toEqual({ inventory: [] });
      });
  });

  it("shows a user a list of possible actions", async () => {
    return agent
      .post("/actions/perform")
      .send({
        action: "pick up",
        target: "grenade",
        gameId: newGame.body.game_id,
        userId: user.userId,
      })
      .then((res) => expect(res.body).toEqual(expect.anything()));
  });
});
