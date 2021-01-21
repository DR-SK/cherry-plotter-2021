const { Router } = require("express");
const ensureAuth = require("../middleware/ensure-auth");
const Game = require("../models/Game");
const ensureAuth = require("../middleware/ensure-auth");

module.exports = Router()
<<<<<<< HEAD
  // add ensureAuth, make this route a post route
  .get("/new/:id", (req, res, next) => {
    Game.newGame(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  })

  // add ensureAuth, make this a post route
  .get("/join/:gameId/:userId", (req, res, next) => {
    Game.joinGame(req.params.gameId, req.params.userId)
=======
  .get("/new/", ensureAuth, (req, res, next) => {
    Game.newGame(req.user.userId)
>>>>>>> 56f91ce6c7a5c724b492951b45eeb24e31ac373e
      .then((data) => res.send(data))
      .catch(next);
  });

// .get("/join/:gameId/:userId", (req, res, next) => {
//   Game.joinGame(req.params.gameId, req.params.userId)
//     .then((data) => res.send(data))
//     .catch(next);
// });
