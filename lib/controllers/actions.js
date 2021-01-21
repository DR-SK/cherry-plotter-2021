const { Router } = require("express");
const UserActions = require("../models/UserActions");

module.exports = Router()
  .get("/:gameId/:roomId", (req, res, next) => {
    UserActions.createUserActions(req.params.gameId)
      .then((data) => res.send(data))
      .catch(next);
  })

  .get("/:action/:gameId", (req, res, next) => {
    UserActions.createActionTargets(req.params.action)
      .then((data) => res.send(data))
      .catch(next);
  })

  .get("/:action/:target/:gameId", (req, res, next) => {
    UserActions.performAction(
      req.params.action,
      req.params.target,
      req.params.gameId,
      req.params.userId
    )
      .then((data) => res.send(data))
      .catch(next);
  });
