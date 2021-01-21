const { Router } = require("express");
const ensureAuth = require("../middleware/ensure-auth");
const UserActions = require("../models/UserActions");

module.exports = Router()
  .post("/list", ensureAuth, (req, res, next) => {
    UserActions.createUserActions(req.body.gameId)
      .then((data) => res.send(data))
      .catch(next);
  })

  .post("/targets", ensureAuth, (req, res, next) => {
    UserActions.createActionTargets(
      req.body.action,
      req.body.gameId,
      req.body.roomId
    )
      .then((data) => res.send(data))
      .catch(next);
  })

  .post("/perform", ensureAuth, (req, res, next) => {
    UserActions.performAction(
      req.body.action,
      req.body.target,
      req.body.gameId,
      req.user.userId
    )
      .then((data) => res.send(data))
      .catch(next);
  });
