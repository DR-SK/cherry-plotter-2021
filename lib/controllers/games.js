const { Router } = require("express");
const Game = require("../models/Game");
const ensureAuth = require("../middleware/ensure-auth");

module.exports = Router()
  // add ensureAuth
  .get("/new/:id", ensureAuth, (req, res, next) => {
    Game.newGame(req.user.id)
      .then((data) => res.send(data))
      .catch(next);
  })

  .get("/join/:gameId/:userId", (req, res, next) => {
    Game.joinGame(req.params.gameId, req.params.userId)
      .then((data) => res.send(data))
      .catch(next);
  });
