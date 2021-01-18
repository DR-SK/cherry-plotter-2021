const { Router } = require("express");
const Game = require("../models/Game");

module.exports = Router()
  .get("/new/:id", (req, res, next) => {
    Game.newGame(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  })

  .get("/join/:gameId/:userId", (req, res, next) => {
    Game.joinGame(req.params.gameId, req.params.userId)
      .then((data) => res.send(data))
      .catch(next);
  });
