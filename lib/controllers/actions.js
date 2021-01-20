const { Router } = require("express");
const UserActions = require("../models/UserActions");

module.exports = Router().get("/:gameId/:roomId", (req, res, next) => {
  UserActions.getOptions(req.params.gameId, req.params.roomId)
    .then((data) => res.send(data))
    .catch(next);
});
