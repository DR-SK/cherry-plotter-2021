const { Router } = require("express");
const Game = require("../models/Game");

module.exports = Router().get("/new/:id", (req, res, next) => {
  Game.newGame(req.params.id)
    .then((data) => res.send(data))
    .catch(next);
});
