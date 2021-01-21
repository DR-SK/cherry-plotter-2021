const { Router } = require("express");
const Game = require("../models/Game");
const ensureAuth = require("../middleware/ensure-auth");

module.exports = Router()
  // add ensureAuth, make this route a post route
  .get("/new/:id", (req, res, next) => {
    Game.newGame(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  })

  // add ensureAuth, make this a post route
  .get("/join/:gameId/:userId", (req, res, next) => {
    Game.joinGame(req.params.gameId, req.params.userId)
      .then((data) => res.send(data))
      .catch(next);
  });
